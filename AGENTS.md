# AGENTS.md — AI 编码助手项目指南

> 本文档面向 AI 编码助手，用于快速理解 `zombie_defender` 项目的结构、技术栈、构建方式与开发约定。项目主要文档和代码注释使用中文，因此本指南以中文撰写。

---

## 项目概述

本项目是一个使用 **React + TypeScript + Vite** 开发的**俯视角 2D 射击建造防守游戏**，并通过 **Tauri v2** 打包为跨平台桌面应用。

- 游戏名：产品配置中为 `俯视角2D射击建造防守游戏`（Tauri 配置 `productName`）
- 前端包名：`my-app`（`package.json`）
- Rust 包名：`shooter-defense-game`（`src-tauri/Cargo.toml`）
- 核心玩法：玩家使用 WASD/方向键移动，鼠标瞄准射击；按数字键 `1`/`2` 选择墙体或机枪塔，点击空地建造；抵御从地图四周边缘不断刷新的敌人波次。

设计细节（数值、颜色、机制）见 `design/design.md`；桌面打包指南见 `PACKAGE_GUIDE.md`。

---

## 技术栈

### 前端

| 技术 | 版本/说明 |
|------|-----------|
| Node.js | 20+（`info.md` 声明） |
| React | ^19.2.0 |
| TypeScript | ~5.9.3 |
| Vite | ^7.2.4 |
| Tailwind CSS | ^3.4.19 |
| shadcn/ui | `new-york` 风格，使用 Radix UI + Tailwind CSS |
| 路由 | `react-router` ^7.6.1（目前仅包裹 `<App />`，`src/pages/Home.tsx` 是模板遗留页面，未被使用） |
| 状态管理 | 无全局状态库，使用 React `useState`/`useRef` + 自定义 `GameEngine` 类 |

### 桌面端

| 技术 | 版本/说明 |
|------|-----------|
| Tauri | 2.0 |
| Rust | edition 2021 |
| 构建脚本 | `src-tauri/build.rs`（仅调用 `tauri_build::build()`） |
| 入口 | `src-tauri/src/main.rs`（默认 Builder，无自定义命令） |

### 图标

- `src-tauri/icons/` 已包含 `32x32.png`、`128x128.png`、`128x128@2x.png`、`icon.png`。
- `src-tauri/generate-icons.js` 是一个 Node 脚本，用于基于像素 SVG 模板生成不同尺寸图标（输出 `.svg`，需自行转换为 `.png` 后供 Tauri 使用）。

---

## 项目结构

