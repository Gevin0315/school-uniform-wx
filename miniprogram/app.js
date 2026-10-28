// 惠州校服选购 — 小程序入口
// 云环境 ID 请在微信开发者工具中替换为实际 env

const CLOUD_ENV_PLACEHOLDER = 'replace-with-your-cloud-env-id';

App({
  globalData: {
    districtId: '',
    districtName: '',
    catalog: null,
    complianceFooter:
      '校服自愿选购，本平台非强制、非指定唯一商家。如有疑问请咨询学校或当地教育主管部门。',
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用支持云开发的基础库');
      return;
    }
    wx.cloud.init({
      env: CLOUD_ENV_PLACEHOLDER,
      traceUser: true,
    });

    const saved = wx.getStorageSync('selectedDistrict');
    if (saved && saved.districtId) {
      this.globalData.districtId = saved.districtId;
      this.globalData.districtName = saved.districtName || '';
    }
  },
});
