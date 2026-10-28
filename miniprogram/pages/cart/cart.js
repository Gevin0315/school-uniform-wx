const {
  loadCart,
  updateCartQty,
  removeFromCart,
  cartTotalCent,
  formatCent,
  fetchCatalog,
} = require('../../utils/catalog');
const { getComponentSkusForSet } = require('../../utils/localStock');

Page({
  data: {
    items: [],
    totalText: '0.00',
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const rawItems = loadCart();
    fetchCatalog().then((catalog) => {
      const items = rawItems.map((line) => {
        let componentLines = [];
        if (line.productType === 'set') {
          componentLines = getComponentSkusForSet(
            line.productId,
            line.size,
            catalog
          );
        }
        return {
          ...line,
          lineTotalText: formatCent((line.priceCent || 0) * (line.qty || 0)),
          componentLines,
        };
      });
      this.setData({
        items,
        totalText: formatCent(cartTotalCent(rawItems)),
      });
    });
  },

  changeQty(e) {
    const { sku, delta } = e.currentTarget.dataset;
    const item = this.data.items.find((i) => i.skuId === sku);
    if (!item) {
      return;
    }
    const qty = Math.max(0, (item.qty || 0) + Number(delta));
    updateCartQty(sku, qty);
    this.refresh();
  },

  removeLine(e) {
    const { sku } = e.currentTarget.dataset;
    removeFromCart(sku);
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
