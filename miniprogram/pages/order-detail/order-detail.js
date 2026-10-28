const { getOrderById } = require('../../utils/orders');
const { enrichOrder } = require('../../utils/orderView');

Page({
  data: {
    order: null,
    payHint: '微信支付未接入，请勿当作已付款',
  },

  onLoad(query) {
    this.loadOrder(query.id);
  },

  onShow() {
    if (this.data.order && this.data.order.orderId) {
      this.loadOrder(this.data.order.orderId);
    }
  },

  loadOrder(orderId) {
    if (!orderId) {
      return;
    }
    let order = getOrderById(orderId);
    if (!order) {
      const app = getApp();
      if (app.globalData.useLocalPreview === false && wx.cloud) {
        const db = wx.cloud.database();
        db.collection('orders')
          .where({ orderId })
          .limit(1)
          .get()
          .then((res) => {
            order = (res.data && res.data[0]) || null;
            this.setData({ order: enrichOrder(order) });
          });
        return;
      }
    }
    this.setData({ order: enrichOrder(order) });
  },

  applyAftersales() {
    const { order } = this.data;
    if (!order) {
      return;
    }
    wx.navigateTo({
      url: `/pages/aftersales-apply/aftersales-apply?orderId=${order.orderId}`,
    });
  },

  onPayTap() {
    wx.showToast({
      title: '支付能力占位，订单仍为待支付',
      icon: 'none',
    });
  },
});
