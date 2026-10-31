const cloud = require('wx-server-sdk');
const { PRODUCTS, SKUS, getCatalog } = require('./common/seed');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const CATALOG_COLLECTIONS = ['districts', 'pickup_points', 'products', 'skus'];

const SAMPLE_ORDER_IDS = ['ord_seed_demo_001', 'ord_seed_demo_002'];

/** 分批删除集合内全部文档（仅 seedCloud 在 force 时使用） */
async function clearCollection(collectionName) {
  const col = db.collection(collectionName);
  const pageSize = 100;
  let removed = 0;

  for (;;) {
    const res = await col.limit(pageSize).field({ _id: true }).get();
    const docs = res.data || [];
    if (docs.length === 0) {
      break;
    }
    await Promise.all(docs.map((doc) => col.doc(doc._id).remove()));
    removed += docs.length;
  }

  return removed;
}

async function setDocument(collectionName, docId, data) {
  await db.collection(collectionName).doc(docId).set({ data });
}

async function seedCatalogCollections() {
  const catalog = getCatalog();
  const counts = {
    districts: 0,
    pickup_points: 0,
    products: 0,
    skus: 0,
  };

  for (const row of catalog.districts) {
    await setDocument('districts', row.districtId, { ...row });
    counts.districts += 1;
  }

  for (const row of catalog.pickupPoints) {
    await setDocument('pickup_points', row.pickupId, { ...row });
    counts.pickup_points += 1;
  }

  for (const row of catalog.products) {
    await setDocument('products', row.productId, { ...row });
    counts.products += 1;
  }

  for (const row of catalog.skus) {
    await setDocument('skus', row.skuId, { ...row });
    counts.skus += 1;
  }

  return { counts, productCount: counts.products };
}

function buildSampleOrders(now) {
  const productById = new Map(PRODUCTS.map((p) => [p.productId, p]));
  const skuByKey = new Map(
    SKUS.map((s) => [`${s.productId}:${s.size}`, s])
  );

  function line(productId, size, qty) {
    const product = productById.get(productId);
    const sku = skuByKey.get(`${productId}:${size}`);
    if (!product || !sku) {
      throw new Error(`SEED_LINE_MISSING:${productId}:${size}`);
    }
    return {
      skuId: sku.skuId,
      productId,
      name: product.name,
      size,
      qty,
      priceCent: sku.priceCent,
    };
  }

  const order1Items = [line('hc_summer_set_001', 120, 1)];
  const order2Items = [line('hd_sa_single_001', 130, 2)];

  const amountCent = (items) =>
    items.reduce((sum, row) => sum + row.priceCent * row.qty, 0);

  return [
    {
      orderId: SAMPLE_ORDER_IDS[0],
      openid: 'seed_demo_openid_huicheng',
      districtId: 'huicheng',
      items: order1Items,
      stockDeductions: [],
      fulfillment: {
        type: 'pickup',
        pickupId: 'pickup_huicheng_1',
        pickupName: '惠城区虚拟自提点（样板）',
        pickupAddress: '惠州市惠城区（具体地址上线前配置）',
      },
      contact: { name: '测试家长A', phone: '13800000001' },
      remark: '云库种子订单（Gate1 演示待支付，无学生信息）',
      status: 'pending_pay',
      amountCent: amountCent(order1Items),
      payment: {
        channel: 'mock',
        paid: false,
        note: '演示/mock 支付，非真收款',
      },
      aftersales: { state: 'none' },
      createdAt: now,
      updatedAt: now,
    },
    {
      orderId: SAMPLE_ORDER_IDS[1],
      openid: 'seed_demo_openid_huidong',
      districtId: 'huidong',
      items: order2Items,
      stockDeductions: [],
      fulfillment: {
        type: 'pickup',
        pickupId: 'pickup_huidong_1',
        pickupName: '惠东县虚拟自提点（样板）',
        pickupAddress: '惠州市惠东县（具体地址上线前配置）',
      },
      contact: { name: '测试家长B', phone: '13800000002' },
      remark: '云库种子订单（Gate1 演示待支付，无学生信息）',
      status: 'pending_pay',
      amountCent: amountCent(order2Items),
      payment: {
        channel: 'mock',
        paid: false,
        note: '演示/mock 支付，非真收款',
      },
      aftersales: { state: 'none' },
      createdAt: now,
      updatedAt: now,
    },
  ];
}

async function seedSampleOrdersIfMissing(now) {
  const col = db.collection('orders');
  const existing = await col
    .where({ orderId: db.command.in(SAMPLE_ORDER_IDS) })
    .field({ orderId: true })
    .get();
  const have = new Set((existing.data || []).map((o) => o.orderId));
  const samples = buildSampleOrders(now);
  let inserted = 0;

  for (const order of samples) {
    if (have.has(order.orderId)) {
      continue;
    }
    await col.add({ data: order });
    inserted += 1;
  }

  return { inserted, skippedExisting: samples.length - inserted };
}

/**
 * 一键写入 Gate1 种子目录到云数据库。
 * - 默认：products 已有数据则跳过（空库才写入）
 * - event.force === true：清空目录集合（districts / pickup_points / products / skus）后重写；不删 orders / users
 * - 示例 pending_pay 订单：按 orderId 幂等补写，缺则插入
 */
exports.main = async (event = {}) => {
  const force = event.force === true;

  try {
    const productsCol = db.collection('products');
    const countRes = await productsCol.count();
    const alreadySeeded = countRes.total > 0;

    if (alreadySeeded && !force) {
      const ordersSeed = await seedSampleOrdersIfMissing(db.serverDate());
      return {
        ok: true,
        skipped: true,
        reason: 'already_seeded',
        message: 'products 集合已有数据，未重写目录；可传 { force: true } 清空目录集合并重灌',
        productsInDb: countRes.total,
        ordersSeed,
      };
    }

    const cleared = {};
    if (force && alreadySeeded) {
      for (const name of CATALOG_COLLECTIONS) {
        cleared[name] = await clearCollection(name);
      }
    }

    const { counts } = await seedCatalogCollections();
    const ordersSeed = await seedSampleOrdersIfMissing(db.serverDate());

    return {
      ok: true,
      skipped: false,
      forced: force,
      cleared: force ? cleared : undefined,
      seeded: counts,
      ordersSeed,
      hint: '请重新编译小程序并调用 listCatalog，应返回 source: database',
    };
  } catch (err) {
    console.error('[seedCloud] failed', err);
    return {
      ok: false,
      code: 'SEED_FAILED',
      message: err.message || '写入种子数据失败',
    };
  }
};
