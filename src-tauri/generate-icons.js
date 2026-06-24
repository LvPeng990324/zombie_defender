#!/usr/bin/env node
/**
 * 游戏图标生成脚本
 * 生成 Tauri 所需的各种尺寸图标
 * 运行: node src-tauri/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, 'icons');

// 确保 icons 目录存在
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// 游戏主题的像素风格图标 - 用SVG生成各种尺寸
function generateGameIcon(size) {
  const cellSize = size / 16; // 16x16 像素网格
  
  // 像素艺术风格的防御塔 + 枪
  const pixelMap = [
    "........RRRR....", // 8=红, .=透明, G=绿, B=蓝, Y=黄, W=白, D=深灰
    ".......RRRRRR...",
    "......RRRRRRRR..",
    "......BB....BB..", // 枪管
    "......BB....BB..",
    "......BBBBBBBB..", // 塔身
    ".....BBBBBBBBBB.",
    ".....BBBBBBBBBB.",
    "....BBBBBBBBBBBB",
    "....BBBBGGGGBBBB", // 绿色窗口
    "...BBBBBGGGGBBBB",
    "...BBBBBBBBBBBBB",
    "..BBBBBBBBBBBBBB",
    "..BBBBBBBBBBBBBB",
    ".BBBBBBBBBBBBBBBB",
    ".BBBBBBBBBBBBBBBB",
  ];
  
  // 颜色映射
  const colorMap = {
    'R': '#e74c3c',  // 红色 - 敌人/顶部
    'B': '#3498db',  // 蓝色 - 塔身
    'G': '#2ecc71',  // 绿色 - 窗口/玩家
    'Y': '#f1c40f',  // 黄色 - 子弹
    'W': '#ecf0f1',  // 白色 - 高光
    'D': '#2c3e50',  // 深灰 - 阴影
    '.': 'transparent'
  };
  
  let rects = '';
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const pixel = pixelMap[row]?.[col] || '.';
      const color = colorMap[pixel] || 'transparent';
      if (color !== 'transparent') {
        rects += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`;
      }
    }
  }
  
  // 添加圆角背景
  const bgRadius = size * 0.15;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${bgRadius}" fill="#1a1a2e"/>
    ${rects}
  </svg>`;
}

// 生成 .ico 文件的简化版（需要额外工具，这里生成 PNG）
function generateICNS(size) {
  // macOS .icns 需要特殊工具，生成 PNG 替代说明
  return generateGameIcon(size);
}

// 生成所有需要的图标
const sizes = [32, 128, 256, 512];
console.log('🎮 生成游戏图标...\n');

sizes.forEach(size => {
  const svg = generateGameIcon(size);
  const outputPath = path.join(ICONS_DIR, `${size}x${size}.png`);
  
  // 保存 SVG（用户可用工具转换，或者直接用 SVG）
  fs.writeFileSync(outputPath.replace('.png', '.svg'), svg);
  console.log(`  ✅ ${size}x${size}.svg`);
});

// 生成特殊名称的图标
const specialIcons = [
  { name: 'icon.ico', size: 256 },  // Windows
  { name: 'icon.icns', size: 512 }, // macOS (实际是 PNG 集合)
  { name: '128x128@2x.png', size: 256 }, // Retina
];

specialIcons.forEach(({ name, size }) => {
  const svg = generateGameIcon(size);
  fs.writeFileSync(path.join(ICONS_DIR, `${name}.svg`), svg);
  console.log(`  ✅ ${name} (SVG, ${size}x${size})`);
});

console.log('\n📦 图标生成完成！');
console.log(`📁 输出目录: ${ICONS_DIR}`);
console.log('\n⚠️  注意：Tauri 需要 PNG 格式的图标。');
console.log('   请将 SVG 转换为 PNG 后使用，或使用在线工具生成。');
console.log('   推荐使用: https://convertio.co/svg-png/');
console.log('\n💡 快速方案：运行 `npx tauri icon icon.png` (如果有 PNG 图标源文件)');
