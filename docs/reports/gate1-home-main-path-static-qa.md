# Gate 1 主路径静态核对（对照 main · 含 #7）

**核对时间**：2026-10-29  
**基准提交**：`74445b0` — `feat(home): 首页区县全量商品目录与筛选栏 (#7)`  
**方式**：代码与路由静态走读（未跑微信开发者工具真机冒烟）

## 产品三点对照

| 产品要求 | 结论 | 证据 |
|----------|------|------|
| ① 首页 = 当前区县可售全量（非跨区） | ✅ | `miniprogram/pages/home/home.js` — `loadProducts` 中 `(data.products \|\| []).filter((p) => p.districtId === districtId && p.type !== 'component')`；`displayProducts` 默认等于该区全量（筛选为空时 `applyFilters` 不过滤） |
| ② 顶栏筛选含季节、成套/单品，默认「全部」 | ✅ | `miniprogram/pages/home/home.wxml` — 季节/类型行首项为「全部」且 `filterSeason`/`filterType` 初始为 `''`（`home.js` `data`）；`onSeasonTap` / `onTypeTap` 支持再点取消回「全部」 |
| ③ 仍先选区再进首页 | ✅ | `home.js` `onShow`：无 `districtId` 时 `wx.redirectTo('/pages/district-select/district-select')`；`district-select.js` 选区后 `wx.switchTab('/pages/home/home')`；`app.json` 首屏为 `pages/home/home`，未选区会被重定向 |

## 一闸主路径（选区 → 首页全量 → 可选筛 → 详情 → 车 → 待支付）

| 步骤 | 结论 | 证据路径 |
|------|------|----------|
| 选区（开放区可选、其余灰显） | ✅ | `miniprogram/pages/district-select/district-select.wxml` — `disabled` + 「即将开放」；`district-select.js` — `!enabled` 时 toast；`miniprogram/utils/seed.js` — `DISTRICTS` 仅惠城/惠东 `enabled: true` |
| 自愿声明、区县胶囊 | ✅ | 首页 `home.wxml` — `compliance-banner`「自愿选购」+ `district-capsule`；选区页 `district-select.wxml` 顶栏与 `complianceFooter` |
| 切区清车 | ✅ | `district-select.js` — `prevDistrict !== id` 时 `clearCart()` |
| 首页展示该区可售商品列表 | ✅ | 见上 ①；列表点击 `openProduct` → `product-detail` |
| 可选筛选（季节 / 成套·单件） | ✅ | `home.js` `applyFilters` + `home.wxml` 筛选区；默认展示全量 |
| 商品详情 → 加购 | ✅ | `miniprogram/pages/product-detail/product-detail.js` — `addToCart`；尺码 110–180 于 `product-detail.wxml` |
| 购物车 → 结算 | ✅ | `cart.js` `checkout()` → `/pages/checkout/checkout` |
| 提交订单 → 待支付 | ✅ | `checkout.js` `submitOrder` → `submitOrderLocal`/`submitOrderCloud`；`miniprogram/utils/orders.js` — `status: 'pending_pay'`，`payment.note` 含待支付占位文案；成功 `redirectTo` `order-detail` |
| 自提核销码展示口径 | ✅ | `order-detail.wxml` — 自提块展示 `pickupCode` 与「样板占位码，正式环境支付成功后生效」；`orderView.js` 待支付自提文案 |

## 其余一闸条款（与 #7 无冲突部分 · 静态抽样）

| 条款 | 结论 | 证据 |
|------|------|------|
| 区属 SKU / 成套分 SKU 扣减逻辑存在 | ✅ | `miniprogram/utils/localStock.js` `expandOrderItemsToDeductions`；`stock.js` `effectiveLineStock` 成套取组件最小库存 |
| 商品页退换 + 自愿声明 | ✅ | `product-detail.wxml` — `complianceNote`、`returnPolicy` |
| 支付占位、禁止假已付 | ✅ | `order-detail.wxml` 横幅 + 禁用「去支付（未接入）」；订单 `payment.paid: false` |

## 备注 / 非阻塞差异

| 项 | 说明 |
|----|------|
| 首页额外「库存 · 仅有货」筛选 | `#7` 在顶栏增加第三维筛选（默认仍为「全部」），未改变产品要求的季节/类型两维；验收文档已按新首页描述，该维可作为增强项手动抽测 |
| `pages/catalog/catalog` 仍注册 | `app.json` 保留目录页，**首页已不再** `navigateTo` catalog（旧「季节入口再进目录」主路径已退役）；catalog 仅作带 query 的深链/遗留页，**一闸主路径以首页为准** |
| 详情页跨区商品 ID | `product-detail.js` 若 `product.districtId !== app.globalData.districtId` 仅 toast，未强制返回；需真机边界用例，静态不判 ❌ |
| 根目录 `README.md` 仍写「选区 → 目录 → SKU」 | 与代码主路径不一致，**文档债**；本 PR 以 `docs/05` 为准，根 README 未改（范围外） |

## 静态冒烟结论

**主路径（选区 → 首页全量 → 可选筛 → 详情 → 车 → 待支付）在 main（含 #7）上静态核对为 ✅ 可落地。**  
建议在测试环境补一轮开发者工具录屏：惠城/惠东各 1 条，含季节+类型筛选与待支付订单详情截图。
