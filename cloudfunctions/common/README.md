# 共享模块（勿单独部署为云函数）

`seed.js` / `stock.js` 为各云函数共用源码。**不要**在云控制台把 `common` 当作独立云函数创建或上传。

各函数通过 `node cloudfunctions/scripts/sync-common.js` 将此处文件复制到函数目录内的 `common/`，部署包内使用 `require('./common/...')`。若控制台误建了 `common` 函数，请删除。
