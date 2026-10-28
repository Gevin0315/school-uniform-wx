Page({
  data: {
    orders: [],
    hint: 'Gate 1：订单列表需云数据库 orders 集合；本地可先查看最近下单详情页',
  },

  onShow() {
    this.loadOrders();
  },

  loadOrders() {
    const db = wx.cloud.database();
    db.collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()
      .then((res) => {
        this.setData({ orders: res.data || [] });
      })
      .catch(() => {
        this.setData({ orders: [] });
      });
  },

  openOrder(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` });
  },
});
