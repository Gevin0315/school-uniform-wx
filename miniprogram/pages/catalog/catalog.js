const {
  fetchCatalog,
  enrichProductCards,
  addToCartWithDistrictPolicy,
  formatCent,
} = require('../../utils/catalog');
const { effectiveLineStock } = require('../../utils/stock');

Page({
  data: {
    districtName: '',
    products: [],
    displayProducts: [],
    seasons: [],
    filterSeason: '',
    setsOnly: false,
  },

  onLoad(query) {
    if (query.season) {
      this.setData({ filterSeason: query.season });
    }
    if (query.setsOnly === '1') {
      this.setData({ setsOnly: true });
    }
  },

  onShow() {
    const app = getApp();
    this.setData({ districtName: app.globalData.districtName || '全部样板区' });
    this.loadProducts(app.globalData.districtId);
  },

  loadProducts(districtId) {
    fetchCatalog().then((data) => {
      const enabledIds = new Set(
        (data.districts || [])
          .filter((d) => d.enabled)
          .map((d) => d.districtId)
      );
      let products = (data.products || []).filter(
        (p) => enabledIds.has(p.districtId) && p.type !== 'component'
      );
      if (districtId) {
        products = products.filter((p) => p.districtId === districtId);
      }
      if (this.data.setsOnly) {
        products = products.filter((p) => p.type === 'set');
      }
      const enriched = enrichProductCards(products, data);
      this.setData({
        products: enriched,
        seasons: data.seasons || [],
        catalog: data,
      });
      this.applySeasonFilter(this.data.filterSeason);
    });
  },

  applySeasonFilter(seasonId) {
    const { products } = this.data;
    let list = products;
    if (seasonId) {
      list = products.filter((p) => p.seasonId === seasonId);
    }
    this.setData({
      filterSeason: seasonId || '',
      displayProducts: list,
    });
  },

  onSeasonTap(e) {
    const season = e.currentTarget.dataset.season;
    const next = this.data.filterSeason === season ? '' : season;
    this.applySeasonFilter(next);
  },

  openProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },

  oneClickSet() {
    fetchCatalog().then((data) => {
      const setProduct = (this.data.products || []).find(
        (p) =>
          p.type === 'set' &&
          (!this.data.filterSeason || p.seasonId === this.data.filterSeason)
      );
      if (!setProduct) {
        wx.showToast({ title: '当前筛选下暂无套装', icon: 'none' });
        return;
      }
      const size = 140;
      const sku = (data.skus || []).find(
        (s) => s.productId === setProduct.productId && s.size === size
      );
      const stock = effectiveLineStock(setProduct, size, data);
      if (!sku || stock <= 0) {
        wx.showToast({ title: '默认尺码 140 暂无库存', icon: 'none' });
        return;
      }
      addToCartWithDistrictPolicy(
        {
          skuId: sku.skuId,
          productId: setProduct.productId,
          productType: setProduct.type,
          name: setProduct.name,
          size,
          priceCent: sku.priceCent,
          districtId: setProduct.districtId,
          typeLabel: setProduct.typeLabel,
        },
        data
      ).then(({ added }) => {
        if (!added) {
          return;
        }
        wx.showModal({
          title: '一键成套',
          content: `已将「${setProduct.name}」尺码 ${size} 加入购物车，可在购物车修改尺码与数量。`,
          confirmText: '去购物车',
          cancelText: '继续逛',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({ url: '/pages/cart/cart' });
            }
          },
        });
      });
    });
  },

  goCart() {
    wx.navigateTo({ url: '/pages/cart/cart' });
  },
});
