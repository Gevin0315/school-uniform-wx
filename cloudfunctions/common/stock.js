const {
  getCatalog,
  SET_COMPONENTS,
  deductSkuStockBatch,
} = require('./seed');

/**
 * 将订单行展开为实际扣减的 component/single SKU 列表
 */
function expandOrderItemsToDeductions(items, catalog) {
  const productsById = new Map(
    (catalog.products || []).map((p) => [p.productId, p])
  );
  const skusByProductSize = new Map();
  for (const sku of catalog.skus || []) {
    skusByProductSize.set(`${sku.productId}:${sku.size}`, sku);
  }

  const lines = [];

  for (const item of items) {
    const qty = Number(item.qty) || 1;
    if (qty <= 0) {
      throw new Error('INVALID_QTY');
    }
    const product = productsById.get(item.productId);
    if (!product) {
      throw new Error(`UNKNOWN_PRODUCT:${item.productId}`);
    }
    const size = Number(item.size);
    if (!size) {
      throw new Error('MISSING_SIZE');
    }

    if (product.type === 'set') {
      const componentProductIds = SET_COMPONENTS[item.productId];
      if (!componentProductIds || componentProductIds.length === 0) {
        throw new Error(`SET_COMPONENTS_MISSING:${item.productId}`);
      }
      for (const compProductId of componentProductIds) {
        const compSku = skusByProductSize.get(`${compProductId}:${size}`);
        if (!compSku) {
          throw new Error(`COMP_SKU_NOT_FOUND:${compProductId}:${size}`);
        }
        lines.push({
          skuId: compSku.skuId,
          productId: compProductId,
          qty,
          fromSetProductId: item.productId,
          saleLineSkuId: item.skuId,
        });
      }
    } else if (product.type === 'single') {
      const sku =
        (catalog.skus || []).find((s) => s.skuId === item.skuId) ||
        skusByProductSize.get(`${item.productId}:${size}`);
      if (!sku) {
        throw new Error(`SKU_NOT_FOUND:${item.skuId}`);
      }
      lines.push({
        skuId: sku.skuId,
        productId: item.productId,
        qty,
        fromSetProductId: null,
        saleLineSkuId: item.skuId,
      });
    } else {
      throw new Error(`UNSUPPORTED_PRODUCT_TYPE:${product.type}`);
    }
  }

  return aggregateDeductionLines(lines);
}

function aggregateDeductionLines(lines) {
  const map = new Map();
  for (const line of lines) {
    const prev = map.get(line.skuId);
    if (prev) {
      prev.qty += line.qty;
      if (line.fromSetProductId) {
        prev.fromSetProductIds.add(line.fromSetProductId);
      }
    } else {
      map.set(line.skuId, {
        skuId: line.skuId,
        productId: line.productId,
        qty: line.qty,
        fromSetProductIds: line.fromSetProductId
          ? new Set([line.fromSetProductId])
          : new Set(),
      });
    }
  }
  return [...map.values()].map((row) => ({
    skuId: row.skuId,
    productId: row.productId,
    qty: row.qty,
    fromSetProductIds: [...row.fromSetProductIds],
  }));
}

function validateStockForDeductions(deductions, catalog) {
  const stockBySkuId = new Map(
    (catalog.skus || []).map((s) => [s.skuId, s.stock])
  );
  const failures = [];

  for (const row of deductions) {
    const available = stockBySkuId.get(row.skuId);
    if (available === undefined || available < row.qty) {
      failures.push({
        skuId: row.skuId,
        need: row.qty,
        available: available ?? 0,
        fromSetProductIds: row.fromSetProductIds,
      });
    }
  }

  if (failures.length > 0) {
    return {
      ok: false,
      code: 'INSUFFICIENT_STOCK',
      message: '库存不足，成套商品需各组件均有货，整单无法提交',
      failures,
    };
  }
  return { ok: true };
}

async function loadCatalogFromDb(db) {
  try {
    const productsCol = db.collection('products');
    const countRes = await productsCol.count();
    if (countRes.total === 0) {
      return null;
    }
    const [products, skus] = await Promise.all([
      productsCol.get(),
      db.collection('skus').get(),
    ]);
    return {
      products: products.data,
      skus: skus.data,
      setComponents: SET_COMPONENTS,
    };
  } catch (err) {
    console.warn('[stock] 读库失败', err);
    return null;
  }
}

async function deductStockInDb(db, deductions) {
  const failures = [];
  const snapshots = [];

  for (const row of deductions) {
    const res = await db.collection('skus').where({ skuId: row.skuId }).limit(1).get();
    const doc = res.data[0];
    const available = doc ? doc.stock : 0;
    if (!doc || available < row.qty) {
      failures.push({
        skuId: row.skuId,
        need: row.qty,
        available,
        fromSetProductIds: row.fromSetProductIds,
      });
    } else {
      snapshots.push({ _id: doc._id, skuId: row.skuId, stock: available, qty: row.qty });
    }
  }

  if (failures.length > 0) {
    return {
      ok: false,
      code: 'INSUFFICIENT_STOCK',
      message: '库存不足，成套商品需各组件均有货，整单无法提交',
      failures,
    };
  }

  for (const snap of snapshots) {
    await db
      .collection('skus')
      .doc(snap._id)
      .update({ data: { stock: snap.stock - snap.qty } });
  }

  return {
    ok: true,
    stockDeductions: snapshots.map((s) => ({
      skuId: s.skuId,
      qty: s.qty,
      stockBefore: s.stock,
      stockAfter: s.stock - s.qty,
    })),
  };
}

async function reserveAndDeductStock(db, items) {
  const dbCatalog = await loadCatalogFromDb(db);
  const catalog = dbCatalog || getCatalog();
  catalog.setComponents = SET_COMPONENTS;

  let deductions;
  try {
    deductions = expandOrderItemsToDeductions(items, catalog);
  } catch (err) {
    return {
      ok: false,
      code: 'INVALID_ITEMS',
      message: err.message || '商品行无效',
    };
  }

  if (dbCatalog) {
    return deductStockInDb(db, deductions);
  }

  const check = validateStockForDeductions(deductions, catalog);
  if (!check.ok) {
    return check;
  }

  const batch = deductSkuStockBatch(
    deductions.map((d) => ({ skuId: d.skuId, qty: d.qty }))
  );
  if (!batch.ok) {
    return batch;
  }

  return {
    ok: true,
    stockDeductions: batch.stockDeductions,
    source: 'seed_memory',
  };
}

function getSetAvailableStock(productId, size, catalog) {
  const componentProductIds = SET_COMPONENTS[productId];
  if (!componentProductIds) {
    const sku = (catalog.skus || []).find(
      (s) => s.productId === productId && s.size === size
    );
    return sku ? sku.stock : 0;
  }
  const stocks = componentProductIds.map((compPid) => {
    const compSku = (catalog.skus || []).find(
      (s) => s.productId === compPid && s.size === size
    );
    return compSku ? compSku.stock : 0;
  });
  if (stocks.length === 0) {
    return 0;
  }
  return Math.min(...stocks);
}

module.exports = {
  expandOrderItemsToDeductions,
  validateStockForDeductions,
  reserveAndDeductStock,
  getSetAvailableStock,
  SET_COMPONENTS,
};
