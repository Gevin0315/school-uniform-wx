const { loadAddress, saveAddress } = require('../../utils/catalog');

Page({
  data: {
    address: {
      name: '',
      phone: '',
      detail: '',
    },
  },

  onLoad() {
    this.setData({ address: loadAddress() });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`address.${field}`]: e.detail.value });
  },

  save() {
    const { address } = this.data;
    if (!address.name || !address.phone || !address.detail) {
      wx.showToast({ title: '请填写完整地址', icon: 'none' });
      return;
    }
    saveAddress(address);
    wx.showToast({ title: '已保存' });
    wx.navigateBack();
  },
});
