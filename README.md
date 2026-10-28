# 惠州校服选购

> 仓库：`school-uniform-wx`  
> 惠州「一区一款」校服自愿选购微信小程序 MVP（惠城 + 惠东）

## 一句话

面向家长的区县隔离校服选购小程序：选区 → 目录 → SKU → 下单；快递或虚拟自提；支付与发货能力预留、可插拔。

## 技术基线

**方案 A**：原生微信小程序 + 微信云开发

- 支付：占位接口，商户号到位后再接；测试环境可用 mock，且须标明非真收款
- 发货管理：预留扩展点，当前不实现真物流对接
- 库存：自有仓，简单后台加减

## 文档

| 文档 | 说明 |
|------|------|
| [项目简报](docs/01-project-brief.md) | 样板区、买方、履约、库存、售后、合规与开放假设 |
| [MVP 范围](docs/02-mvp-scope.md) | 本阶段做 / 不做 |
| [架构纪要](docs/03-architecture.md) | 方案对比、集合与云函数、数据草图、风险 |
| [决策记录](docs/04-decisions.md) | ADR 风格已决 / 待决 |
| [一闸验收](docs/05-acceptance-gate1.md) | Gate 1 验收条目（简版） |

## 状态

仓库已含 Gate 1 **代码脚手架**（`miniprogram/`、`cloudfunctions/`）。开发前请先阅读 `docs/` 并对齐待决项（预算、上线日、商户主体等）。

## 代码目录

| 路径 | 说明 |
|------|------|
| `miniprogram/` | 小程序页面与工具 |
| `cloudfunctions/` | 云函数：`listCatalog`、`createOrder`、`mockPay`、`adminAdjustStock`；`wechatPay` / `shippingManage` 为空桩 |
| `project.config.json` | 微信开发者工具工程配置 |

## 本地打开（微信开发者工具）

1. 克隆本仓库，用微信开发者工具 **导入项目**，目录选仓库根目录。
2. **AppID**：正式开发需替换 `project.config.json` 中的 `appid`；无 AppID 时可先用测试号/体验模式（部分云能力受限，以官方文档为准）。
3. **云开发环境**：在 `miniprogram/app.js` 将 `CLOUD_ENV_PLACEHOLDER` 改为你的云环境 ID；在工具栏开通云开发并 **上传并部署** `cloudfunctions/` 下各函数（含 `common/seed.js` 依赖路径）。
4. 编译运行：首页选择 **惠城区 / 惠东县**，浏览目录 → 购物车 → 结算。**支付仅 mockPay**，界面与日志均标明 **非真收款**；测试联调可勾选「模拟已付」，状态为 `paid_mock_test_only`。
5. Gate 1 管理页：首页 → 库存管理，默认 token 为 `gate1-dev-token`（上线前必须更换鉴权方式）。

## 种子数据形状

`cloudfunctions/common/seed.js`：`districtId × season × type(套/单) × size(110–180)` 库存占位；样板区县各 1 个虚拟自提点。

## 运行前仍需人工配置

- 小程序 **AppID** 与主体信息  
- **云开发环境 ID** 与安全规则（`orders`、`skus` 等集合）  
- 真实 **微信支付**、**发货管理**（当前为空桩）  

演示路径 **不得** 作为生产真收款依据；校服 **自愿选购**。
