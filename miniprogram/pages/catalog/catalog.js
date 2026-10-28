const { fetchCatalog } = require('../../utils/catalog');

Page({
  data: {
    districtName: '',
    products: [],
    seasons: [],
    filterSeason: '',
  },

  onShow() {
    const app = getApp();
    if (!app.globalData.districtId) {
      wx.redirectTo({ url: '/pages/home/home' });
      return;
    }
    this.setData({ districtName: app.globalData.districtName });
    this.loadProducts(app.globalData.districtId);
  },

  loadProducts(districtId) {
    fetchCatalog().then((data) => {
      const products = (data.products || []).filter(
        (p) => p.districtId === districtId && p.type !== 'component'
      );
      this.setData({
        products,
        seasons: data.seasons || [],
      });
    });
  },

  openProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },

  goCart() {
    wx.navigateTo({ url: '/pages/cart/cart' });
  },
});
