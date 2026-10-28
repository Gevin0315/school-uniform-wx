const { getCatalog } = require('./seed');
const { effectiveLineStock } = require('./stock');

const CART_KEY = 'cart_items';
const ADDRESS_KEY = 'user_address';

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

function removeFromCart(skuId) {
  return updateCartQty(skuId, 0);
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

function loadAddress() {
  return (
    wx.getStorageSync(ADDRESS_KEY) || {
      name: '',
      phone: '',
      detail: '',
    }
  );
}

function saveAddress(address) {
  wx.setStorageSync(ADDRESS_KEY, address);
}

function shouldUseLocalPreview() {
  const app = getApp();
  return app.globalData.useLocalPreview !== false;
}

function isCloudConfigured() {
  const app = getApp();
  return app.globalData.useLocalPreview === false;
}

function fetchCatalog() {
  if (shouldUseLocalPreview()) {
    return Promise.resolve(getCatalog());
  }
  return wx.cloud
    .callFunction({ name: 'listCatalog' })
    .then((res) => {
      const result = res.result || {};
      if (!result.ok) {
        return Promise.reject(new Error(result.message || '加载目录失败'));
      }
      return result.data;
    })
    .catch(() => getCatalog());
}

function productListPriceCent(product, catalog) {
  const skus = (catalog.skus || []).filter(
    (s) => s.productId === product.productId && s.priceCent > 0
  );
  if (!skus.length) {
    return 0;
  }
  return Math.min(...skus.map((s) => s.priceCent));
}

function productStockLabel(product, catalog) {
  const sizes = catalog.sizes || [110, 120, 130, 140, 150, 160, 170, 180];
  let maxStock = 0;
  for (const size of sizes) {
    const stock = effectiveLineStock(product, size, catalog);
    if (stock > maxStock) {
      maxStock = stock;
    }
  }
  if (maxStock <= 0) {
    return { text: '缺货', level: 'out' };
  }
  if (maxStock <= 5) {
    return { text: '库存紧张', level: 'low' };
  }
  return { text: '有货', level: 'ok' };
}

function enrichProductCards(products, catalog) {
  return products.map((p) => {
    const priceCent = productListPriceCent(p, catalog);
    const stockInfo = productStockLabel(p, catalog);
    return {
      ...p,
      priceText: formatCent(priceCent),
      stockText: stockInfo.text,
      stockLevel: stockInfo.level,
    };
  });
}

module.exports = {
  CART_KEY,
  ADDRESS_KEY,
  loadCart,
  saveCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  cartTotalCent,
  formatCent,
  loadAddress,
  saveAddress,
  fetchCatalog,
  productListPriceCent,
  productStockLabel,
  enrichProductCards,
  isCloudConfigured,
};
