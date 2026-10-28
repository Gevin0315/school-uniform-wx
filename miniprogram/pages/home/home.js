const { fetchCatalog } = require('../../utils/catalog');

Page({
  data: {
    districts: [],
    complianceFooter: '',
  },

  onLoad() {
    const app = getApp();
    this.setData({ complianceFooter: app.globalData.complianceFooter });
    this.loadDistricts();
  },

  loadDistricts() {
    fetchCatalog()
      .then((data) => {
        this.setData({ districts: data.districts || [] });
      })
      .catch(() => {
        wx.showToast({ title: '加载区县失败', icon: 'none' });
      });
  },

  onSelectDistrict(e) {
    const { id, name, enabled } = e.currentTarget.dataset;
    if (!enabled) {
      wx.showToast({ title: '即将开放', icon: 'none' });
      return;
    }
    const app = getApp();
    app.globalData.districtId = id;
    app.globalData.districtName = name;
    wx.setStorageSync('selectedDistrict', { districtId: id, districtName: name });
    wx.navigateTo({ url: '/pages/catalog/catalog' });
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/orders/orders' });
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin-stock/admin-stock' });
  },
});
