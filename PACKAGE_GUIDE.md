# 桌面二进制打包指南

## 方案：Tauri (推荐)

Tauri 是一个轻量级的跨平台桌面应用框架，将你的 Web 游戏打包成原生二进制文件。

**优势：**
- 包体极小（~5MB，Electron 的 1/20）
- 使用系统原生 WebView，性能更好
- 内存占用低
- 跨平台：Windows (.exe)、macOS (.app)、Linux (.deb/.rpm/.AppImage)
- 安全性高

---

## 打包步骤

### 1. 前置条件

**所有平台都需要：**
- Node.js 20+
- Rust (https://rustup.rs 一键安装)

**Windows 额外需要：**
- Microsoft Visual Studio C++ 生成工具
- WebView2 运行时（Windows 10/11 已内置）

**macOS 额外需要：**
- Xcode Command Line Tools: `xcode-select --install`

**Linux 额外需要：**
```bash
# Debian/Ubuntu
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel librsvg2-devel
# 安装 gcc: sudo dnf install gcc

# Arch Linux
sudo pacman -S --needed base-devel webkit2gtk-4.1 curl wget file libappindicator-gtk3 librsvg
```

### 2. 安装 Tauri CLI

```bash
npm install -g @tauri-apps/cli
```

### 3. 生成图标（首次需要）

项目已包含 `icons/` 目录和默认图标，可直接使用。

如需自定义图标，准备一张 1024x1024 的 PNG 图片，然后：
```bash
npx tauri icon /path/to/your/icon.png
```

### 4. 打包

在项目根目录（`app/`）执行：

```bash
# 开发模式（调试用）
npx tauri dev

# 生产打包（自动为当前平台打包）
npx tauri build
```

打包完成后，二进制文件位于：

| 平台 | 输出路径 |
|------|---------|
| Windows | `src-tauri/target/release/俯视角2D射击建造防守游戏.exe` + `.msi` 安装程序 |
| macOS | `src-tauri/target/release/bundle/macos/俯视角2D射击建造防守游戏.app` + `.dmg` |
| Linux | `src-tauri/target/release/bundle/deb/*.deb` 或 `*.AppImage` |

### 5. 交叉编译

Tauri 暂不支持一键交叉编译。如需多平台发布，建议：

- **GitHub Actions**（推荐）：使用 CI 自动打包多平台
- 配置 `.github/workflows/release.yml` 实现自动打包

---

## 方案B：Electron (备选)

如果你更熟悉 Electron 或需要更完善的生态系统，也可以使用 Electron 打包。

**但 Electron 包体会大很多（~150MB+），不做默认推荐。**

### Electron 快速打包：

```bash
npm install --save-dev electron electron-builder
# 添加 electron/main.js 和 package.json scripts
npx electron-builder
```

---

## 打包配置说明

`src-tauri/tauri.conf.json` 已配置好：

- **窗口大小**：默认 1280x720，最小 800x600
- **全屏**：默认窗口模式，可调整
- **入口文件**：自动读取 `dist/index.html`（Vite 构建输出）
- **目标格式**：
  - Windows: `.msi` 安装程序 + `.exe` 便携版
  - macOS: `.dmg` 安装包 + `.app` 应用
  - Linux: `.deb` + `.rpm` + `.AppImage`

---

## 文件说明

```
src-tauri/
  Cargo.toml       # Rust 项目配置
  build.rs         # Tauri 构建脚本
  tauri.conf.json  # Tauri 主配置
  src/main.rs      # Rust 入口（已配置好，一般不需要修改）
  icons/           # 应用图标（各种尺寸）
```

---

## 常见问题

**Q: 打包后的应用多大？**
A: Tauri 约 3-8MB（因平台而异），远小于 Electron 的 150MB+。

**Q: 游戏数据保存在哪里？**
A: Tauri 支持本地存储 API，可通过 `localStorage` 或 Tauri 的 fs API 保存。

**Q: 如何更新应用？**
A: Tauri 内置自动更新功能，可配置服务器端点实现自动更新。

**Q: 需要安装运行时吗？**
A: Windows 10/11 已内置 WebView2；macOS 和 Linux 使用系统 WebKit。
