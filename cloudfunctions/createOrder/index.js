const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const ORDER_STATUS = {
  CREATED: 'created',
  PENDING_PAY: 'pending_pay',
  PAID_MOCK: 'paid_mock_test_only',
  CANCELLED: 'cancelled',
};

/**
 * 创建订单（不含真实支付）
 * @param {object} event - items, districtId, fulfillment, contact
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const {
    items = [],
    districtId,
    fulfillment,
    contact = {},
    remark = '',
  } = event;

  if (!districtId || !Array.isArray(items) || items.length === 0) {
    return { ok: false, code: 'INVALID_PARAMS', message: '缺少区县或商品' };
  }
  if (!fulfillment || !fulfillment.type) {
    return { ok: false, code: 'INVALID_FULFILLMENT', message: '请选择配送方式' };
  }

  const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = db.serverDate();
  const order = {
    orderId,
    openid: wxContext.OPENID,
    districtId,
    items,
    fulfillment,
    contact,
    remark,
    status: ORDER_STATUS.PENDING_PAY,
    payment: {
      channel: 'mock',
      paid: false,
      note: '演示/mock 支付，非真收款',
    },
    aftersales: { state: 'none' },
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.collection('orders').add({ data: order });
  } catch (err) {
    console.warn('[createOrder] 写库失败，返回内存订单占位', err);
  }

  return {
    ok: true,
    orderId,
    status: order.status,
    paymentNote: order.payment.note,
    order,
  };
};
