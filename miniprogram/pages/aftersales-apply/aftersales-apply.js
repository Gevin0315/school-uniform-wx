const {
  RETURN_POLICY_COPY,
  AFTERSALES_STATES,
  canTransition,
} = require('../../utils/aftersales');

Page({
  data: {
    orderId: '',
    reason: '',
    policy: RETURN_POLICY_COPY,
    stateRows: Object.keys(AFTERSALES_STATES).map((key) => ({
      key,
      label: AFTERSALES_STATES[key],
    })),
    currentState: 'none',
  },

  onLoad(query) {
    this.setData({ orderId: query.orderId || '' });
  },

  onReasonInput(e) {
    this.setData({ reason: e.detail.value });
  },

  submit() {
    const next = 'applied';
    if (!canTransition(this.data.currentState, next)) {
      wx.showToast({ title: '状态不可流转', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '售后申请（骨架）',
      content: `已记录申请意向，当前状态：${AFTERSALES_STATES[next]}。Gate 2 接入真实退款通道。`,
      showCancel: false,
    });
    this.setData({ currentState: next });
  },
});
