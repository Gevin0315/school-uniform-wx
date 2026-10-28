const { fetchCatalog } = require('../../utils/catalog');

Page({
  data: {
    districtName: '',
    districtId: '',
    seasons: [],
  },

  onShow() {
    const app = getApp();
    if (!app.globalData.districtId) {
      wx.redirectTo({ url: '/pages/district-select/district-select' });
      return;
    }
    this.setData({
      districtName: app.globalData.districtName,
      districtId: app.globalData.districtId,
    });
    fetchCatalog().then((data) => {
      this.setData({ seasons: data.seasons || [] });
    });
  },

  changeDistrict() {
    wx.navigateTo({ url: '/pages/district-select/district-select' });
  },

  openSeason(e) {
    const { season } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/catalog/catalog?season=${season}`,
    });
  },

  openSetBundle() {
    wx.navigateTo({
      url: '/pages/catalog/catalog?setsOnly=1',
    });
  },
});
