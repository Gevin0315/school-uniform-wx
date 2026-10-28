const cloud = require('wx-server-sdk');
const { reserveAndDeductStock } = require('../common/stock');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const ORDER_STATUS = {
  PENDING_PAY: 'pending_pay',
};

/**
 * 创建订单：校验并扣减库存（套装按组件 SKU 全量扣减，任一不足则整单失败）
 */
exports.main = async (event) => {
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

  const stockResult = await reserveAndDeductStock(db, items);
  if (!stockResult.ok) {
    return stockResult;
  }

  const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = db.serverDate();
  const order = {
    orderId,
    openid: wxContext.OPENID,
    districtId,
    items,
    stockDeductions: stockResult.stockDeductions,
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
    console.warn('[createOrder] 写库失败，库存已扣减（seed 模式）或需人工核对', err);
  }

  return {
    ok: true,
    orderId,
    status: order.status,
    paymentNote: order.payment.note,
    stockDeductions: stockResult.stockDeductions,
    order,
  };
};
