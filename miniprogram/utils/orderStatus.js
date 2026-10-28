const ORDER_STATUS_LABEL = {
  pending_pay: '待支付',
  pending_ship: '待发货',
  pending_pickup: '待自提',
  completed: '完成',
  paid_mock_test_only: '已支付（测试/mock）',
};

const AFTERSALES_UI_LABEL = {
  none: '未申请',
  applied: '已提交',
  reviewing: '处理中',
  approved: '同意',
  rejected: '拒绝',
  returned: '退货中',
  refunded_mock: '退款演示',
};

function labelOrderStatus(status) {
  return ORDER_STATUS_LABEL[status] || status || '未知';
}

function labelAftersales(state) {
  return AFTERSALES_UI_LABEL[state] || state || '—';
}

function generatePickupCodePlaceholder(orderId) {
  const tail = (orderId || '').slice(-6).toUpperCase();
  return `ZT-${tail || '000000'}`;
}

module.exports = {
  ORDER_STATUS_LABEL,
  labelOrderStatus,
  labelAftersales,
  generatePickupCodePlaceholder,
};
