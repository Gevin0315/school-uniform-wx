const { cartTotalCent } = require('./catalog');
const { reserveAndDeductStock } = require('./localStock');
const { createLocalOrder, upsertOrder } = require('./orders');
const { generatePickupCodePlaceholder } = require('./orderStatus');

function submitOrderLocal({ districtId, items, fulfillment, contact, remark }) {
  const stockResult = reserveAndDeductStock(items);
  if (!stockResult.ok) {
    return stockResult;
  }

  const order = createLocalOrder({
    districtId,
    items,
    stockDeductions: stockResult.stockDeductions,
    fulfillment,
    contact,
    remark,
    amountCent: cartTotalCent(items),
    pickupCode: '',
  });

  if (fulfillment.type === 'pickup') {
    order.pickupCode = generatePickupCodePlaceholder(order.orderId);
    upsertOrder(order);
  }

  return {
    ok: true,
    orderId: order.orderId,
    status: order.status,
    order,
  };
}

function submitOrderCloud(app, { items, fulfillment, contact, remark }) {
  return wx.cloud
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
        contact,
        remark,
      },
    })
    .then((res) => {
      const result = res.result || {};
      if (!result.ok) {
        return result;
      }
      const order = result.order || {};
      const localOrder = {
        ...order,
        amountCent: cartTotalCent(items),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      if (localOrder.fulfillment && localOrder.fulfillment.type === 'pickup') {
        localOrder.pickupCode = generatePickupCodePlaceholder(result.orderId);
      }
      upsertOrder(localOrder);
      return {
        ok: true,
        orderId: result.orderId,
        status: result.status,
      };
    });
}

module.exports = {
  submitOrderLocal,
  submitOrderCloud,
};
