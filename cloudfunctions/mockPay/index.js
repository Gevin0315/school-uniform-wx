const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

/**
 * Mock 支付：生产路径仅演示「待支付」；测试环境可传 simulatePaid=true 便于履约联调
 * 日志与返回字段必须标明非真收款
 */
exports.main = async (event) => {
  const { orderId, simulatePaid = false } = event;

  if (!orderId) {
    return { ok: false, code: 'INVALID_PARAMS', message: '缺少 orderId' };
  }

  const disclaimer = '非真收款 · mockPay 演示';

  if (!simulatePaid) {
    console.log('[mockPay]', disclaimer, 'orderId=', orderId, 'status=pending_pay');
    return {
      ok: true,
      orderId,
      status: 'pending_pay',
      paid: false,
      message: '演示：订单仍为待支付，请完成 mock 流程或联系运营测试环境',
      disclaimer,
    };
  }

  const update = {
    status: 'paid_mock_test_only',
    'payment.paid': true,
    'payment.paidAt': db.serverDate(),
    'payment.disclaimer': disclaimer,
    updatedAt: db.serverDate(),
  };

  try {
    await db
      .collection('orders')
      .where({ orderId })
      .update({ data: update });
  } catch (err) {
    console.warn('[mockPay] 更新订单失败', err);
  }

  console.log('[mockPay]', disclaimer, 'TEST simulatePaid orderId=', orderId);

  return {
    ok: true,
    orderId,
    status: 'paid_mock_test_only',
    paid: true,
    message: '测试环境模拟已付，仅用于履约联调',
    disclaimer,
  };
};
