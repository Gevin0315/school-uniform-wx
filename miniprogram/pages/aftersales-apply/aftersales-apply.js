const {
  RETURN_POLICY_COPY,
  AFTERSALES_STATES,
  AFTERSALES_REASONS,
  canTransition,
} = require('../../utils/aftersales');
const { getOrderById, updateOrderAftersales } = require('../../utils/orders');
const { labelAftersales } = require('../../utils/orderStatus');

Page({
  data: {
    orderId: '',
    reasons: AFTERSALES_REASONS,
    reasonIndex: 0,
    note: '',
    policy: RETURN_POLICY_COPY,
    currentState: 'none',
    stateLabel: '未申请',
  },

  onLoad(query) {
    const orderId = query.orderId || '';
    let currentState = 'none';
    const order = getOrderById(orderId);
    if (order && order.aftersales && order.aftersales.state) {
      currentState = order.aftersales.state;
    }
    this.setData({
      orderId,
      currentState,
      stateLabel: labelAftersales(currentState),
    });
  },

  onReasonChange(e) {
    this.setData({ reasonIndex: Number(e.detail.value) });
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value });
  },

  submit() {
    const { orderId, reasons, reasonIndex, note, currentState } = this.data;
    if (!orderId) {
      wx.showToast({ title: '缺少订单号', icon: 'none' });
      return;
    }
    const next = 'applied';
    if (!canTransition(currentState, next)) {
      wx.showToast({ title: '当前状态不可重复申请', icon: 'none' });
      return;
    }
    const reason = reasons[reasonIndex] || reasons[0];
    updateOrderAftersales(orderId, {
      state: next,
      reason,
      note,
      appliedAt: Date.now(),
    });
    wx.showModal({
      title: '售后已提交',
      content: `原因：${reason}\n状态：${AFTERSALES_STATES.reviewing}（演示流转，不含真实退款）`,
      showCancel: false,
    });
    this.setData({
      currentState: 'reviewing',
      stateLabel: labelAftersales('reviewing'),
    });
    updateOrderAftersales(orderId, { state: 'reviewing' });
  },
});
