#!/usr/bin/env node
/**
 * 将 cloudfunctions/common 复制到各云函数目录内的 common/。
 * 微信开发者工具「上传并部署」仅打包单个函数目录，../common 不会进入 zip。
 * 修改 common/ 后请运行：node cloudfunctions/scripts/sync-common.js
 */
const fs = require('fs');
const path = require('path');

const CLOUDFUNCTIONS_ROOT = path.join(__dirname, '..');
const COMMON_SRC = path.join(CLOUDFUNCTIONS_ROOT, 'common');

/** 函数名 → 需要复制的 common 内文件名（stock.js 依赖 seed.js） */
const FUNCTION_COMMON_FILES = {
  seedCloud: ['seed.js'],
  listCatalog: ['seed.js'],
  adminAdjustStock: ['seed.js'],
  createOrder: ['seed.js', 'stock.js'],
};

function syncCommon() {
  for (const [fnName, files] of Object.entries(FUNCTION_COMMON_FILES)) {
    const destDir = path.join(CLOUDFUNCTIONS_ROOT, fnName, 'common');
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of files) {
      const src = path.join(COMMON_SRC, file);
      if (!fs.existsSync(src)) {
        throw new Error(`Missing source: ${src}`);
      }
      fs.copyFileSync(src, path.join(destDir, file));
    }
  }
  console.log(
    `[sync-common] OK: ${Object.keys(FUNCTION_COMMON_FILES).join(', ')}`
  );
}

syncCommon();
