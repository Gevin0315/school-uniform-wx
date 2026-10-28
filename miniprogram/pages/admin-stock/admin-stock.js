const { fetchCatalog } = require('../../utils/catalog');

Page({
  data: {
    skus: [],
    adminToken: 'gate1-dev-token',
  },

  onShow() {
    fetchCatalog().then((data) => {
      this.setData({ skus: data.skus || [] });
    });
  },

  onStockInput(e) {
    const { sku } = e.currentTarget.dataset;
    const stock = Number(e.detail.value);
    const skus = this.data.skus.map((s) =>
      s.skuId === sku ? { ...s, draftStock: stock } : s
    );
    this.setData({ skus });
  },

  saveSku(e) {
    const { sku } = e.currentTarget.dataset;
    const row = this.data.skus.find((s) => s.skuId === sku);
    const stock = row.draftStock !== undefined ? row.draftStock : row.stock;
    wx.cloud
      .callFunction({
        name: 'adminAdjustStock',
        data: { skuId: sku, stock, adminToken: this.data.adminToken },
      })
      .then((res) => {
        const result = res.result || {};
        if (result.ok) {
          wx.showToast({ title: '已更新' });
          this.onShow();
        } else {
          wx.showToast({ title: result.message || '失败', icon: 'none' });
        }
      });
  },
});
