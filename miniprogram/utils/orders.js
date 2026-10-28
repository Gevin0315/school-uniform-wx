const ORDERS_KEY = 'local_orders';

function loadOrders() {
  return wx.getStorageSync(ORDERS_KEY) || [];
}

function saveOrders(orders) {
  wx.setStorageSync(ORDERS_KEY, orders);
}

function getOrderById(orderId) {
  return loadOrders().find((o) => o.orderId === orderId) || null;
}

function upsertOrder(order) {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.orderId === order.orderId);
  if (idx >= 0) {
    orders[idx] = order;
  } else {
    orders.unshift(order);
  }
  saveOrders(orders);
  return order;
}

function createLocalOrder(payload) {
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();
  const order = {
    orderId,
    districtId: payload.districtId,
    items: payload.items,
    stockDeductions: payload.stockDeductions || [],
    fulfillment: payload.fulfillment,
    contact: payload.contact || {},
    remark: payload.remark || '',
    status: 'pending_pay',
    payment: {
      channel: 'placeholder',
      paid: false,
      note: '待支付（支付能力未接入，非真收款）',
    },
    aftersales: payload.aftersales || { state: 'none' },
    amountCent: payload.amountCent,
    pickupCode: payload.pickupCode || '',
    createdAt: now,
    updatedAt: now,
  };
  upsertOrder(order);
  return order;
}

function updateOrderAftersales(orderId, patch) {
  const order = getOrderById(orderId);
  if (!order) {
    return null;
  }
  order.aftersales = { ...order.aftersales, ...patch };
  order.updatedAt = Date.now();
  upsertOrder(order);
  return order;
}

module.exports = {
  ORDERS_KEY,
  loadOrders,
  getOrderById,
  upsertOrder,
  createLocalOrder,
  updateOrderAftersales,
};
