# L4D2 服务器介绍页重建 — 设计文档

日期：2026-10-17（更新：桌面客户端由 Electron 改为 Tauri）

## 背景

现有项目 `l4d2-server-introduce` 是一个 Vue 3 + Vite + PrimeVue + Tailwind 的单页应用，
用于引导用户快速连接 SummonHIM 的 Left 4 Dead 2 服务器，并生成 Web 端与 PC 客户端。

需求：**彻底清空项目（含二进制资源和 Git 历史）后重制**，功能与原来一致，
同时生成 Web 端和 PC 客户端，网站布局重新设计为更「游戏服务器」的 L4D2 僵尸末日风。
桌面客户端由 Electron 改为 **Tauri**（体积小一个数量级）。

## 目标

1. 功能与原来一致（连接服务器、手动教程、客户端下载链接、404、页脚）。
2. 视觉重做为 L4D2 僵尸末日风。
3. Web 端 + Tauri PC 客户端双端输出。
4. 彻底清空：删除源代码、配置、二进制资源（教程截图、logo/favicon）与 `.git`，全新仓库。

## 技术栈

- Vue 3 + Vite + TypeScript
- PrimeVue（自定义暗黑主题 preset）+ Tailwind CSS 4
- vue-router（hash 模式，适配 `file://` 与 Tauri）
- **Tauri 2**（PC 客户端，Rust + 系统 WebView2）
- axios（DNS 解析，纯前端，无需后端命令）
- 移除无用依赖：`pinia`、`pinia-plugin-persistedstate`、`viewerjs`

### Tauri 相关依赖

- npm：`@tauri-apps/cli`（dev）、`@tauri-apps/api`、`@tauri-apps/plugin-opener`
- Rust：`tauri`（2）、`tauri-plugin-opener`、`tauri-plugin-window-state`、`serde`、`serde_json`
- 窗口记忆：`tauri-plugin-window-state`（替代 electron-store）
- 打开外部协议（`steam://`、http 链接）：`tauri-plugin-opener`（替代 `shell.openExternal`）
- 前端区分运行环境：`src/tauri.ts` 暴露 `isTauri()` / `openExternal()`

## 功能清单（与原来一致）

1. **首页** `pages/index.vue`
   - logo（占位 SVG + L4D2 官方图标角标）、服务器提供方、服务器名
   - 「开始游戏」按钮：DNS 解析 → IPv4 → `steam://connect/<ip>:<port>`
     - Tauri 内用 `openUrl` 打开；浏览器内用 `window.location.href`
   - 按钮状态机：查询中 / 成功 / 查询错误 / 网络错误 / 未知错误，错误 Toast 提示，可重试
   - 连接后弹 Dialog 提示「正在连接到服务器…」
   - 手动连接链接（`/manual`）、客户端下载链接（GitHub releases，仅 http/https 协议显示）
2. **手动连接教程页** `pages/manual.vue`
   - 纯文本编号步骤 + CSS 游戏控制台样式命令框（`connect <addr>:<port>` + 复制按钮）
3. **404 页** `pages/[...all].vue`
4. **页脚** `GlobalFooter.vue`：版权 + 提供方 + Source Code 链接 + Valve 免责

## 视觉设计（L4D2 僵尸末日风）

- 配色：近黑底 `#0d0d0d`、血迹红主色 `#c8102e`、脏橙点缀、骨白文字 `#d8d3c5`
- 全屏背景层：噪点纹理 + 扫描线 + 暗角 vignette + 血迹飞溅 SVG
- 标题：粗犷 condensed 字体 `@fontsource/anton`（英文/数字），中文回退系统字体
- PrimeVue 主题 preset：暗色 + 血迹红 primary + 毒绿 success
- 无暗黑模式切换（默认即暗黑，`html.dark`）

## 页面布局（首页）

```
┌─────────────────────────────────────┐
│          (噪点/扫描线/暗角背景)          │
│                                     │
│            [Logo 占位 SVG]           │
│            (右上角叠 L4D2 图标角标)      │
│         由 SummonHIM 提供的           │
│       L E F T  4  D E A D  2        │
│         (血迹做旧大字标题)             │
│                                     │
│        [ ▶ 开始游戏 ]  (血红大按钮)     │
│      手动连接  |  下载客户端           │
│                                     │
│      © 2026 SummonHIM | Source...    │
└─────────────────────────────────────┘
```

## 组件拆分

- `pages/index.vue`、`pages/manual.vue`、`pages/[...all].vue`
- `GlobalFooter.vue`
- `src/tauri.ts`（运行环境分支工具）

## 资源占位

- 主 logo：自绘血迹风 SVG 占位（`src/assets/logo/server-logo.svg`）
- L4D2 图标角标：下载 Steam app 550 图标到 `src/assets/logo/l4d2-badge.png` 本地引用，仅作角标
  （源：`https://shared.fastly.steamstatic.com/community_assets/images/apps/550/1a8d50f6078b5d023582ea1793b0e53813d57b7f.ico`）
- favicon：`src/assets/logo/favicon.png` + `public/favicon.ico`
- Tauri 图标：`src-tauri/icons/`（由 `npx tauri icon` 从 1024×1024 源图生成）

## 配置与脚本

- 环境变量四项（`.env.example` / `.env`）：`VITE_SRCDS_SERVER_PROVIDER` / `NAME` / `ADDRESS` / `PORT`
- npm 脚本：`dev`(vite)、`build`、`preview`、`test:e2e`、`type-check`、`lint`、`format`、`tauri`
- `vite.config.ts`（PrimeVue resolver + Pages + Tailwind + `base: './'`）
- `src-tauri/`（Tauri 2 工程）：`tauri.conf.json`、`Cargo.toml`、`build.rs`、`src/main.rs`、
  `src/lib.rs`、`capabilities/default.json`、`icons/`
- Playwright / ESLint / oxlint / Prettier / TS 配置还原

## 测试

- Playwright E2E：提供方文案、服务器名标题、连接按钮状态机文案、logo 角标可见、
  手动连接/下载链接、页脚版权 + Valve 免责、教程页步骤与命令、404

## 范围外（YAGNI）

- 服务器实时在线状态 / 人数 / 地图（A2S）— 不做
- 暗黑/亮色切换 — 不做
- 多语言 i18n — 不做
- Tauri 自动更新（`tauri-plugin-updater`，需签名密钥 + 更新服务器）— 暂缓
- 自定义右键菜单（用 WebView2 原生菜单）— 不做
