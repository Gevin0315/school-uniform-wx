/**
 * Gate 1 种子数据结构（与云数据库集合字段对齐的占位形状）
 * districtId × season × type(套/单) × size → stock
 */

const DISTRICTS = [
  { districtId: 'huicheng', name: '惠城区', enabled: true },
  { districtId: 'huidong', name: '惠东县', enabled: true },
  { districtId: 'huiyang', name: '惠阳区', enabled: false },
  { districtId: 'boluo', name: '博罗县', enabled: false },
  { districtId: 'longmen', name: '龙门县', enabled: false },
  { districtId: 'dayawan', name: '大亚湾区', enabled: false },
  { districtId: 'zhongkai', name: '仲恺高新区', enabled: false },
];

const PICKUP_POINTS = [
  {
    pickupId: 'pickup_huicheng_1',
    districtId: 'huicheng',
    name: '惠城区虚拟自提点（样板）',
    address: '惠州市惠城区（具体地址上线前配置）',
    virtual: true,
  },
  {
    pickupId: 'pickup_huidong_1',
    districtId: 'huidong',
    name: '惠东县虚拟自提点（样板）',
    address: '惠州市惠东县（具体地址上线前配置）',
    virtual: true,
  },
];

const SIZES = [110, 120, 130, 140, 150, 160, 170, 180];

const SEASONS = [
  { seasonId: 'spring_autumn', label: '春秋装' },
  { seasonId: 'summer', label: '夏装' },
  { seasonId: 'winter', label: '冬装' },
];

function buildSkus(productId, basePrice, stockBase) {
  return SIZES.map((size, index) => ({
    skuId: `${productId}_s${size}`,
    productId,
    size,
    priceCent: basePrice,
    stock: Math.max(0, stockBase - index * 2),
  }));
}

const PRODUCTS = [
  {
    productId: 'hc_sa_set_001',
    districtId: 'huicheng',
    seasonId: 'spring_autumn',
    type: 'set',
    typeLabel: '套装',
    name: '惠城区春秋校服套装（样板）',
    cover: '/assets/placeholder-product.png',
    complianceNote: '自愿选购，非强制指定商家',
  },
  {
    productId: 'hc_sa_single_001',
    districtId: 'huicheng',
    seasonId: 'spring_autumn',
    type: 'single',
    typeLabel: '单件',
    name: '惠城区春秋校服上衣（样板）',
    cover: '/assets/placeholder-product.png',
    complianceNote: '自愿选购，非强制指定商家',
  },
  {
    productId: 'hd_sa_set_001',
    districtId: 'huidong',
    seasonId: 'spring_autumn',
    type: 'set',
    typeLabel: '套装',
    name: '惠东县春秋校服套装（样板）',
    cover: '/assets/placeholder-product.png',
    complianceNote: '自愿选购，非强制指定商家',
  },
];

const SKUS = [
  ...buildSkus('hc_sa_set_001', 19800, 50),
  ...buildSkus('hc_sa_single_001', 8800, 40),
  ...buildSkus('hd_sa_set_001', 19800, 45),
];

/** 内存库存覆盖（adminAdjustStock 调试用，无云库时生效） */
let stockOverrides = {};

function getCatalog() {
  const skus = SKUS.map((sku) => {
    const key = sku.skuId;
    const stock =
      stockOverrides[key] !== undefined ? stockOverrides[key] : sku.stock;
    return { ...sku, stock };
  });
  return {
    districts: DISTRICTS,
    pickupPoints: PICKUP_POINTS,
    seasons: SEASONS,
    products: PRODUCTS,
    skus,
    sizes: SIZES,
  };
}

function setSkuStock(skuId, stock) {
  if (typeof stock !== 'number' || stock < 0) {
    throw new Error('INVALID_STOCK');
  }
  stockOverrides[skuId] = stock;
  return { skuId, stock };
}

module.exports = {
  DISTRICTS,
  PICKUP_POINTS,
  PRODUCTS,
  SKUS,
  SIZES,
  getCatalog,
  setSkuStock,
};
