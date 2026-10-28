Page({
  data: {
    order: null,
  },

  onLoad(query) {
    const orderId = query.id;
    if (!orderId) return;
    const db = wx.cloud.database();
    db.collection('orders')
      .where({ orderId })
      .limit(1)
      .get()
      .then((res) => {
        const order = (res.data && res.data[0]) || null;
        this.setData({ order });
      });
  },

  applyAftersales() {
    const { order } = this.data;
    if (!order) return;
    wx.navigateTo({
      url: `/pages/aftersales-apply/aftersales-apply?orderId=${order.orderId}`,
    });
  },
});
