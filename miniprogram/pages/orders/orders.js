const { loadOrders } = require('../../utils/orders');
const { enrichOrderList } = require('../../utils/orderView');

const STATUS_FILTERS = {
  pending_pay: (o) => o.status === 'pending_pay',
  pending_ship: (o) => o.status === 'pending_ship',
  pending_pickup: (o) => o.status === 'pending_pickup',
  aftersales: (o) =>
    o.aftersales && o.aftersales.state && o.aftersales.state !== 'none',
};

Page({
  data: {
    orders: [],
    hint: '暂无订单，完成选购后可在此查看',
    statusFilter: '',
  },

  onLoad(query) {
    this.setData({
      statusFilter: query.status || '',
    });
  },

  onShow() {
    this.loadOrderList();
  },

  filterOrders(orders) {
    const { statusFilter } = this.data;
    const fn = STATUS_FILTERS[statusFilter];
    if (!fn) {
      return orders;
    }
    return orders.filter(fn);
  },

  loadOrderList() {
    const local = this.filterOrders(enrichOrderList(loadOrders()));
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
        const orders = this.filterOrders(enrichOrderList(res.data || []));
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
