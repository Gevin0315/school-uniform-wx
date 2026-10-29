const {
  loadCart,
  cartTotalCent,
  formatCent,
  fetchCatalog,
  clearCart,
  loadAddress,
  saveAddress,
  ensureDistrictFromCart,
} = require('../../utils/catalog');
const {
  effectiveLineStock,
  formatStockFailureMessage,
} = require('../../utils/stock');
const { submitOrderLocal, submitOrderCloud } = require('../../utils/checkout');

Page({
  data: {
    items: [],
    totalText: '0.00',
    fulfillmentType: 'pickup',
    pickupPoints: [],
    pickupIndex: 0,
    address: {
      name: '',
      phone: '',
      detail: '',
    },
    districtName: '',
  },

  onLoad() {
    const app = getApp();
    const items = loadCart();
    const savedAddress = loadAddress();
    fetchCatalog().then((data) => {
      ensureDistrictFromCart(data);
      const districtId = app.globalData.districtId;
      if (!districtId) {
        wx.showModal({
          title: '请选择区县',
          content: '结算需要所属区县以匹配自提点，请先选区或返回购物车加购商品。',
          confirmText: '去选区',
          showCancel: false,
          success: () => {
            wx.navigateTo({ url: '/pages/district-select/district-select' });
          },
        });
        return;
      }
      const pickupPoints = (data.pickupPoints || []).filter(
        (p) => p.districtId === districtId
      );
      const productsById = new Map(
        (data.products || []).map((p) => [p.productId, p])
      );
      const stockErrors = [];
      for (const line of items) {
        const product = productsById.get(line.productId);
        const available = effectiveLineStock(product, line.size, data);
        if (available < (line.qty || 1)) {
          stockErrors.push(line.name);
        }
      }
      if (stockErrors.length > 0) {
        wx.showModal({
          title: '库存不足',
          content:
            '成套需各组件均有货，以下商品无法整单购买：' + stockErrors.join('、'),
          showCancel: false,
        });
      }
      this.setData({
        items,
        catalog: data,
        totalText: formatCent(cartTotalCent(items)),
        pickupPoints,
        districtName: app.globalData.districtName,
        address: savedAddress,
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

  submitOrder() {
    const app = getApp();
    const { items, fulfillmentType, address, pickupPoints, pickupIndex } =
      this.data;

    if (items.length === 0) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }

    let fulfillment;
    let contact = { name: address.name, phone: address.phone };

    if (fulfillmentType === 'express') {
      if (!address.name || !address.phone || !address.detail) {
        wx.showToast({ title: '请填写快递收货信息', icon: 'none' });
        return;
      }
      fulfillment = { type: 'express', address: { ...address } };
      saveAddress({ ...address });
    } else if (fulfillmentType === 'pickup') {
      const point = pickupPoints[pickupIndex];
      if (!point) {
        wx.showToast({ title: '暂无自提点', icon: 'none' });
        return;
      }
      fulfillment = {
        type: 'pickup',
        pickupId: point.pickupId,
        pickupName: point.name,
        pickupAddress: point.address,
      };
      contact = {
        name: address.name || '自提联系人',
        phone: address.phone || '',
      };
    } else {
      wx.showToast({ title: '请选择配送方式', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中' });

    const finish = (result) => {
      wx.hideLoading();
      if (!result.ok) {
        wx.showModal({
          title: '无法下单',
          content: formatStockFailureMessage(result),
          showCancel: false,
        });
        return;
      }
      clearCart();
      wx.redirectTo({
        url: `/pages/order-detail/order-detail?id=${result.orderId}`,
      });
    };

    if (app.globalData.useLocalPreview !== false) {
      const result = submitOrderLocal({
        districtId: app.globalData.districtId,
        items,
        fulfillment,
        contact,
      });
      finish(result);
      return;
    }

    submitOrderCloud(app, { items, fulfillment, contact })
      .then(finish)
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '提交失败', icon: 'none' });
      });
  },
});
