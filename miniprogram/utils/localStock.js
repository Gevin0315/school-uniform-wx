const { getCatalog, SET_COMPONENTS, deductSkuStockBatch } = require('./seed');

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
      });
    } else {
      throw new Error(`UNSUPPORTED_PRODUCT_TYPE:${product.type}`);
    }
  }

  const map = new Map();
  for (const line of lines) {
    const prev = map.get(line.skuId);
    if (prev) {
      prev.qty += line.qty;
    } else {
      map.set(line.skuId, { ...line });
    }
  }
  return [...map.values()];
}

function reserveAndDeductStock(items) {
  const catalog = getCatalog();
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

  return deductSkuStockBatch(
    deductions.map((d) => ({ skuId: d.skuId, qty: d.qty }))
  );
}

function getComponentSkusForSet(productId, size, catalog) {
  const componentProductIds = SET_COMPONENTS[productId] || [];
  const productsById = new Map(
    (catalog.products || []).map((p) => [p.productId, p])
  );
  return componentProductIds.map((compPid) => {
    const compProduct = productsById.get(compPid);
    const compSku = (catalog.skus || []).find(
      (s) => s.productId === compPid && s.size === size
    );
    return {
      productId: compPid,
      name: compProduct ? compProduct.name : compPid,
      skuId: compSku ? compSku.skuId : '',
      stock: compSku ? compSku.stock : 0,
    };
  });
}

module.exports = {
  expandOrderItemsToDeductions,
  reserveAndDeductStock,
  getComponentSkusForSet,
};
