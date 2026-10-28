Page({
  data: {
    districtName: '',
  },

  onShow() {
    const app = getApp();
    this.setData({
      districtName: app.globalData.districtName || '未选择',
    });
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/orders/orders' });
  },

  goAddress() {
    wx.navigateTo({ url: '/pages/address/address' });
  },

  goRules() {
    wx.navigateTo({ url: '/pages/rules/rules' });
  },

  goDistrict() {
    wx.navigateTo({ url: '/pages/district-select/district-select' });
  },

  goCart() {
    wx.navigateTo({ url: '/pages/cart/cart' });
  },
});