```
.
├── design/
│   └── design.md              # 游戏设计文档（机制、数值、颜色、层级）
├── src/
│   ├── App.tsx                # 根组件：管理 start/playing/gameover 三屏
│   ├── App.css                # 全局游戏容器与 body 样式
│   ├── main.tsx               # React 应用入口（StrictMode + BrowserRouter）
│   ├── index.css              # Tailwind 指令 + shadcn CSS 变量主题
│   ├── config/                # 游戏数值与配色 JSON 配置文件
│   │   ├── game.json          # 玩家、子弹、敌人、地图等通用数值
│   │   ├── buildings.json     # 墙体、机枪塔属性与造价（按 wall/turret 分层）
│   │   ├── colors.json        # 实体、UI、血条、预览等配色
│   │   ├── waves.json         # 波次规则与缩放
│   │   └── zombie.json        # 普通僵尸、瘦猴僵尸属性与掉落（按 normal/thin_monkey 分层）
│   ├── components/ui/         # UI 组件（含 shadcn 组件与游戏专用 UI）
│   │   ├── GameUI.tsx         # 游戏中 HUD（HP、建材、波次、击杀、建造菜单）
│   │   ├── StartScreen.tsx    # 开始界面
│   │   ├── GameOverScreen.tsx # 游戏结束界面
│   │   ├── BuildMenu.tsx      # 底部建造类型切换
│   │   ├── HPBar.tsx          # 血条组件
│   │   └── ...                # shadcn/ui 组件（button、card、dialog 等）
│   ├── game/                  # 游戏核心逻辑
│   │   ├── GameCanvas.tsx     # 画布组件，挂载 GameEngine
│   │   ├── engine/            # 引擎层
│   │   │   ├── GameEngine.ts  # 主游戏循环、状态更新、渲染
│   │   │   ├── Config.ts      # 游戏常量与 BuildType 类型
│   │   │   ├── InputManager.ts# 键盘/鼠标输入处理
│   │   │   ├── Collision.ts   # 碰撞/距离工具函数
│   │   │   └── Raycast.ts     # 线段与矩形相交、视线检测
│   │   ├── entities/          # 实体类
│   │   │   ├── Entity.ts      # 抽象基类
│   │   │   ├── Player.ts      # 玩家
│   │   │   ├── Enemy.ts       # 敌人（普通僵尸 / 瘦猴僵尸）
│   │   │   ├── Bullet.ts      # 子弹
│   │   │   ├── Building.ts    # 建筑基类
│   │   │   ├── Wall.ts        # 墙体
│   │   │   ├── Turret.ts      # 机枪塔
│   │   │   └── FloatingText.ts# 浮动提示文字（如 +N 建材）
│   │   └── systems/           # 游戏系统
│   │       ├── BuildingSystem.ts # 建造、查询、清理
│   │       ├── SpawnSystem.ts    # 敌人生成与波次
│   │       ├── WaveSystem.ts     # 波次计时（当前主要由 SpawnSystem 驱动）
│   │       └── UIRenderer.ts     # 画布上的建造预览
│   ├── hooks/
│   │   └── use-mobile.ts      # 检测是否为移动端的 hook（模板遗留）
│   ├── lib/
│   │   └── utils.ts           # `cn()` 工具函数（clsx + tailwind-merge）
│   └── pages/
│       └── Home.tsx           # Vite 模板默认页（当前未被使用）
├── src-tauri/                 # Tauri 桌面端
│   ├── Cargo.toml
│   ├── build.rs
│   ├── tauri.conf.json
│   ├── generate-icons.js
│   ├── icons/
│   └── src/main.rs
├── package.json
├── vite.config.ts             # Vite 配置（base: './'，@ 路径别名）
├── tailwind.config.js         # Tailwind 主题扩展（shadcn 变量、动画）
├── postcss.config.js          # tailwindcss + autoprefixer
├── tsconfig.json              # 项目引用 tsconfig.app.json / tsconfig.node.json
├── tsconfig.app.json          # 应用 TS 严格配置
├── tsconfig.node.json         # 构建工具 TS 配置
├── eslint.config.js           # ESLint 配置
└── components.json            # shadcn/ui 配置
```

---

## 构建与运行命令

> 需要先安装依赖：`npm install`。

### Web 前端开发

```bash
# 启动 Vite 开发服务器（端口 3000）
npm run dev

# 类型检查 + 生产构建，输出到 dist/
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

### 桌面端（Tauri）

> 需要安装 Rust 工具链（https://rustup.rs）以及平台相关依赖（见 `PACKAGE_GUIDE.md`）。Tauri CLI 未在 `package.json` 中声明，建议全局安装或使用 `npx`。

```bash
# 安装 Tauri CLI（全局）
npm install -g @tauri-apps/cli

# 开发模式（会同时启动 Vite）
npx tauri dev

