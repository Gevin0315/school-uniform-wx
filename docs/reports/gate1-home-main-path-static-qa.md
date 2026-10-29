# Gate 1 主路径静态核对（对照 main · 含 #9）

**核对时间**：2026-10-29  
**基准提交**：`05cec9b` — `feat(home): 首页直达全量浏览，区县改为筛选 (#9)`  
**方式**：代码与路由静态走读（未跑微信开发者工具真机冒烟）

## 产品定稿四点对照

| # | 产品要求 | 结论 | 证据路径 |
|---|----------|------|----------|
| 1 | 进小程序直达首页，不强制选区拦路（选区页可保留可选） | ✅ | `miniprogram/app.json` — `pages` 首项为 `pages/home/home`，tabBar 首页即 `home`；`miniprogram/pages/home/home.js` — `onShow` 仅 `loadCatalog()`，**无** `redirectTo`/`reLaunch` 至选区；`district-select` 仍注册，经 `changeDistrict()` / `mine` / 结算引导 `navigateTo` 进入（可选） |
| 2 | 首页默认样板可售全部（惠城+惠东混排），卡片标区县 | ✅ | `home.js` `loadCatalog` — `products` 过滤为 `enabledIds.has(p.districtId)`（惠城+惠东），**非**单区；`filterDistrict` 默认 `''` 时 `applyFilters` 不过滤区县；`home.wxml` 卡片行 `{{item.districtLabel}} · {{item.typeLabel}} · {{item.seasonLabel}}` |
| 3 | 区县为筛选条可选项（与季节、套装/单品并列），默认「全部区县」 | ✅ | `home.wxml` — 筛选区首行 `filter-label`「区县」，首 chip「全部区县」且 `filterDistrict === ''` 为 active；`home.js` `data.filterDistrict: ''`；`onDistrictTap` 与季节/类型同模式切换 |
| 4 | 购物车不可跨区混款：加购他区→提示并清车 | ✅ | `miniprogram/utils/catalog.js` — `addToCartWithDistrictPolicy`：车非空且 `cartDistrictId(cart) !== entry.districtId` 时 `showModal`「清空并加入」→ `clearCart()` + `syncSelectedDistrict` + `addToCart`；`home.js` / `product-detail.js` 加购均走该函数 |

## 一闸主路径（首页全量 → 可选筛 → 详情 → 车 → 待支付）

| 步骤 | 结论 | 证据路径 |
|------|------|----------|
| 冷启动进 tabBar 首页 | ✅ | `app.json` 首屏 + tabBar；`app.js` `onLaunch` 仅恢复 storage 选区，**不**拦截进首页 |
| 自愿声明、可选快捷选区 | ✅ | `home.wxml` — `compliance-banner`；`district-capsule`「快捷选区」「可选，下单前需确定」 |
| 混排全量列表 + 区县筛选 | ✅ | 见上表 2、3 |
| 列表 → 商品详情 | ✅ | `home.js` `openProduct` → `product-detail?id=` |
| 详情加购（含跨区策略） | ✅ | `product-detail.js` `addCart` / `addSetBundle` → `addToCartWithDistrictPolicy` |
| 购物车 → 结算 | ✅ | `cart.js` `checkout()` → `/pages/checkout/checkout`；无区时 `ensureDistrictFromCart` 或引导选区 |
| 提交订单 → 待支付 | ✅ | `checkout.js` `submitOrder` → `submitOrderLocal`/`submitOrderCloud`；`miniprogram/utils/orders.js` — `status: 'pending_pay'`；成功 `redirectTo` `order-detail` |
| 选区页（开放区 / 灰显） | ✅（可选路径） | `district-select.wxml` + `seed.js` `DISTRICTS` 仅惠城/惠东 `enabled: true`；选区后 `navigateBack` 或 `switchTab` 回首页 |
| 快捷选区切换清车 | ✅ | `district-select.js` — `prevDistrict !== id` 时 `clearCart()`（与加购跨区清车策略并存） |

## 其余一闸条款（静态抽样 · 与 #9 无冲突）

| 条款 | 结论 | 证据 |
|------|------|------|
| 成套分 SKU 扣减 / 缺码拦截 | ✅ | `miniprogram/utils/localStock.js` `expandOrderItemsToDeductions`；`stock.js` `effectiveLineStock` |
| 商品页退换 + 自愿声明 | ✅ | `product-detail.wxml` — `returnPolicy`、`complianceNote` |
| 自提核销码展示口径 | ✅ | `order-detail.wxml` — 自提块 + 待支付占位文案；`orderView.js` |
| 支付占位、禁止假已付 | ✅ | `order-detail.wxml` 横幅 + 禁用「去支付（未接入）」；`payment.paid: false` |
| 7 天无理由入口 | ✅ | `aftersales-apply` 路由注册；`RETURN_POLICY_COPY` 等于详情/售后文案 |

## 备注 / 非阻塞差异

| 项 | 说明 |
|----|------|
| 结算前须有所属区县 | 未全局选区且无购物车时无法结算；加购首件会通过 `syncSelectedDistrict` 写入区属，或结算/购物车引导至选区页 — **符合**「浏览不拦路、下单需区属」 |
| `pages/catalog/catalog` 仍注册 | 带 query 的遗留/深链页；**一闸主路径以首页为准**（`home` 不再依赖 catalog 季节入口） |
| 根目录 `README.md` 仍可能写旧「选区 → 目录」 | **文档债**；本 PR 以 `docs/05` 与本报告为准，未改根 README（范围外） |

## 静态冒烟结论

**产品定稿四点 + 主路径（首页全量 → 可选筛 → 详情 → 车 → 待支付）在 main（含 #9）上静态核对均为 ✅。**  
建议在测试环境补录屏：混排首页 → 区县筛选 → 跨区加购弹窗清车 → 待支付订单详情。
