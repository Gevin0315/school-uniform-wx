const cloud = require('wx-server-sdk');
const { getCatalog } = require('../common/seed');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

/**
 * 返回目录：优先读云库，空库时回落种子数据（Gate 1）
 */
exports.main = async () => {
  try {
    const productsCol = db.collection('products');
    const countRes = await productsCol.count();
    if (countRes.total > 0) {
      const [districts, pickupPoints, products, skus] = await Promise.all([
        db.collection('districts').get(),
        db.collection('pickup_points').get(),
        productsCol.get(),
        db.collection('skus').get(),
      ]);
      const { SET_COMPONENTS } = require('../common/seed');
      return {
        ok: true,
        source: 'database',
        data: {
          districts: districts.data,
          pickupPoints: pickupPoints.data,
          products: products.data,
          skus: skus.data,
          setComponents: SET_COMPONENTS,
          seasons: [
            { seasonId: 'spring_autumn', label: '春秋装' },
            { seasonId: 'summer', label: '夏装' },
            { seasonId: 'winter', label: '冬装' },
          ],
        },
      };
    }
  } catch (err) {
    console.warn('[listCatalog] 读库失败，使用种子数据', err);
  }

  return {
    ok: true,
    source: 'seed',
    data: getCatalog(),
  };
};
