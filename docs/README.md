# 文档索引

惠州校服选购微信小程序（`school-uniform-wx`）项目文档目录。

## 阅读顺序建议

1. [01-project-brief.md](01-project-brief.md) — 项目简报（样板区、买方、履约、合规假设）
2. [02-mvp-scope.md](02-mvp-scope.md) — MVP 范围（本阶段做 / 不做）
3. [03-architecture.md](03-architecture.md) — 架构纪要（方案、集合与云函数、风险）
4. [04-decisions.md](04-decisions.md) — 决策记录（ADR 风格）
5. [05-acceptance-gate1.md](05-acceptance-gate1.md) — **一闸验收**（主路径：首页全量混排与区县/季节筛选 → 详情 → 待支付；含跨区清车、简表 + 可勾选细则 + 测试矩阵）
6. [06-acceptance-gate2.md](06-acceptance-gate2.md) — **二闸占位**（真支付 / 退款 / 发货管理等，待商户号就绪）

## 目录说明

| 路径 | 说明 |
|------|------|
| `01-project-brief.md` | 背景与阶段目标 |
| `02-mvp-scope.md` | 功能边界、区县与款式策略 |
| `03-architecture.md` | 小程序 + 云开发模块划分、数据与安全 |
| `04-decisions.md` | 已决 / 待决技术产品决策 |
| `05-acceptance-gate1.md` | Gate 1：首页全量混排、区县筛选、跨区清车、库存（含成套分 SKU）、履约、售后、支付占位 |
| `reports/gate1-home-main-path-static-qa.md` | 对照 main（含 #9）的主路径与产品四点静态核对报告 |
| `06-acceptance-gate2.md` | Gate 2 占位：微信支付闭环、退款、发货 SLA 等 |

## 关联

- 仓库根目录 [README.md](../README.md)：项目一句话说明、技术基线与文档表
