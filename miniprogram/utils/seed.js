/**
 * 本地预览用种子数据（与 cloudfunctions/common/seed.js 对齐，DevTools 无云环境可运行）
 */

const STOCK_OVERRIDE_KEY = 'local_stock_overrides';

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
  { seasonId: 'summer', label: '夏装' },
  { seasonId: 'spring_autumn', label: '春秋装' },
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

const SET_COMPONENTS = {
  hc_sa_set_001: ['hc_sa_set_001_comp_top', 'hc_sa_set_001_comp_pants'],
  hd_sa_set_001: ['hd_sa_set_001_comp_top', 'hd_sa_set_001_comp_pants'],
  hc_summer_set_001: ['hc_summer_set_001_comp_top', 'hc_summer_set_001_comp_pants'],
  hd_summer_set_001: ['hd_summer_set_001_comp_top', 'hd_summer_set_001_comp_pants'],
  hc_winter_set_001: ['hc_winter_set_001_comp_top', 'hc_winter_set_001_comp_pants'],
  hd_winter_set_001: ['hd_winter_set_001_comp_top', 'hd_winter_set_001_comp_pants'],
};

function productRow(productId, districtId, seasonId, type, typeLabel, name) {
  return {
    productId,
    districtId,
    seasonId,
    type,
    typeLabel,
    name,
    cover: '/assets/placeholder-product.png',
    complianceNote: type === 'component' ? '' : '自愿选购，非强制指定商家',
  };
}

const PRODUCTS = [
  productRow('hc_summer_set_001', 'huicheng', 'summer', 'set', '套装', '惠城区夏装校服套装（样板）'),
  productRow('hc_summer_single_001', 'huicheng', 'summer', 'single', '单件', '惠城区夏装校服上衣（样板）'),
  productRow('hc_sa_set_001', 'huicheng', 'spring_autumn', 'set', '套装', '惠城区春秋校服套装（样板）'),
  productRow('hc_sa_single_001', 'huicheng', 'spring_autumn', 'single', '单件', '惠城区春秋校服上衣（样板）'),
  productRow('hc_winter_set_001', 'huicheng', 'winter', 'set', '套装', '惠城区冬装校服套装（样板）'),
  productRow('hc_winter_single_001', 'huicheng', 'winter', 'single', '单件', '惠城区冬装校服外套（样板）'),
  productRow('hd_summer_set_001', 'huidong', 'summer', 'set', '套装', '惠东县夏装校服套装（样板）'),
  productRow('hd_summer_single_001', 'huidong', 'summer', 'single', '单件', '惠东县夏装校服上衣（样板）'),
  productRow('hd_sa_set_001', 'huidong', 'spring_autumn', 'set', '套装', '惠东县春秋校服套装（样板）'),
  productRow('hd_sa_single_001', 'huidong', 'spring_autumn', 'single', '单件', '惠东县春秋校服上衣（样板）'),
  productRow('hd_winter_set_001', 'huidong', 'winter', 'set', '套装', '惠东县冬装校服套装（样板）'),
  productRow('hd_winter_single_001', 'huidong', 'winter', 'single', '单件', '惠东县冬装校服外套（样板）'),
];

const PRODUCTS_WITH_COMPONENTS = [
  productRow('hc_summer_set_001_comp_top', 'huicheng', 'summer', 'component', '套装组件', '惠城区夏装套装-上衣（库存件）'),
  productRow('hc_summer_set_001_comp_pants', 'huicheng', 'summer', 'component', '套装组件', '惠城区夏装套装-下装（库存件）'),
  productRow('hc_sa_set_001_comp_top', 'huicheng', 'spring_autumn', 'component', '套装组件', '惠城区春秋套装-上衣（库存件）'),
  productRow('hc_sa_set_001_comp_pants', 'huicheng', 'spring_autumn', 'component', '套装组件', '惠城区春秋套装-下装（库存件）'),
  productRow('hc_winter_set_001_comp_top', 'huicheng', 'winter', 'component', '套装组件', '惠城区冬装套装-上衣（库存件）'),
  productRow('hc_winter_set_001_comp_pants', 'huicheng', 'winter', 'component', '套装组件', '惠城区冬装套装-下装（库存件）'),
  productRow('hd_summer_set_001_comp_top', 'huidong', 'summer', 'component', '套装组件', '惠东县夏装套装-上衣（库存件）'),
  productRow('hd_summer_set_001_comp_pants', 'huidong', 'summer', 'component', '套装组件', '惠东县夏装套装-下装（库存件）'),
  productRow('hd_sa_set_001_comp_top', 'huidong', 'spring_autumn', 'component', '套装组件', '惠东县春秋套装-上衣（库存件）'),
  productRow('hd_sa_set_001_comp_pants', 'huidong', 'spring_autumn', 'component', '套装组件', '惠东县春秋套装-下装（库存件）'),
  productRow('hd_winter_set_001_comp_top', 'huidong', 'winter', 'component', '套装组件', '惠东县冬装套装-上衣（库存件）'),
  productRow('hd_winter_set_001_comp_pants', 'huidong', 'winter', 'component', '套装组件', '惠东县冬装套装-下装（库存件）'),
];