# 生产打包（为当前平台生成 .exe/.msi/.app/.dmg/.deb 等）
npx tauri build
```

打包产物位置：

- Windows：`src-tauri/target/release/俯视角2D射击建造防守游戏.exe` + `.msi`
- macOS：`src-tauri/target/release/bundle/macos/俯视角2D射击建造防守游戏.app` + `.dmg`
- Linux：`src-tauri/target/release/bundle/deb/*.deb` / `*.AppImage`

Tauri 配置：
- 默认窗口大小：1280×720，最小 800×600
- 入口：`dist/index.html`
- 开发地址：`http://localhost:5173`

---

## 代码组织原则

1. **关注点分离**：
   - `src/game/engine/` 负责游戏循环、输入、数学工具。
   - `src/game/entities/` 负责各类实体的状态、更新与渲染。
   - `src/game/systems/` 负责跨实体的规则系统（生成、建造、UI 预览）。
   - `src/components/ui/` 负责 React 层面的覆盖 UI。
2. **渲染方式**：游戏世界使用原生 Canvas 2D API 逐帧渲染，UI 覆盖层使用 React + Tailwind CSS。
3. **状态同步**：`GameEngine` 通过 `onStateChange` 回调将精简的 `GameState` 传回 `App.tsx`，再驱动 React UI 更新。
4. **配置集中**：游戏数值与配色以 JSON 形式存放在 `src/config/*.json` 中；`src/game/engine/Config.ts` 负责聚合这些 JSON 并导出统一的 `CONFIG` 对象与 `BuildType` 类型，保持原有导入接口不变。

---

## 代码风格与约定

- **语言**：TypeScript，开启 `strict` 模式。
- **路径别名**：使用 `@/` 指向 `./src/*`（在 `vite.config.ts` 与 `tsconfig.json` 中配置）。
- **导入类型**：对类型使用 `import type`（启用 `verbatimModuleSyntax`）。
- **React 组件**：函数式组件 + 默认导出（如 `App.tsx`、`GameUI.tsx`）。
- **类组件/系统**：游戏逻辑使用 ES 类（如 `GameEngine`、`Player`、`BuildingSystem`）。
- **样式**：
  - shadcn/ui 组件使用 Tailwind CSS + CSS 变量。
  - 游戏内颜色大量依赖 `CONFIG` 内联颜色（如 `#1a1a2e`）。
- **注释**：游戏核心代码注释使用中文；保持中文注释风格。
- **格式化**：项目未配置 Prettier，请保持与现有文件一致的缩进与引号风格，并通过 ESLint 检查。

---

## 测试策略

- **当前状态**：项目未安装任何测试框架，也没有测试文件（`src/**/*.{test,spec}.{ts,tsx}` 无匹配）。
- **建议**：
  - 纯数学/碰撞函数（`Collision.ts`、`Raycast.ts`）适合优先补充单元测试。
  - 实体逻辑可结合轻量 stub 测试。
  - UI 组件可引入 `@testing-library/react` 进行基础渲染测试。
- 运行测试需要自行添加测试脚本与依赖。

---

## 安全注意事项

- **Tauri 后端**：`src-tauri/src/main.rs` 当前未暴露任何自定义命令，前端无法直接调用系统 API。后续若添加自定义命令，应遵循最小权限原则，避免直接执行用户输入。
- **CSP**：`tauri.conf.json` 中 `csp` 设置为 `null`。若启用前端加载远程资源，应配置合适的 Content Security Policy。
- **依赖安全**：定期检查 `npm audit` 与 `cargo audit`。
- **本地存储**：游戏数据目前仅存于内存，若后续使用 `localStorage` 或 Tauri fs API，注意避免序列化不可信数据。
- **构建产物**：`dist/` 与 `src-tauri/target/` 已列入 `.gitignore`，不要提交。

---

## 常见问题速查

| 问题 | 说明 |
|------|------|
| 如何切换建造类型 | 按 `1` 选墙体、`2` 选机枪塔、`Esc` 取消；也可点击底部菜单 |
| 建筑造价与建材 | 墙体 `CONFIG.WALL_COST`、机枪塔 `CONFIG.TURRET_COST`；初始 `CONFIG.MATERIALS_INITIAL`，击杀僵尸有概率掉落 |
| 玩家不能射击 | 检查是否处于建造模式（`InputManager.canShoot` 要求 `!buildType`） |
| 机枪塔为什么不攻击 | 需满足：有敌人、在射程内、与目标之间无墙体阻挡视线 |
| 瘦猴僵尸 | 从第 2 波起概率刷新，速度更快、血量更低，掉落建材概率与数量更高 |
| 为什么有 `src/pages/Home.tsx` | Vite 模板遗留文件，当前未使用，可安全删除或替换为真实页面 |
| 图标如何更新 | 替换 `src-tauri/icons/` 内对应 PNG，或参考 `src-tauri/generate-icons.js` |

---

## 相关文件索引

- 设计文档：`design/design.md`
- 打包指南：`PACKAGE_GUIDE.md`
- 前端入口：`index.html` → `src/main.tsx` → `src/App.tsx`
- 游戏入口：`src/game/GameCanvas.tsx` → `src/game/engine/GameEngine.ts`
- 游戏配置：
  - JSON 源文件：`src/config/game.json`、`src/config/buildings.json`、`src/config/colors.json`、`src/config/waves.json`、`src/config/zombie.json`
  - 聚合入口：`src/game/engine/Config.ts`
- Tauri 配置：`src-tauri/tauri.conf.json`
- 构建配置：`vite.config.ts`、`tailwind.config.js`、`eslint.config.js`
