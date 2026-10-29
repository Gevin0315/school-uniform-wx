const ADMIN_STOCK_TAP_COUNT = 5;
const ADMIN_STOCK_TAP_WINDOW_MS = 2500;

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

  onHeroTitleTap() {
    const now = Date.now();
    if (
      !this._adminStockTapCount ||
      now - this._adminStockLastTap > ADMIN_STOCK_TAP_WINDOW_MS
    ) {
      this._adminStockTapCount = 0;
    }
    this._adminStockLastTap = now;
    this._adminStockTapCount += 1;
    if (this._adminStockTapCount >= ADMIN_STOCK_TAP_COUNT) {
      this._adminStockTapCount = 0;
      wx.navigateTo({ url: '/pages/admin-stock/admin-stock' });
    }
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
