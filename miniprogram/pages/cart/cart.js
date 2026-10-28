const {
  loadCart,
  updateCartQty,
  cartTotalCent,
  formatCent,
} = require('../../utils/catalog');

Page({
  data: {
    items: [],
    totalText: '0.00',
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const items = loadCart();
    this.setData({
      items,
      totalText: formatCent(cartTotalCent(items)),
    });
  },

  changeQty(e) {
    const { sku, delta } = e.currentTarget.dataset;
    const item = this.data.items.find((i) => i.skuId === sku);
    if (!item) return;
    const qty = Math.max(0, (item.qty || 0) + Number(delta));
    updateCartQty(sku, qty);
    this.refresh();
  },

  checkout() {
    if (this.data.items.length === 0) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/checkout/checkout' });
  },
});
