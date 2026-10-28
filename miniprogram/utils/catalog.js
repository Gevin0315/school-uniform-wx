const CART_KEY = 'cart_items';

function loadCart() {
  return wx.getStorageSync(CART_KEY) || [];
}

function saveCart(items) {
  wx.setStorageSync(CART_KEY, items);
}

function addToCart(entry) {
  const cart = loadCart();
  const idx = cart.findIndex(
    (i) => i.skuId === entry.skuId && i.districtId === entry.districtId
  );
  if (idx >= 0) {
    cart[idx].qty += entry.qty || 1;
  } else {
    cart.push({ ...entry, qty: entry.qty || 1 });
  }
  saveCart(cart);
  return cart;
}

function updateCartQty(skuId, qty) {
  let cart = loadCart();
  cart = cart
    .map((i) => (i.skuId === skuId ? { ...i, qty } : i))
    .filter((i) => i.qty > 0);
  saveCart(cart);
  return cart;
}

function clearCart() {
  saveCart([]);
}

function cartTotalCent(cart) {
  return cart.reduce((sum, i) => sum + (i.priceCent || 0) * (i.qty || 0), 0);
}

function formatCent(cent) {
  return (cent / 100).toFixed(2);
}

function fetchCatalog() {
  return wx.cloud.callFunction({ name: 'listCatalog' }).then((res) => {
    const result = res.result || {};
    if (!result.ok) {
      return Promise.reject(new Error(result.message || '加载目录失败'));
    }
    return result.data;
  });
}

module.exports = {
  CART_KEY,
  loadCart,
  saveCart,
  addToCart,
  updateCartQty,
  clearCart,
  cartTotalCent,
  formatCent,
  fetchCatalog,
};