const ALL_PRODUCTS = [...PRODUCTS, ...PRODUCTS_WITH_COMPONENTS];

const SKUS = [
  ...buildSkus('hc_summer_set_001', 16800, 999),
  ...buildSkus('hc_summer_single_001', 6800, 55),
  ...buildSkus('hc_sa_set_001', 19800, 999),
  ...buildSkus('hc_sa_single_001', 8800, 40),
  ...buildSkus('hc_winter_set_001', 22800, 999),
  ...buildSkus('hc_winter_single_001', 9800, 35),
  ...buildSkus('hd_summer_set_001', 16800, 999),
  ...buildSkus('hd_summer_single_001', 6800, 50),
  ...buildSkus('hd_sa_set_001', 19800, 999),
  ...buildSkus('hd_sa_single_001', 8800, 42),
  ...buildSkus('hd_winter_set_001', 22800, 999),
  ...buildSkus('hd_winter_single_001', 9800, 33),
  ...buildSkus('hc_summer_set_001_comp_top', 0, 60),
  ...buildSkus('hc_summer_set_001_comp_pants', 0, 58),
  ...buildSkus('hc_sa_set_001_comp_top', 0, 50),
  ...buildSkus('hc_sa_set_001_comp_pants', 0, 48),
  ...buildSkus('hc_winter_set_001_comp_top', 0, 42),
  ...buildSkus('hc_winter_set_001_comp_pants', 0, 40),
  ...buildSkus('hd_summer_set_001_comp_top', 0, 52),
  ...buildSkus('hd_summer_set_001_comp_pants', 0, 50),
  ...buildSkus('hd_sa_set_001_comp_top', 0, 45),
  ...buildSkus('hd_sa_set_001_comp_pants', 0, 44),
  ...buildSkus('hd_winter_set_001_comp_top', 0, 38),
  ...buildSkus('hd_winter_set_001_comp_pants', 0, 36),
];

function loadStockOverrides() {
  return wx.getStorageSync(STOCK_OVERRIDE_KEY) || {};
}

function saveStockOverrides(overrides) {
  wx.setStorageSync(STOCK_OVERRIDE_KEY, overrides);
}

function getCatalog() {
  const stockOverrides = loadStockOverrides();
  const skus = SKUS.map((sku) => {
    const stock =
      stockOverrides[sku.skuId] !== undefined
        ? stockOverrides[sku.skuId]
        : sku.stock;
    return { ...sku, stock };
  });
  return {
    districts: DISTRICTS,
    pickupPoints: PICKUP_POINTS,
    seasons: SEASONS,
    products: ALL_PRODUCTS,
    skus,
    sizes: SIZES,
    setComponents: SET_COMPONENTS,
  };
}

function setSkuStock(skuId, stock) {
  if (typeof stock !== 'number' || stock < 0) {
    return { ok: false, message: 'INVALID_STOCK' };
  }
  const overrides = loadStockOverrides();
  overrides[skuId] = stock;
  saveStockOverrides(overrides);
  return { ok: true, skuId, stock };
}

function deductSkuStockBatch(deductions) {
  const catalog = getCatalog();
  const stockMap = new Map(catalog.skus.map((s) => [s.skuId, s.stock]));

  for (const { skuId, qty } of deductions) {
    const available = stockMap.get(skuId);
    if (available === undefined || available < qty) {
      return {
        ok: false,
        code: 'INSUFFICIENT_STOCK',
        message: '库存不足，成套商品需各组件均有货，整单无法提交',
        failures: [
          {
            skuId,
            need: qty,
            available: available ?? 0,
          },
        ],
      };
    }
  }

  const stockDeductions = [];
  for (const { skuId, qty } of deductions) {
    const before = stockMap.get(skuId);
    const after = before - qty;
    setSkuStock(skuId, after);
    stockMap.set(skuId, after);
    stockDeductions.push({
      skuId,
      qty,
      stockBefore: before,
      stockAfter: after,
    });
  }

  return { ok: true, stockDeductions };
}

module.exports = {
  DISTRICTS,
  PICKUP_POINTS,
  SIZES,
  SEASONS,
  SET_COMPONENTS,
  getCatalog,
  setSkuStock,
  deductSkuStockBatch,
  STOCK_OVERRIDE_KEY,
};
