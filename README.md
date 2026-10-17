# L4D2 Server Introduce

一个用于快速连接 SummonHIM 的 Left 4 Dead 2 服务器的介绍页，采用 L4D2 僵尸末日风视觉，同时输出 Web 端与 Tauri 桌面客户端。

## 技术栈

- Vue 3 + Vite SPA（vue-router hash 模式）
- PrimeVue（自定义暗黑 + 血迹红主题 preset）+ Tailwind CSS 4
- Tauri 2（Rust + 系统 WebView2）打包桌面客户端

## 核心逻辑

域名经阿里云 DNS 解析为 IPv4 → `steam://connect/ip:port`，前端通过 `src/tauri.ts` 区分 Tauri / 浏览器环境打开协议。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `VITE_SRCDS_SERVER_PROVIDER` | 服务器提供者 |
| `VITE_SRCDS_SERVER_NAME` | 服务器名称 |
| `VITE_SRCDS_SERVER_ADDRESS` | 服务器地址（域名或 IP） |
| `VITE_SRCDS_SERVER_PORT` | 服务器端口 |

复制 `.env.example` 为 `.env` 并填写本地构建值。

## 开发

```bash
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
pnpm preview
```

## 测试

```bash
pnpm test:e2e
```

## 打包 Tauri 桌面客户端（需 Rust ≥1.90）

```bash
pnpm tauri build
```

产物位于 `src-tauri/target/release/`。

## 许可证

MPL-2.0
