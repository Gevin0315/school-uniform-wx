const { fetchCatalog, enrichProductCards } = require('../../utils/catalog');

function shortProductTitle(name) {
  return (name || '')
    .replace(/（样板）/g, '')
    .replace(/^惠城区|惠东县/g, '')
    .trim();
}

function productSubtitle(item) {
  if (item.type === 'set') {
    if (item.seasonId === 'summer') {
      return '短袖上衣 + 长裤';
    }
    if (item.seasonId === 'spring_autumn') {
      return '外套 · 多尺码';
    }
    if (item.seasonId === 'winter') {
      return '冬装套装 · 多尺码';
    }
  }
  return `${item.typeLabel} · ${item.seasonLabel}`;
}

Page({
  data: {
    statusBarHeight: 44,
    districtName: '',
    districts: [],
    products: [],
    displayProducts: [],
    seasons: [],
    filterDistrict: '',
    filterSeason: '',
    filterType: '',
    filterStock: '',
    catalog: null,
    districtFilterLabel: '全部区县',
    hotSectionTitle: '热门校服',
    filterPanelVisible: false,
    districtLabelMap: {},
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sys.statusBarHeight || 44,
    });
  },

  onShow() {
    const app = getApp();
    this.setData({
      districtName: app.globalData.districtName,
    });
    this.loadCatalog();
  },

  loadCatalog() {
    fetchCatalog().then((data) => {
      const enabledIds = new Set(
        (data.districts || [])
          .filter((d) => d.enabled)
          .map((d) => d.districtId)
      );
      const districtLabels = Object.fromEntries(
        (data.districts || []).map((d) => [d.districtId, d.name])
      );
      const products = (data.products || []).filter(
        (p) => enabledIds.has(p.districtId) && p.type !== 'component'
      );
      const seasonLabels = Object.fromEntries(
        (data.seasons || []).map((s) => [s.seasonId, s.label])
      );
      const enriched = enrichProductCards(products, data).map((p) => {
        const seasonLabel = seasonLabels[p.seasonId] || '';
        const card = {
          ...p,
          seasonLabel,
          districtLabel: districtLabels[p.districtId] || '',
          displayTitle: shortProductTitle(p.name),
        };
        return {
          ...card,
          subtitle: productSubtitle(card),
        };
      });
      this.setData({
        products: enriched,
        seasons: data.seasons || [],
        districts: (data.districts || []).filter((d) => d.enabled),
        catalog: data,
        districtLabelMap: districtLabels,
      });
      this.applyFilters();
    });
  },

  applyFilters() {
    const {
      products,
      filterDistrict,
      filterSeason,
      filterType,
      filterStock,
      districtLabelMap,
    } = this.data;
    let list = products;
    if (filterDistrict) {
      list = list.filter((p) => p.districtId === filterDistrict);
    }
    if (filterSeason) {
      list = list.filter((p) => p.seasonId === filterSeason);
    }
    if (filterType === 'set') {
      list = list.filter((p) => p.type === 'set');
    } else if (filterType === 'single') {
      list = list.filter((p) => p.type === 'single');
    }
    if (filterStock === 'in_stock') {
      list = list.filter((p) => p.stockLevel !== 'out');
    }
    const districtFilterLabel = filterDistrict
      ? districtLabelMap[filterDistrict] || '全部区县'
      : '全部区县';
    const hotSectionTitle = filterDistrict
      ? `${districtFilterLabel} · 热门校服`
      : '热门校服';
    this.setData({
      displayProducts: list,
      districtFilterLabel,
      hotSectionTitle,
    });
  },

  onDistrictTap(e) {
    const district = e.currentTarget.dataset.district;
    const next = this.data.filterDistrict === district ? '' : district;
    this.setData({ filterDistrict: next }, () => this.applyFilters());
  },

  onSeasonTap(e) {
    const season = e.currentTarget.dataset.season;
    const next = this.data.filterSeason === season ? '' : season;
    this.setData({ filterSeason: next }, () => this.applyFilters());
  },

  onTypeTap(e) {
    const type = e.currentTarget.dataset.type;
    const next = this.data.filterType === type ? '' : type;
    this.setData({ filterType: next }, () => this.applyFilters());
  },

  onStockTap(e) {
    const stock = e.currentTarget.dataset.stock;
    const next = this.data.filterStock === stock ? '' : stock;
    this.setData({ filterStock: next }, () => this.applyFilters());
  },

  onDistrictBarTap() {
    const { districts } = this.data;
    const itemList = ['全部区县', ...districts.map((d) => d.name)];
    wx.showActionSheet({
      itemList,
      success: (res) => {
        const tap = res.tapIndex;
        const next =
          tap === 0 ? '' : (districts[tap - 1] && districts[tap - 1].districtId) || '';
        this.setData({ filterDistrict: next }, () => this.applyFilters());
      },
    });
  },

  onSearchTap() {
    wx.showToast({ title: '搜索即将上线', icon: 'none' });
  },

  goRules() {
    wx.navigateTo({ url: '/pages/rules/rules' });
  },

  toggleFilterPanel() {
    this.setData({ filterPanelVisible: !this.data.filterPanelVisible });
  },

  onComboTap() {
    const { filterSeason } = this.data;
    const seasonQuery = filterSeason ? `&season=${filterSeason}` : '';
    wx.navigateTo({
      url: `/pages/catalog/catalog?setsOnly=1${seasonQuery}`,
    });
  },

  openProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },

});
