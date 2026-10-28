const {
  loadCart,
  cartTotalCent,
  formatCent,
  clearCart,
  fetchCatalog,
} = require('../../utils/catalog');

Page({
  data: {
    items: [],
    totalText: '0.00',
    fulfillmentType: 'express',
    pickupPoints: [],
    pickupIndex: 0,
    address: {
      name: '',
      phone: '',
      detail: '',
    },
    simulatePaid: false,
  },

  onLoad() {
    const app = getApp();
    const items = loadCart();
    fetchCatalog().then((data) => {
      const pickupPoints = (data.pickupPoints || []).filter(
        (p) => p.districtId === app.globalData.districtId
      );
      this.setData({
        items,
        totalText: formatCent(cartTotalCent(items)),
        pickupPoints,
        districtName: app.globalData.districtName,
      });
    });
  },

  setFulfillment(e) {
    this.setData({ fulfillmentType: e.detail.value });
  },

  onPickupChange(e) {
    this.setData({ pickupIndex: Number(e.detail.value) });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`address.${field}`]: e.detail.value });
  },

  onSimulateChange(e) {
    this.setData({ simulatePaid: e.detail.value.length > 0 });
  },

  submitOrder() {
    const app = getApp();
    const { items, fulfillmentType, address, pickupPoints, pickupIndex, simulatePaid } =
      this.data;

    if (items.length === 0) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }

    let fulfillment;
    if (fulfillmentType === 'express') {
      if (!address.name || !address.phone || !address.detail) {
        wx.showToast({ title: '请填写收货信息', icon: 'none' });
        return;
      }
      fulfillment = { type: 'express', address };
    } else {
      const point = pickupPoints[pickupIndex];
      if (!point) {
        wx.showToast({ title: '暂无自提点', icon: 'none' });
        return;
      }
      fulfillment = { type: 'pickup', pickupId: point.pickupId, pickupName: point.name };
    }

    wx.showLoading({ title: '提交中' });
    wx.cloud
      .callFunction({
        name: 'createOrder',
        data: {
          districtId: app.globalData.districtId,
          items: items.map((i) => ({
            skuId: i.skuId,
            productId: i.productId,
            name: i.name,
            size: i.size,
            qty: i.qty,
            priceCent: i.priceCent,
          })),
          fulfillment,
          contact: { name: address.name, phone: address.phone },
        },
      })
      .then((res) => {
        const result = res.result || {};
        if (!result.ok) {
          wx.showToast({ title: result.message || '下单失败', icon: 'none' });
          return;
        }
        return wx.cloud
          .callFunction({
            name: 'mockPay',
            data: { orderId: result.orderId, simulatePaid },
          })
          .then((payRes) => {
            const pay = payRes.result || {};
            clearCart();
            wx.hideLoading();
            wx.showModal({
              title: 'mock 支付结果',
              content: `${pay.message || ''}\n${pay.disclaimer || '非真收款'}`,
              showCancel: false,
              success: () => {
                wx.redirectTo({
                  url: `/pages/order-detail/order-detail?id=${result.orderId}`,
                });
              },
            });
          });
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '云函数调用失败', icon: 'none' });
      });
  },
});
