const { fetchCatalog, clearCart } = require('../../utils/catalog');

Page({
  data: {
    districts: [],
    complianceFooter: '',
  },

  onLoad() {
    const app = getApp();
    this.setData({ complianceFooter: app.globalData.complianceFooter });
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
    const prevDistrict = app.globalData.districtId;
    if (prevDistrict && prevDistrict !== id) {
      clearCart();
    }
    app.globalData.districtId = id;
    app.globalData.districtName = name;
    wx.setStorageSync('selectedDistrict', {
      districtId: id,
      districtName: name,
    });
    wx.switchTab({ url: '/pages/home/home' });
  },
});
