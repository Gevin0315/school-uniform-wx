Page({
  data: {
    statusBarHeight: 44,
    districtName: '',
    districtDisplay: '未选择，下单前需确定',
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sys.statusBarHeight || 44,
    });
  },

  onShow() {
    const app = getApp();
    const name = app.globalData.districtName;
    this.setData({
      districtName: name || '',
      districtDisplay: name || '未选择，下单前需确定',
    });
  },

  goOrdersAll() {
    wx.navigateTo({ url: '/pages/orders/orders' });
  },

  goOrdersPendingPay() {
    wx.navigateTo({ url: '/pages/orders/orders?status=pending_pay' });
  },

  goOrdersPendingShip() {
    wx.navigateTo({ url: '/pages/orders/orders?status=pending_ship' });
  },

  goOrdersPendingReceive() {
    wx.navigateTo({ url: '/pages/orders/orders?status=pending_pickup' });
  },

  goAftersales() {
    wx.navigateTo({ url: '/pages/orders/orders?status=aftersales' });
  },

  goOrders() {
    this.goOrdersAll();
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

  goSizeGuide() {
    wx.navigateTo({ url: '/pages/rules/rules' });
  },

  contactSupport() {
    wx.showModal({
      title: '联系校服客服',
      content:
        '客服通道即将上线。如需帮助，请先通过学校或当地教育主管部门咨询选购事宜。',
      showCancel: false,
      confirmText: '知道了',
    });
  },
});
