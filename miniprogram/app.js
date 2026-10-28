// 惠州校服选购 — 小程序入口
// 云环境 ID 请在微信开发者工具中替换为实际 env；占位时默认本地 seed 预览

const CLOUD_ENV_ID = 'replace-with-your-cloud-env-id';
const USE_LOCAL_PREVIEW = CLOUD_ENV_ID.includes('replace-with');

App({
  globalData: {
    districtId: '',
    districtName: '',
    catalog: null,
    useLocalPreview: USE_LOCAL_PREVIEW,
    complianceFooter:
      '校服自愿选购，本平台非强制、非指定唯一商家。如有疑问请咨询学校或当地教育主管部门。',
  },

  onLaunch() {
    const saved = wx.getStorageSync('selectedDistrict');
    if (saved && saved.districtId) {
      this.globalData.districtId = saved.districtId;
      this.globalData.districtName = saved.districtName || '';
    }

    if (!wx.cloud) {
      this.globalData.useLocalPreview = true;
      return;
    }

    if (!USE_LOCAL_PREVIEW) {
      wx.cloud.init({
        env: CLOUD_ENV_ID,
        traceUser: true,
      });
    }
  },
});
