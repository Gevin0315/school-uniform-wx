const {
  fetchCatalog,
  enrichProductCards,
  addToCart,
  formatCent,
} = require('../../utils/catalog');
const { effectiveLineStock } = require('../../utils/stock');

Page({
  data: {
    districtName: '',
    products: [],
    displayProducts: [],
    seasons: [],
    filterSeason: '',
    setsOnly: false,
  },

  onLoad(query) {
    if (query.season) {
      this.setData({ filterSeason: query.season });
    }
    if (query.setsOnly === '1') {
      this.setData({ setsOnly: true });
    }
  },

  onShow() {
    const app = getApp();
    if (!app.globalData.districtId) {
      wx.redirectTo({ url: '/pages/district-select/district-select' });
      return;
    }
    this.setData({ districtName: app.globalData.districtName });
    this.loadProducts(app.globalData.districtId);
  },

  loadProducts(districtId) {
    fetchCatalog().then((data) => {
      let products = (data.products || []).filter(
        (p) => p.districtId === districtId && p.type !== 'component'
      );
      if (this.data.setsOnly) {
        products = products.filter((p) => p.type === 'set');
      }
      const enriched = enrichProductCards(products, data);
      this.setData({
        products: enriched,
        seasons: data.seasons || [],
        catalog: data,
      });
      this.applySeasonFilter(this.data.filterSeason);
    });
  },

  applySeasonFilter(seasonId) {
    const { products } = this.data;
    let list = products;
    if (seasonId) {
      list = products.filter((p) => p.seasonId === seasonId);
    }
    this.setData({
      filterSeason: seasonId || '',
      displayProducts: list,
    });
  },

  onSeasonTap(e) {
    const season = e.currentTarget.dataset.season;
    const next = this.data.filterSeason === season ? '' : season;
    this.applySeasonFilter(next);
  },

  openProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },

  oneClickSet() {
    const app = getApp();
    fetchCatalog().then((data) => {
      const setProduct = (data.products || []).find(
        (p) =>
          p.districtId === app.globalData.districtId &&
          p.type === 'set' &&
          (!this.data.filterSeason || p.seasonId === this.data.filterSeason)
      );
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
      addToCart({
        skuId: sku.skuId,
        productId: setProduct.productId,
        productType: setProduct.type,
        name: setProduct.name,
        size,
        priceCent: sku.priceCent,
        districtId: app.globalData.districtId,
        typeLabel: setProduct.typeLabel,
      });
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
