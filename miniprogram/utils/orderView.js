const { formatCent } = require('./catalog');
const {
  labelOrderStatus,
  labelAftersales,
  generatePickupCodePlaceholder,
} = require('./orderStatus');

function sumItemsCent(items) {
  return (items || []).reduce(
    (sum, line) => sum + (line.priceCent || 0) * (line.qty || 1),
    0
  );
}

function pickupStatusText(order) {
  if (!order || !order.fulfillment || order.fulfillment.type !== 'pickup') {
    return '';
  }
  switch (order.status) {
    case 'pending_pay':
      return '待支付 · 自提核销码支付后生效';
    case 'pending_pickup':
      return '待自提 · 请凭核销码到店';
    case 'completed':
      return '已核销';
    default:
      return labelOrderStatus(order.status);
  }
}

function fulfillmentSummary(order) {
  if (!order || !order.fulfillment) {
    return '—';
  }
  const f = order.fulfillment;
  if (f.type === 'express') {
    const addr = f.address || {};
    return `快递 · ${addr.name || ''} ${addr.phone || ''} ${addr.detail || ''}`.trim();
  }
  if (f.type === 'pickup') {
    return `自提 · ${f.pickupName || f.pickupId || '虚拟自提点'}`;
  }
  return f.type;
}

function enrichOrder(order) {
  if (!order) {
    return null;
  }
  const items = (order.items || []).map((line) => ({
    ...line,
    lineTotalText: formatCent((line.priceCent || 0) * (line.qty || 1)),
  }));
  const amountCent = order.amountCent != null ? order.amountCent : sumItemsCent(items);
  const isPickup = order.fulfillment && order.fulfillment.type === 'pickup';
  const pickupCode =
    order.pickupCode ||
    (isPickup ? generatePickupCodePlaceholder(order.orderId) : '');

  return {
    ...order,
    items,
    amountText: formatCent(amountCent),
    statusLabel: labelOrderStatus(order.status),
    aftersalesLabel: labelAftersales(
      order.aftersales ? order.aftersales.state : 'none'
    ),
    fulfillmentText: fulfillmentSummary(order),
    pickupCode,
    pickupStatusText: pickupStatusText(order),
    showPickupBlock: isPickup,
    payDisabled: order.status === 'pending_pay',
  };
}

function enrichOrderList(orders) {
  return (orders || []).map((order) => {
    const amountCent =
      order.amountCent != null ? order.amountCent : sumItemsCent(order.items);
    return {
      ...order,
      statusLabel: labelOrderStatus(order.status),
      amountText: formatCent(amountCent),
    };
  });
}

module.exports = {
  enrichOrder,
  enrichOrderList,
  sumItemsCent,
};
