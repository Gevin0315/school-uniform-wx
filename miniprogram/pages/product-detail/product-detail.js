const {
  fetchCatalog,
  addToCartWithDistrictPolicy,
  districtNameFor,
  formatCent,
  productListPriceCent,
} = require('../../utils/catalog');
const { effectiveLineStock } = require('../../utils/stock');
const { RETURN_POLICY_COPY } = require('../../utils/aftersales');

Page({
  data: {
    product: null,
    catalog: null,
    skus: [],
    selectedSize: null,
    selectedSku: null,
    sizeChart: [],
    returnPolicy: RETURN_POLICY_COPY,
    returnPolicyShort:
      '支持 7 天无理由退货，尺码问题可申请换码。具体以收到实物及平台规则为准。',
    qty: 1,
    districtLabel: '',
    seasonLabel: '',
    listPriceText: '',
    gallery: [1],
  },

  onLoad(query) {
    const productId = query.id;
    fetchCatalog().then((data) => {
      const product = (data.products || []).find((p) => p.productId === productId);
      const skus = (data.skus || []).filter((s) => s.productId === productId);
      const sizes = data.sizes || [110, 120, 130, 140, 150, 160, 170, 180];
      const seasonLabels = Object.fromEntries(
        (data.seasons || []).map((s) => [s.seasonId, s.label])
      );
      const listPriceText = product
        ? formatCent(productListPriceCent(product, data))
        : '';
      this.setData({
        product,
        catalog: data,
        skus,
        sizeChart: sizes,
        districtLabel: product
          ? districtNameFor(data, product.districtId)
          : '',
        seasonLabel: product ? seasonLabels[product.seasonId] || '' : '',
        listPriceText,
        gallery: [1, 2, 3, 4],
      });
    });
  },

  onSizeGuideTap() {
    wx.showToast({ title: '尺码指南即将上线', icon: 'none' });
  },

  pickSize(e) {
    const size = Number(e.currentTarget.dataset.size);
    const sku = this.data.skus.find((s) => s.size === size);
    const { product, catalog } = this.data;
    const stock = product
      ? effectiveLineStock(product, size, catalog)
      : sku
        ? sku.stock
        : 0;
    this.setData({
      selectedSize: size,
      selectedSku: sku,
      priceText: sku ? formatCent(sku.priceCent) : '',
      stock,
    });
  },

  changeQty(e) {
    const delta = Number(e.currentTarget.dataset.delta);
    const qty = Math.max(1, Math.min(99, (this.data.qty || 1) + delta));
    this.setData({ qty });
  },

  buildCartEntry() {
    const { selectedSku, product, qty } = this.data;
    if (!selectedSku || !product) {
      return null;
    }
    const stock = effectiveLineStock(product, selectedSku.size, this.data.catalog);
    if (stock < qty) {
      wx.showToast({ title: '库存不足', icon: 'none' });
      return null;
    }
    return {
      skuId: selectedSku.skuId,
      productId: product.productId,
      productType: product.type,
      name: product.name,
      size: selectedSku.size,
      priceCent: selectedSku.priceCent,
      districtId: product.districtId,
      typeLabel: product.typeLabel,
      qty,
    };
  },

  addCart() {
    const entry = this.buildCartEntry();
    if (!entry) {
      wx.showToast({ title: '请选择有库存的尺码', icon: 'none' });
      return;
    }
    addToCartWithDistrictPolicy(entry, this.data.catalog).then(({ added }) => {
      if (added) {
        wx.showToast({ title: '已加入购物车' });
      }
    });
  },

  addSetBundle() {
    const { product } = this.data;
    if (!product || product.type !== 'set') {
      this.addCart();
      return;
    }
    const entry = this.buildCartEntry();
    if (!entry) {
      return;
    }
    addToCartWithDistrictPolicy(entry, this.data.catalog).then(({ added }) => {
      if (!added) {
        return;
      }
      wx.showToast({ title: '成套已加购' });
      wx.navigateTo({ url: '/pages/cart/cart' });
    });
  },
});
