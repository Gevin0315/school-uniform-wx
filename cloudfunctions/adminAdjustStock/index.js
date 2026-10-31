const cloud = require('wx-server-sdk');
const { setSkuStock, getCatalog } = require('./common/seed');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

/**
 * 简易库存调整（Gate 1 管理页）
 * 有云库时写 skus 集合；否则改种子内存覆盖
 */
exports.main = async (event) => {
  const { skuId, stock, adminToken } = event;

  // [ASSUMPTION] Gate 1 占位鉴权，上线前替换为云函数安全规则 + 管理员 openid 白名单
  if (adminToken !== 'gate1-dev-token') {
    return { ok: false, code: 'FORBIDDEN', message: '无管理权限' };
  }

  if (!skuId || typeof stock !== 'number') {
    return { ok: false, code: 'INVALID_PARAMS', message: '参数错误' };
  }

  try {
    const res = await db
      .collection('skus')
      .where({ skuId })
      .update({ data: { stock } });
    if (res.stats.updated > 0) {
      return { ok: true, skuId, stock, source: 'database' };
    }
  } catch (err) {
    console.warn('[adminAdjustStock] 写库失败，回落内存', err);
  }

  try {
    const updated = setSkuStock(skuId, stock);
    return { ok: true, ...updated, source: 'seed_memory' };
  } catch (err) {
    return { ok: false, code: err.message || 'ERROR', catalog: getCatalog().skus };
  }
};
