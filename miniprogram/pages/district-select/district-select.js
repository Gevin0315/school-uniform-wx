const { fetchCatalog, clearCart } = require('../../utils/catalog');

Page({
  data: {
    districts: [],
    enabledDistricts: [],
    disabledDistricts: [],
    selectedDistrictId: '',
    currentDistrictLabel: '未选择偏好',
    complianceFooter: '',
  },

  onLoad() {
    const app = getApp();
    const selected = app.globalData.districtId;
    this.setData({
      complianceFooter: app.globalData.complianceFooter,
      selectedDistrictId: selected || '',
      currentDistrictLabel: app.globalData.districtName || '未选择偏好',
    });
    fetchCatalog()
      .then((data) => {
        const districts = data.districts || [];
        this.setData({
          districts,
          enabledDistricts: districts.filter((d) => d.enabled),
          disabledDistricts: districts.filter((d) => !d.enabled),
        });
      })
      .catch(() => {
        wx.showToast({ title: '加载区县失败', icon: 'none' });
      });
  },

  onShow() {
    const app = getApp();
    this.setData({
      selectedDistrictId: app.globalData.districtId || '',
      currentDistrictLabel: app.globalData.districtName || '未选择偏好',
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
    this.setData({
      selectedDistrictId: id,
      currentDistrictLabel: name,
    });
    wx.showToast({ title: '已设为选购偏好', icon: 'none' });
    setTimeout(() => this.goBackWeak(), 400);
  },

  goRules() {
    wx.navigateTo({ url: '/pages/rules/rules' });
  },

  goBackWeak() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }
    wx.switchTab({ url: '/pages/home/home' });
  },
});
