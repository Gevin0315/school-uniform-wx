const {
  fetchCatalog,
  enrichProductCards,
  addToCartWithDistrictPolicy,
} = require('../../utils/catalog');
const { effectiveLineStock } = require('../../utils/stock');

Page({
  data: {
    districtName: '',
    districts: [],
    products: [],
    displayProducts: [],
    seasons: [],
    filterDistrict: '',
    filterSeason: '',
    filterType: '',
    filterStock: '',
    catalog: null,
  },

  onShow() {
    const app = getApp();
    this.setData({
      districtName: app.globalData.districtName,
    });
    this.loadCatalog();
  },

  loadCatalog() {
    fetchCatalog().then((data) => {
      const enabledIds = new Set(
        (data.districts || [])
          .filter((d) => d.enabled)
          .map((d) => d.districtId)
      );
      const districtLabels = Object.fromEntries(
        (data.districts || []).map((d) => [d.districtId, d.name])
      );
      const products = (data.products || []).filter(
        (p) => enabledIds.has(p.districtId) && p.type !== 'component'
      );
      const seasonLabels = Object.fromEntries(
        (data.seasons || []).map((s) => [s.seasonId, s.label])
      );
      const enriched = enrichProductCards(products, data).map((p) => ({
        ...p,
        seasonLabel: seasonLabels[p.seasonId] || '',
        districtLabel: districtLabels[p.districtId] || '',
      }));
      this.setData({
        products: enriched,
        seasons: data.seasons || [],
        districts: (data.districts || []).filter((d) => d.enabled),
        catalog: data,
      });
      this.applyFilters();
    });
  },

  applyFilters() {
    const {
      products,
      filterDistrict,
      filterSeason,
      filterType,
      filterStock,
    } = this.data;
    let list = products;
    if (filterDistrict) {
      list = list.filter((p) => p.districtId === filterDistrict);
    }
    if (filterSeason) {
      list = list.filter((p) => p.seasonId === filterSeason);
    }
    if (filterType === 'set') {
      list = list.filter((p) => p.type === 'set');
    } else if (filterType === 'single') {
      list = list.filter((p) => p.type === 'single');
    }
    if (filterStock === 'in_stock') {
      list = list.filter((p) => p.stockLevel !== 'out');
    }
    this.setData({ displayProducts: list });
  },

  onDistrictTap(e) {
    const district = e.currentTarget.dataset.district;
    const next = this.data.filterDistrict === district ? '' : district;
    this.setData({ filterDistrict: next }, () => this.applyFilters());
  },

  onSeasonTap(e) {
    const season = e.currentTarget.dataset.season;
    const next = this.data.filterSeason === season ? '' : season;
    this.setData({ filterSeason: next }, () => this.applyFilters());
  },

  onTypeTap(e) {
    const type = e.currentTarget.dataset.type;
    const next = this.data.filterType === type ? '' : type;
    this.setData({ filterType: next }, () => this.applyFilters());
  },

  onStockTap(e) {
    const stock = e.currentTarget.dataset.stock;
    const next = this.data.filterStock === stock ? '' : stock;
    this.setData({ filterStock: next }, () => this.applyFilters());
  },

  changeDistrict() {
    wx.navigateTo({ url: '/pages/district-select/district-select' });
  },

  openProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },

  oneClickSet() {
    const data = this.data.catalog;
    if (!data) {
      return;
    }
    const setProduct = this.data.displayProducts.find((p) => p.type === 'set');
    if (!setProduct) {
      wx.showToast({ title: '当前筛选下暂无套装', icon: 'none' });
      return;
    }
    const size = 140;
    const sku = (data.skus || []).find(
      (s) => s.productId === setProduct.productId && s.size === size
    );
    const stock = effectiveLineStock(setProduct, size, data);
    if (!sku || stock <= 0) {
      wx.showToast({ title: '默认尺码 140 暂无库存', icon: 'none' });
      return;
    }
    addToCartWithDistrictPolicy(
      {
        skuId: sku.skuId,
        productId: setProduct.productId,
        productType: setProduct.type,
        name: setProduct.name,
        size,
        priceCent: sku.priceCent,
        districtId: setProduct.districtId,
        typeLabel: setProduct.typeLabel,
      },
      data
    ).then(({ added }) => {
      if (!added) {
        return;
      }
      wx.showModal({
        title: '一键成套',
        content: `已将「${setProduct.name}」尺码 ${size} 加入购物车，可在购物车修改尺码与数量。`,
        confirmText: '去购物车',
        cancelText: '继续逛',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/cart/cart' });
          }
        },
      });
    });
  },

  goCart() {
    wx.navigateTo({ url: '/pages/cart/cart' });
  },
});
