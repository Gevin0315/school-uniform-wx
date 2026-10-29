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

function districtNameFor(catalog, districtId) {
  const row = (catalog.districts || []).find((d) => d.districtId === districtId);
  return row ? row.name : '';
}

function syncSelectedDistrict(districtId, catalog) {
  const app = getApp();
  const districtName = districtNameFor(catalog, districtId);
  app.globalData.districtId = districtId;
  app.globalData.districtName = districtName;
  wx.setStorageSync('selectedDistrict', {
    districtId,
    districtName,
  });
  return districtName;
}

function cartDistrictId(cart) {
  if (!cart || cart.length === 0) {
    return '';
  }
  return cart[0].districtId || '';
}

/**
 * 同一购物车不可跨区；加购他区商品时提示后清空再加。
 * @returns {Promise<{ added: boolean }>}
 */
function addToCartWithDistrictPolicy(entry, catalog) {
  const cart = loadCart();
  const entryDistrict = entry.districtId;
  if (!entryDistrict) {
    return Promise.resolve({ added: false });
  }
  if (cart.length === 0) {
    syncSelectedDistrict(entryDistrict, catalog);
    addToCart(entry);
    return Promise.resolve({ added: true });
  }
  const existingDistrict = cartDistrictId(cart);
  if (existingDistrict === entryDistrict) {
    addToCart(entry);
    return Promise.resolve({ added: true });
  }
  const fromName = districtNameFor(catalog, existingDistrict) || '其他区县';
  const toName = districtNameFor(catalog, entryDistrict) || '当前区县';
  return new Promise((resolve) => {
    wx.showModal({
      title: '切换区县',
      content: `购物车已有「${fromName}」商品，继续将清空购物车并加入「${toName}」商品。`,
      confirmText: '清空并加入',
      cancelText: '取消',
      success: (res) => {
        if (!res.confirm) {
          resolve({ added: false });
          return;
        }
        clearCart();
        syncSelectedDistrict(entryDistrict, catalog);
        addToCart(entry);
        resolve({ added: true });
      },
    });
  });
}

function ensureDistrictFromCart(catalog) {
  const app = getApp();
  if (app.globalData.districtId) {
    return true;
  }
  const cart = loadCart();
  const fromCart = cartDistrictId(cart);
  if (!fromCart) {
    return false;
  }
  syncSelectedDistrict(fromCart, catalog);
  return true;
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
  addToCartWithDistrictPolicy,
  syncSelectedDistrict,
  cartDistrictId,
  ensureDistrictFromCart,
  districtNameFor,
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
