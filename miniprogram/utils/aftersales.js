/**
 * 售后状态机骨架（Gate 1 仅占位，不含真实退款通道）
 */
const AFTERSALES_STATES = {
  none: '无售后',
  applied: '已申请',
  reviewing: '审核中',
  approved: '已通过',
  rejected: '已拒绝',
  returned: '已退货',
  refunded_mock: '退款演示（非真打款）',
};

const RETURN_POLICY_COPY =
  '支持 7 天无理由退货：商品吊牌未摘、未穿洗、不影响二次销售。具体以收到实物及平台规则为准。';

function canTransition(from, to) {
  const edges = {
    none: ['applied'],
    applied: ['reviewing', 'rejected'],
    reviewing: ['approved', 'rejected'],
    approved: ['returned'],
    returned: ['refunded_mock'],
    rejected: [],
    refunded_mock: [],
  };
  return (edges[from] || []).includes(to);
}

module.exports = {
  AFTERSALES_STATES,
  RETURN_POLICY_COPY,
  canTransition,
};
