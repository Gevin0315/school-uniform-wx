const { fetchCatalog, addToCart, formatCent } = require('../../utils/catalog');

Page({
  data: {
    product: null,
    skus: [],
    selectedSize: null,
    selectedSku: null,
    sizeChart: [],
  },

  onLoad(query) {
    const productId = query.id;
    const app = getApp();
    fetchCatalog().then((data) => {
      const product = (data.products || []).find((p) => p.productId === productId);
      const skus = (data.skus || []).filter((s) => s.productId === productId);
      const sizes = data.sizes || [110, 120, 130, 140, 150, 160, 170, 180];
      this.setData({
        product,
        skus,
        sizeChart: sizes,
      });
      if (!product || product.districtId !== app.globalData.districtId) {
        wx.showToast({ title: '请先在首页选择区县', icon: 'none' });
      }
    });
  },

  pickSize(e) {
    const size = Number(e.currentTarget.dataset.size);
    const sku = this.data.skus.find((s) => s.size === size);
    this.setData({
      selectedSize: size,
      selectedSku: sku,
      priceText: sku ? formatCent(sku.priceCent) : '',
      stock: sku ? sku.stock : 0,
    });
  },

  addCart() {
    const { selectedSku, product } = this.data;
    const app = getApp();
    if (!selectedSku || selectedSku.stock <= 0) {
      wx.showToast({ title: '请选择有库存的尺码', icon: 'none' });
      return;
    }
    addToCart({
      skuId: selectedSku.skuId,
      productId: product.productId,
      name: product.name,
      size: selectedSku.size,
      priceCent: selectedSku.priceCent,
      districtId: app.globalData.districtId,
      typeLabel: product.typeLabel,
    });
    wx.showToast({ title: '已加入购物车' });
  },
});
