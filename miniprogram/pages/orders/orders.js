const { loadOrders } = require('../../utils/orders');
const { enrichOrderList } = require('../../utils/orderView');

Page({
  data: {
    orders: [],
    hint: '暂无订单，完成选购后可在此查看',
  },

  onShow() {
    this.loadOrderList();
  },

  loadOrderList() {
    const local = enrichOrderList(loadOrders());
    if (local.length > 0) {
      this.setData({ orders: local, hint: '' });
      return;
    }

    const app = getApp();
    if (app.globalData.useLocalPreview !== false || !wx.cloud) {
      this.setData({ orders: [], hint: '暂无订单，完成选购后可在此查看' });
      return;
    }

    const db = wx.cloud.database();
    db.collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()
      .then((res) => {
        const orders = enrichOrderList(res.data || []);
        this.setData({
          orders,
          hint: orders.length ? '' : '暂无订单',
        });
      })
      .catch(() => {
        this.setData({ orders: [], hint: '加载失败，请稍后重试' });
      });
  },

  openOrder(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` });
  },
});
