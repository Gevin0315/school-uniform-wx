/**
 * 客户端库存展示/加购校验（与服务端 createOrder 规则一致：套装取组件最小库存）
 */
function effectiveLineStock(product, size, catalog) {
  if (!product || !catalog) {
    return 0;
  }
  if (product.type !== 'set') {
    const sku = (catalog.skus || []).find(
      (s) => s.productId === product.productId && s.size === size
    );
    return sku ? sku.stock : 0;
  }

  const setComponents = catalog.setComponents || {};
  const componentProductIds = setComponents[product.productId];
  if (!componentProductIds || componentProductIds.length === 0) {
    return 0;
  }

  const stocks = componentProductIds.map((compPid) => {
    const compSku = (catalog.skus || []).find(
      (s) => s.productId === compPid && s.size === size
    );
    return compSku ? compSku.stock : 0;
  });
  return stocks.length ? Math.min(...stocks) : 0;
}

function formatStockFailureMessage(result) {
  if (result.code !== 'INSUFFICIENT_STOCK') {
    return result.message || '下单失败';
  }
  const failures = result.failures || [];
  if (failures.length === 0) {
    return result.message;
  }
  const first = failures[0];
  return `${result.message}（如 ${first.skuId} 需 ${first.need}，余 ${first.available}）`;
}

module.exports = {
  effectiveLineStock,
  formatStockFailureMessage,
};
