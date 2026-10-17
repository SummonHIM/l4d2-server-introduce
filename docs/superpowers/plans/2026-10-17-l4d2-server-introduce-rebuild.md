# L4D2 服务器介绍页重建 Implementation Plan（Tauri 版）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 彻底清空并重建 L4D2 服务器介绍页，功能与原来一致，视觉改为 L4D2 僵尸末日风，同时输出 Web 端与 Tauri PC 客户端。

**Architecture:** Vue 3 + Vite SPA（vue-router hash 模式），PrimeVue（自定义暗黑 + 血迹红主题 preset）+ Tailwind CSS 4 负责视觉，Tauri 2（Rust + 系统 WebView2）复用同一份前端产物打包成桌面客户端。核心连接逻辑：域名经阿里云 DNS 解析为 IPv4 → `steam://connect/ip:port`，前端通过 `src/tauri.ts` 区分 Tauri / 浏览器环境打开协议。

**Tech Stack:** Vue 3.5, Vite 7, TypeScript 5.9, PrimeVue 4.5, Tailwind CSS 4, vue-router 5, Tauri 2（Rust ≥1.90）, Playwright, pnpm 10.

## Global Constraints

- Node: `^20.19.0 || >=22.12.0`；包管理器 `pnpm@10.28.1`；Tauri 要求 **Rust ≥1.90**
- 环境变量四项（verbatim）：`VITE_SRCDS_SERVER_PROVIDER` / `VITE_SRCDS_SERVER_NAME` / `VITE_SRCDS_SERVER_ADDRESS` / `VITE_SRCDS_SERVER_PORT`
- 本地 `.env` 值（gitignored，仅供本地构建）：provider=`SummonHIM`, name=`Left 4 Dead 2`, addr=`l4d2.serenity.summonhim.top`, port=`14514`
- 仓库：`https://github.com/SummonHIM/l4d2-server-introduce`；作者 SummonHIM `summonhim@qq.com`；许可证 MPL-2.0
- 复制规则：全中文 UI 文案，代码注释中文
- `base: './'`（适配 Tauri `file`/`tauri://` 加载）
- 无亮暗切换：强制暗黑（html 挂 `.dark` 类）
- 无 i18n、无服务器实时状态、无 pinia/viewerjs、无自动更新、无自定义右键菜单

---

### Task 1: 清空项目并搭建脚手架

**Files:**
- Delete: 除 `docs/`、`.superpowers/` 外全部（含 `.git`）
- Create: `package.json`, `index.html`, `.gitignore`, `.gitattributes`, `.npmrc`, `.editorconfig`, `.env`, `.env.example`, `pnpm-workspace.yaml`
- Create: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `env.d.ts`, `vite.config.ts`, `.prettierrc.json`, `.oxlintrc.json`, `eslint.config.ts`
- Create: `.vscode/extensions.json`, `.vscode/settings.json`

**Interfaces:**
- Produces: 可安装依赖并启动 `pnpm dev` 的空壳工程（尚无业务代码）

- [ ] **Step 1: 清空项目（保留 docs/ 与 .superpowers/）**

```powershell
Get-ChildItem -Force | Where-Object { $_.Name -notin @('docs', '.superpowers') } | Remove-Item -Recurse -Force
```

- [ ] **Step 2: 写 `package.json`**（前端依赖，Tauri 依赖随后用 pnpm add 添加）

```json
{
  "name": "l4d2-server-introduce",
  "productName": "SummonL4D2-Server-Launcher",
  "description": "A simple page to quickly connect to SummonHIM's Left 4 Dead 2 server.",
  "version": "1.0.3",
  "repository": "https://github.com/SummonHIM/l4d2-server-introduce",
  "author": {
    "email": "summonhim@qq.com",
    "name": "SummonHIM",
    "url": "https://www.summonhim.top"
  },
  "license": "MPL-2.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "run-p type-check \"build-only {@}\" --",
    "preview": "vite preview",
    "test:e2e": "playwright test",
    "build-only": "vite build",
    "type-check": "vue-tsc --build",
    "lint": "run-s lint:*",
    "lint:oxlint": "oxlint . --fix",
    "lint:eslint": "eslint . --fix --cache",
    "format": "prettier --write --experimental-cli src/",
    "tauri": "tauri"
  },
  "dependencies": {
    "@fontsource/anton": "^5.2.5",
    "@primeuix/themes": "^2.0.3",
    "@tailwindcss/vite": "^4.1.18",
    "axios": "^1.13.5",
    "primeicons": "^7.0.0",
    "primevue": "^4.5.4",
    "tailwindcss": "^4.1.18",
    "vue": "^3.5.27",
    "vue-router": "^5.0.1"
  },
  "devDependencies": {
    "@playwright/test": "^1.58.1",
    "@primevue/auto-import-resolver": "^4.5.4",
    "@trivago/prettier-plugin-sort-imports": "^6.0.2",
    "@tsconfig/node24": "^24.0.4",
    "@types/node": "^24.10.9",
    "@vitejs/plugin-vue": "^6.0.3",
    "@vue/eslint-config-typescript": "^14.6.0",
    "@vue/tsconfig": "^0.8.1",
    "dotenv": "^17.3.1",
    "eslint": "^9.39.2",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-oxlint": "~1.42.0",
    "eslint-plugin-playwright": "^2.5.1",
    "eslint-plugin-vue": "~10.7.0",
    "jiti": "^2.6.1",
    "npm-run-all2": "^8.0.4",
    "oxlint": "~1.42.0",
    "prettier": "3.8.1",
    "typescript": "~5.9.3",
    "unplugin-vue-components": "^31.0.0",
    "vite": "^7.3.1",
    "vite-plugin-pages": "^0.33.3",
    "vite-plugin-vue-devtools": "^8.0.5",
    "vue-tsc": "^3.2.4"
  },
  "engines": {
    "node": "^20.19.0 || >=22.12.0"
  },
  "packageManager": "pnpm@10.28.1+sha512.7d7dbbca9e99447b7c3bf7a73286afaaf6be99251eb9498baefa7d406892f67b879adb3a1d7e687fc4ccc1a388c7175fbaae567a26ab44d1067b54fcb0d6a316"
}
```

- [ ] **Step 3: 添加 Tauri 前端依赖**

```powershell
pnpm add @tauri-apps/api @tauri-apps/plugin-opener
pnpm add -D @tauri-apps/cli
```

Expected: `package.json` 增加 `@tauri-apps/api`、`@tauri-apps/plugin-opener`（dependencies）与 `@tauri-apps/cli`（devDependencies），并生成 `pnpm-lock.yaml`。

- [ ] **Step 4: 写根配置与入口文件**

`index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN" class="dark">

<head>
  <meta charset="UTF-8">
  <link rel="icon" href="/favicon.ico">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>L4D2 Server Introduce</title>
</head>

<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>

</html>
```

`.gitignore`:
```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
.DS_Store
dist
dist-ssr
coverage
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

*.tsbuildinfo
.eslintcache

# Cypress
/cypress/videos/
/cypress/screenshots/

# Vitest
__screenshots__/

# Vite
*.timestamp-*-*.mjs

.env

test-results/
playwright-report/

# Editor
.vscode
out/
```

`.gitattributes`:
```
* text=auto eol=lf
```

`.npmrc`:
```
node-linker=hoisted
```

`.editorconfig`:
```
[*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,vue,css,scss,sass,less,styl}]
charset = utf-8
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true
end_of_line = lf
max_line_length = 100
```

`.env`:
```
VITE_SRCDS_SERVER_PROVIDER=SummonHIM
VITE_SRCDS_SERVER_NAME=Left 4 Dead 2
VITE_SRCDS_SERVER_ADDRESS=l4d2.serenity.summonhim.top
VITE_SRCDS_SERVER_PORT=14514
```

`.env.example`:
```
VITE_SRCDS_SERVER_PROVIDER=Somebody
VITE_SRCDS_SERVER_NAME=Left 4 Dead 2
VITE_SRCDS_SERVER_ADDRESS=example.com
VITE_SRCDS_SERVER_PORT=27015
```

`pnpm-workspace.yaml`:
```yaml
onlyBuiltDependencies:
  - esbuild
```

- [ ] **Step 5: 写 TS / Vite / lint 配置**

`tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.app.json" }
  ]
}
```

`tsconfig.app.json`:
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue", "components.d.ts"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

`tsconfig.node.json`:
```json
{
  "extends": "@tsconfig/node24/tsconfig.json",
  "include": [
    "vite.config.*",
    "vitest.config.*",
    "cypress.config.*",
    "nightwatch.conf.*",
    "playwright.config.*",
    "eslint.config.*"
  ],
  "compilerOptions": {
    "noEmit": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"]
  }
}
```

`env.d.ts`:
```ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client" />
```

`vite.config.ts`:
```ts
import { URL, fileURLToPath } from 'node:url'

import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
    Pages(),
    tailwindcss(),
  ],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

`.prettierrc.json`:
```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "plugins": ["@trivago/prettier-plugin-sort-imports"],
  "importOrder": ["<BUILTIN_MODULES>", "^vue", "<THIRD_PARTY_MODULES>", "^@/", "^[./]"],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

`.oxlintrc.json`:
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["eslint", "typescript", "unicorn", "oxc", "vue"],
  "env": { "browser": true },
  "categories": { "correctness": "error" }
}
```

`eslint.config.ts`:
```ts
import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/src-tauri/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
```

`.vscode/extensions.json`:
```json
{
  "recommendations": [
    "Vue.volar",
    "ms-playwright.playwright",
    "dbaeumer.vscode-eslint",
    "EditorConfig.EditorConfig",
    "oxc.oxc-vscode",
    "esbenp.prettier-vscode"
  ]
}
```

`.vscode/settings.json`:
```json
{
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "tsconfig.json": "tsconfig.*.json, env.d.ts",
    "vite.config.*": "jsconfig*, vitest.config.*, cypress.config.*, playwright.config.*",
    "package.json": "package-lock.json, pnpm*, .yarnrc*, yarn*, .eslint*, eslint*, .oxlint*, oxlint*, .oxfmt*, .prettier*, prettier*, .editorconfig"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit"
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

- [ ] **Step 6: 安装依赖并初始化 Git**

```powershell
pnpm install
git init -b main
```

Expected: `pnpm install` 成功；生成 `pnpm-lock.yaml`；git 仓库位于 `main` 分支。

- [ ] **Step 7: 提交（确认 `.env` 未被暂存）**

```powershell
git add -A
git status
```

确认 `.env` 未出现在暂存区（已被 .gitignore 忽略），随后：

```powershell
git commit -m "chore: 初始化 L4D2 服务器介绍页脚手架"
```

---

### Task 2: 核心逻辑库（dns / srcds / utils / locale / tauri）

**Files:**
- Create: `src/dns.ts`, `src/srcds.ts`, `src/utils.ts`, `src/locale.ts`, `src/tauri.ts`

**Interfaces:**
- Produces:
  - `src/dns.ts`: `enum DNSStatus`, `class DNSError extends Error { status?; host? }`, `getDNSStatusMessage(status): string`, `isIPv4(addr): boolean`, `resolveHostToIPv4(host): Promise<string>`
  - `src/srcds.ts`: `srcdsEnv: { provider; name; addr; port }`, `generateSteamBrowserProtocol(address, port?, password?): Promise<string>`
  - `src/utils.ts`: `copy(text, toast: ToastServiceMethods): void`
  - `src/locale.ts`: `zhCNPrime`
  - `src/tauri.ts`: `isTauri(): boolean`, `openExternal(url): void`, `openSteamConnect(url): void`

- [ ] **Step 1: 写 `src/dns.ts`**

```ts
import axios from 'axios'

export enum DNSStatus {
  NOERROR = 0, // 正常
  FORMERR = 1, // 格式错误
  SERVFAIL = 2, // 服务器失败
  NXDOMAIN = 3, // 域名不存在
  NOTIMP = 4, // 不支持的查询类型
  REFUSED = 5, // 被拒绝
}

export interface DNSQuestion {
  name: string
  type: number
}

export interface DNSAnswer {
  name: string
  type: number
  TTL: number
  data: string
}

export interface APIDNS {
  Status: DNSStatus
  TC: boolean
  RD: boolean
  RA: boolean
  AD: boolean
  CD: boolean
  Question: DNSQuestion[]
  Answer?: DNSAnswer[]
  Authority?: DNSAnswer[]
  Comment?: string
}

export class DNSError extends Error {
  public readonly status?: DNSStatus
  public readonly host?: string

  constructor(options: { message: string; status?: DNSStatus; host?: string }) {
    super(options.message)
    this.name = 'DNSError'
    this.status = options.status
    this.host = options.host
    Object.setPrototypeOf(this, DNSError.prototype)
  }
}

export function getDNSStatusMessage(status: DNSStatus | undefined): string {
  switch (status) {
    case DNSStatus.NOERROR:
      return '解析成功'
    case DNSStatus.NXDOMAIN:
      return '域名不存在'
    case DNSStatus.SERVFAIL:
      return 'DNS服务器失败'
    case DNSStatus.REFUSED:
      return 'DNS请求被拒绝'
    default:
      return '未知DNS错误'
  }
}

export function isIPv4(address: string): boolean {
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
  return ipv4Regex.test(address)
}

export async function resolveHostToIPv4(host: string): Promise<string> {
  if (isIPv4(host)) return host

  const res = await axios.get<APIDNS>(`https://dns.alidns.com/resolve?name=${host}&type=A`, {
    headers: { Accept: 'application/dns-json' },
    timeout: 5000,
  })
  const data = res.data

  if (data.Status !== DNSStatus.NOERROR) {
    throw new DNSError({
      message: `DNS error: ${DNSStatus[data.Status]}`,
      host,
      status: data.Status,
    })
  }

  if (!data.Answer?.length) {
    throw new DNSError({ message: 'No DNS answer record', host })
  }

  const record = data.Answer.find((r) => r.type === 1)

  if (!record) {
    throw new DNSError({ message: 'No A record found', host })
  }

  return record.data
}
```

- [ ] **Step 2: 写 `src/srcds.ts`**

```ts
import { resolveHostToIPv4 } from './dns'

export const srcdsEnv = {
  provider: String(import.meta.env.VITE_SRCDS_SERVER_PROVIDER ?? '好心人'),
  name: String(import.meta.env.VITE_SRCDS_SERVER_NAME ?? 'Counter-Strike 2'),
  addr: String(import.meta.env.VITE_SRCDS_SERVER_ADDRESS ?? 'example.com'),
  port: String(import.meta.env.VITE_SRCDS_SERVER_PORT ?? '27015'),
}

export async function generateSteamBrowserProtocol(
  address: string,
  port?: string,
  password?: string,
): Promise<string> {
  const ip = await resolveHostToIPv4(address)

  let url = `steam://connect/${ip}`

  if (port) {
    url += `:${port}`
  }

  if (password) {
    url += `/${encodeURIComponent(password)}`
  }

  return url
}
```

- [ ] **Step 3: 写 `src/utils.ts`**

```ts
import type { ToastServiceMethods } from 'primevue/toastservice'

export function copy(text: string, toast: ToastServiceMethods) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.add({ severity: 'success', summary: '复制成功！', life: 2000 })
    })
    .catch((error) => {
      console.error(error)
      toast.add({ severity: 'error', summary: '复制文本时发生错误！', life: 5000 })
    })
}
```

- [ ] **Step 4: 写 `src/locale.ts`**

```ts
export const zhCNPrime = {
  startsWith: '以…开始',
  contains: '包含',
  notContains: '不包含',
  endsWith: '以…结束',
  equals: '等于',
  notEquals: '不等于',
  noFilter: '无过滤',
  lt: '小于',
  lte: '小于等于',
  gt: '大于',
  gte: '大于等于',
  dateIs: '日期等于',
  dateIsNot: '日期不等于',
  dateBefore: '日期早于',
  dateAfter: '日期晚于',
  clear: '清除',
  apply: '应用',
  matchAll: '匹配全部',
  matchAny: '匹配任意',
  addRule: '添加规则',
  removeRule: '删除规则',
  accept: '是',
  reject: '否',
  choose: '选择',
  upload: '上传',
  cancel: '取消',
  completed: '已完成',
  pending: '进行中',
  fileSizeTypes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
  monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  chooseYear: '选择年份',
  chooseMonth: '选择月份',
  chooseDate: '选择日期',
  prevDecade: '上一个十年',
  nextDecade: '下一个十年',
  prevYear: '上一年',
  nextYear: '下一年',
  prevMonth: '上个月',
  nextMonth: '下个月',
  prevHour: '上一小时',
  nextHour: '下一小时',
  prevMinute: '上一分钟',
  nextMinute: '下一分钟',
  prevSecond: '上一秒',
  nextSecond: '下一秒',
  am: '上午',
  pm: '下午',
  today: '今天',
  weekHeader: '周',
  firstDayOfWeek: 1,
  showMonthAfterYear: true,
  dateFormat: 'yy-mm-dd',
  weak: '弱',
  medium: '中',
  strong: '强',
  passwordPrompt: '请输入密码',
  searchMessage: '找到 {0} 条结果',
  selectionMessage: '已选择 {0} 项',
  emptySelectionMessage: '未选择任何项',
  emptySearchMessage: '未找到结果',
  fileChosenMessage: '已选择 {0} 个文件',
  noFileChosenMessage: '未选择文件',
  emptyMessage: '暂无可选项',
  aria: {
    trueLabel: '是',
    falseLabel: '否',
    nullLabel: '未选择',
    star: '1 星',
    stars: '{star} 星',
    selectAll: '全选',
    unselectAll: '取消全选',
    close: '关闭',
    previous: '上一个',
    next: '下一个',
    navigation: '导航',
    scrollTop: '滚动到顶部',
    moveTop: '移动到顶部',
    moveUp: '上移',
  },
}
```

- [ ] **Step 5: 写 `src/tauri.ts`**

```ts
import { openUrl } from '@tauri-apps/plugin-opener'

/**
 * 是否运行在 Tauri 桌面客户端中
 */
export function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window
}

/**
 * 打开外部 URL（http/https 等）：
 * Tauri 内用系统默认浏览器，否则新标签页
 */
export function openExternal(url: string): void {
  if (isTauri()) {
    openUrl(url)
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/**
 * 打开 Steam 连接协议：
 * Tauri 内用 opener，否则导航当前页
 */
export function openSteamConnect(url: string): void {
  if (isTauri()) {
    openUrl(url)
  } else {
    window.location.href = url
  }
}
```

- [ ] **Step 6: 验证 type-check**

```powershell
pnpm type-check
```

Expected: 无类型错误。

- [ ] **Step 7: Commit**

```powershell
git add src/dns.ts src/srcds.ts src/utils.ts src/locale.ts src/tauri.ts
git commit -m "feat: 添加 DNS 解析、Steam 连接、工具、本地化与 Tauri 环境模块"
```

---

### Task 3: 应用外壳与主题（App / router / main / 全局样式）

**Files:**
- Create: `src/App.vue`, `src/router/index.ts`, `src/main.ts`, `src/assets/style/index.css`

**Interfaces:**
- Produces: 挂载后可渲染的 Vue 应用；PrimeVue 暗黑 + 血迹红 + 毒绿主题；全局僵尸末日背景层；路由（`/`、`/manual`、404 catch-all）

- [ ] **Step 1: 写 `src/App.vue`**

```vue
<template>
  <Toast />
  <main>
    <Suspense>
      <RouterView />
    </Suspense>
  </main>
</template>

<script setup lang="ts"></script>
```

- [ ] **Step 2: 写 `src/router/index.ts`**

```ts
import { createRouter, createWebHashHistory } from 'vue-router'

import routes from '~pages'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
```

- [ ] **Step 3: 写 `src/main.ts`（自定义僵尸主题 preset）**

```ts
import { createApp } from 'vue'

import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import '@fontsource/anton'
import App from './App.vue'
import './assets/style/index.css'
import { zhCNPrime } from './locale'
import router from './router'
import { srcdsEnv } from './srcds'

const app = createApp(App)

const zombiePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fdf2f3',
      100: '#fbe5e7',
      200: '#f8d0d5',
      300: '#f2aab4',
      400: '#e97a8a',
      500: '#dc5164',
      600: '#c8102e',
      700: '#a80e28',
      800: '#8b1024',
      900: '#741022',
      950: '#40050d',
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0d0d0d',
        },
        success: {
          50: '#f4f8e8',
          100: '#e6f0cd',
          200: '#cfe0a0',
          300: '#b0cd6d',
          400: '#94b845',
          500: '#7a9c2f',
          600: '#5f7d24',
          700: '#4a611e',
          800: '#3d4f1c',
          900: '#34431c',
          950: '#19240a',
        },
      },
    },
  },
})

app.use(PrimeVue, {
  theme: {
    preset: zombiePreset,
    options: { darkModeSelector: '.dark' },
  },
  locale: zhCNPrime,
})
app.use(ToastService)
app.use(router)

document.documentElement.classList.add('dark')

document.title = `由 ${srcdsEnv.provider} 提供的 ${srcdsEnv.name} 服务器`

app.mount('#app')
```

- [ ] **Step 4: 写 `src/assets/style/index.css`**

```css
@import 'tailwindcss';
@import 'primeicons/primeicons.css';

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-display: 'Anton', 'Impact', 'Arial Narrow', sans-serif;
  --color-blood: #c8102e;
  --color-blood-dark: #8b1024;
  --color-bone: #d8d3c5;
  --color-rot: #b34d1e;
}

:root {
  color-scheme: dark;
}

html,
body,
#app {
  min-height: 100%;
}

body {
  margin: 0;
  background-color: #0d0d0d;
  color: #e5e5e5;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
}

/* 噪点 + 扫描线 + 暗角背景层 */
.zombie-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0.9) 100%),
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.16) 0px,
      rgba(0, 0, 0, 0.16) 1px,
      transparent 1px,
      transparent 3px
    ),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.32'/%3E%3C/svg%3E"),
    #0d0d0d;
}

code {
  @apply bg-white/10 text-blood px-1.5 rounded font-mono text-[0.92em];
}

pre code {
  @apply bg-black/60 text-bone p-4 rounded block overflow-x-auto;
}
```

- [ ] **Step 5: 验证 dev 可启动**

```powershell
pnpm dev
```

Expected: Vite 启动于 5173，浏览器打开为暗色空白页（无报错）。

- [ ] **Step 6: Commit**

```powershell
git add src/App.vue src/router/index.ts src/main.ts src/assets/style/index.css
git commit -m "feat: 添加应用外壳、路由与僵尸末日主题"
```

---

### Task 4: 资源生成（logo SVG / L4D2 图标 / favicon / 图标源图）

**Files:**
- Create: `src/assets/logo/server-logo.svg`, `src/assets/logo/l4d2-badge.png`, `src/assets/logo/favicon.png`, `src/assets/logo/favicon.ico`, `src/assets/logo/app-icon-source.png`
- Create: `public/favicon.ico`

**Interfaces:**
- Produces: 首页引用的 logo 图片；`public/favicon.ico`；Tauri 图标源图 `app-icon-source.png`（1024×1024）

- [ ] **Step 1: 写 `src/assets/logo/server-logo.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#0d0d0d"/>
    </radialGradient>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="28" fill="url(#bg)" stroke="#3a3a3a" stroke-width="4"/>
  <circle cx="128" cy="128" r="86" fill="none" stroke="#c8102e" stroke-width="6" opacity="0.35"/>
  <circle cx="128" cy="128" r="86" fill="none" stroke="#c8102e" stroke-width="2" stroke-dasharray="6 10"/>
  <line x1="128" y1="36" x2="128" y2="220" stroke="#c8102e" stroke-width="2" opacity="0.5"/>
  <line x1="36" y1="128" x2="220" y2="128" stroke="#c8102e" stroke-width="2" opacity="0.5"/>
  <text x="128" y="152" font-family="Impact, Arial Black, sans-serif" font-size="72" font-weight="bold" fill="#e5e5e5" text-anchor="middle">L4D2</text>
</svg>
```

- [ ] **Step 2: 下载并转换 L4D2 官方图标为 PNG 角标**

```powershell
$tmp = "$env:TEMP\l4d2-badge.ico"
Invoke-WebRequest -Uri "https://shared.fastly.steamstatic.com/community_assets/images/apps/550/1a8d50f6078b5d023582ea1793b0e53813d57b7f.ico" -OutFile $tmp
Add-Type -AssemblyName System.Drawing
$icon = New-Object System.Drawing.Icon($tmp, 64, 64)
$bmp = $icon.ToBitmap()
$bmp.Save("src\assets\logo\l4d2-badge.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose(); $icon.Dispose()
```

Expected: 生成 `src/assets/logo/l4d2-badge.png`（64×64）。

- [ ] **Step 3: 生成 favicon.png（256）、favicon.ico、app-icon-source.png（1024）**

```powershell
Add-Type -AssemblyName System.Drawing

function New-L4D2Image($size, $path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.Clear([System.Drawing.Color]::FromArgb(13, 13, 13))
  $fontSize = [int]($size * 0.42)
  $font = New-Object System.Drawing.Font 'Arial Black', $fontSize, ([System.Drawing.FontStyle]::Bold)
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 16, 46))
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = 'Center'; $format.LineAlignment = 'Center'
  $rect = New-Object System.Drawing.RectangleF 0, 0, $size, $size
  $g.DrawString('L4D2', $font, $brush, $rect, $format)
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

New-L4D2Image 256 "src\assets\logo\favicon.png"
New-L4D2Image 1024 "src\assets\logo\app-icon-source.png"

$bmp = New-Object System.Drawing.Bitmap "src\assets\logo\favicon.png"
$icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
$fs = [System.IO.File]::Create("src\assets\logo\favicon.ico")
$icon.Save($fs)
$fs.Close()
$bmp.Dispose(); $icon.Dispose()
```

Expected: 生成 `favicon.png`、`app-icon-source.png`、`favicon.ico`。

- [ ] **Step 4: 复制 favicon 到 `public/`**

```powershell
New-Item -ItemType Directory -Force -Path "public" | Out-Null
Copy-Item "src\assets\logo\favicon.ico" "public\favicon.ico"
```

- [ ] **Step 5: Commit**

```powershell
git add src/assets/logo public/favicon.ico
git commit -m "feat: 添加血迹风 logo、L4D2 角标、favicon 与图标源图"
```

---

### Task 5: 页脚组件

**Files:**
- Create: `src/components/GlobalFooter.vue`

**Interfaces:**
- Consumes: `srcdsEnv.provider`（Task 2）、`openExternal`（Task 2）
- Produces: `<GlobalFooter />` 全局页脚组件

- [ ] **Step 1: 写 `src/components/GlobalFooter.vue`**

```vue
<template>
  <div v-bind="$attrs" class="mx-1 mt-1 mb-1 text-center text-bone/60">
    <p class="text-sm">
      © {{ currentYear }} {{ srcdsEnv.provider }} |
      <a
        class="underline hover:text-blood transition-colors"
        href="https://github.com/SummonHIM/l4d2-server-introduce"
        target="_blank"
        rel="noopener"
        @click.prevent="openExternal('https://github.com/SummonHIM/l4d2-server-introduce')"
        >Source Code</a
      >
    </p>
    <p class="font-thin text-xs text-bone/40">
      Left 4 Dead 2 and related assets are trademarks and/or copyrights of Valve Corporation. This
      project is not affiliated with or endorsed by Valve.
    </p>
  </div>
</template>

<script setup lang="ts">
import { srcdsEnv } from '@/srcds'
import { openExternal } from '@/tauri'

const currentYear = new Date().getFullYear()
</script>
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/GlobalFooter.vue
git commit -m "feat: 添加全局页脚组件"
```

---

### Task 6: 首页

**Files:**
- Create: `src/pages/index.vue`

**Interfaces:**
- Consumes: `srcdsEnv`, `generateSteamBrowserProtocol`（Task 2）、`DNSError`, `getDNSStatusMessage`（Task 2）、`openExternal`, `openSteamConnect`, `isTauri`（Task 2）、`GlobalFooter`（Task 5）、logo 资源（Task 4）
- Produces: 首页 `/`

- [ ] **Step 1: 写 `src/pages/index.vue`**

```vue
<template>
  <div class="zombie-bg" aria-hidden="true"></div>

  <div class="relative min-h-screen w-full flex flex-col items-center justify-center">
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <div class="relative">
        <img :src="ServerLogo" alt="Server Logo" class="h-44 w-44 md:h-64 md:w-64 select-none" />
        <img
          :src="L4D2Badge"
          alt="Left 4 Dead 2"
          class="absolute -right-4 -top-4 h-14 w-14 md:h-20 md:w-20 rounded-md border-2 border-black/60 shadow-lg"
        />
      </div>

      <p class="mt-8 text-sm uppercase tracking-[0.4em] text-bone/60">由 {{ srcdsEnv.provider }} 提供</p>
      <h1
        class="font-display mt-2 text-6xl md:text-8xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-bone to-blood/80 drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)]"
      >
        LEFT 4 DEAD 2
      </h1>
      <p class="mt-3 text-xl text-bone/80">服务器</p>

      <div class="mt-10">
        <Button
          :as="buttonConfig.href ? 'a' : undefined"
          :href="buttonConfig.href"
          :label="buttonConfig.label"
          :icon="buttonConfig.icon"
          :severity="buttonConfig.severity"
          size="large"
          raised
          class="!px-10 !py-4 !text-lg"
          @click="buttonConfig.click"
        />
      </div>

      <div class="mt-6 text-sm text-bone/60">
        <router-link class="underline hover:text-blood transition-colors" to="/manual"
          >手动连接</router-link
        >

        <template v-if="!inTauri">
          <span>&nbsp;|&nbsp;</span>
          <a
            class="underline hover:text-blood transition-colors"
            :href="appDownUrl"
            target="_blank"
            rel="noopener"
            @click.prevent="openExternal(appDownUrl)"
            >下载客户端</a
          >
        </template>
      </div>
    </div>

    <Dialog v-model:visible="steamConnectDialog" modal header="正在连接到服务器…">
      <p>如果没有任何反应，请确认已安装并登录 Steam 客户端。</p>
    </Dialog>

    <footer class="relative w-full">
      <GlobalFooter />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { type ComputedRef, type Ref, computed, onMounted, ref } from 'vue'

import { AxiosError } from 'axios'
import { useToast } from 'primevue'

import L4D2Badge from '@/assets/logo/l4d2-badge.png'
import ServerLogo from '@/assets/logo/server-logo.svg'
import { DNSError, getDNSStatusMessage } from '@/dns'
import { generateSteamBrowserProtocol, srcdsEnv } from '@/srcds'
import { isTauri, openExternal, openSteamConnect } from '@/tauri'

enum BtnConnectStatus {
  ERROR = 1,
  RESOLVING = 2,
  RESOLVERROR = 3,
  NETERROR = 4,
}

interface ButtonConfig {
  href?: string
  label: string
  icon: string
  severity: string
  click?: () => void
}

defineOptions({
  name: 'HomePage',
})

const toast = useToast()
const inTauri = isTauri()

const appDownUrl = `https://github.com/${srcdsEnv.provider ?? 'GitHub'}/l4d2-server-introduce/releases/latest`

const steamConnectLink: Ref<BtnConnectStatus | string> = ref(BtnConnectStatus.RESOLVING)
const steamConnectDialog = ref(false)

const buttonConfig: ComputedRef<ButtonConfig> = computed(() => {
  if (typeof steamConnectLink.value === 'string') {
    return {
      label: '开始游戏',
      icon: 'pi pi-play-circle',
      severity: 'success',
      click: launchSteamConnectLink,
    }
  }

  switch (steamConnectLink.value) {
    case BtnConnectStatus.RESOLVING:
      return { label: '正在查询', icon: 'pi pi-spin pi-spinner', severity: 'secondary' }

    case BtnConnectStatus.RESOLVERROR:
      return {
        label: '查询错误',
        icon: 'pi pi-exclamation-triangle',
        severity: 'danger',
        click: refreshSteamConnectLink,
      }

    case BtnConnectStatus.NETERROR:
      return {
        label: '网络错误',
        icon: 'pi pi-exclamation-triangle',
        severity: 'danger',
        click: refreshSteamConnectLink,
      }

    default:
    case BtnConnectStatus.ERROR:
      return {
        label: '未知错误',
        icon: 'pi pi-exclamation-triangle',
        severity: 'danger',
        click: refreshSteamConnectLink,
      }
  }
})

async function refreshSteamConnectLink() {
  try {
    steamConnectLink.value = BtnConnectStatus.RESOLVING
    steamConnectLink.value = await generateSteamBrowserProtocol(srcdsEnv.addr, srcdsEnv.port)
  } catch (error) {
    switch (true) {
      case error instanceof DNSError:
        console.error(error)
        steamConnectLink.value = BtnConnectStatus.RESOLVERROR
        toast.add({
          severity: 'error',
          summary: '查询IP地址时发生错误',
          detail: `查询IP地址失败。DNS服务器响应：${getDNSStatusMessage(error.status)}。`,
          life: 5000,
        })
        break

      case error instanceof AxiosError:
        console.error(error)
        steamConnectLink.value = BtnConnectStatus.NETERROR
        toast.add({
          severity: 'error',
          summary: '查询IP地址时发生错误',
          detail: `网络错误。请检查网络连接。(${error.message})`,
          life: 5000,
        })
        break

      default:
      case error instanceof Error:
        console.error(error)
        steamConnectLink.value = BtnConnectStatus.ERROR
        toast.add({
          severity: 'error',
          summary: '查询IP地址时发生错误',
          detail: '发生未知错误！请查看控制台并将错误信息发送给站点管理员。',
          life: 5000,
        })
        break
    }
  }
}

function launchSteamConnectLink() {
  if (typeof steamConnectLink.value !== 'string') return

  steamConnectDialog.value = true

  setTimeout(() => {
    if (typeof steamConnectLink.value !== 'string') return
    openSteamConnect(steamConnectLink.value)
  }, 500)
}

onMounted(async () => {
  refreshSteamConnectLink()
})
</script>
```

- [ ] **Step 2: 验证首页渲染**

```powershell
pnpm dev
```

Expected: 浏览器打开首页，暗色背景 + 噪点/扫描线/暗角，logo + L4D2 角标，Anton 大字标题「LEFT 4 DEAD 2」，绿色「开始游戏」按钮，手动连接/下载客户端链接，页脚。

- [ ] **Step 3: Commit**

```powershell
git add src/pages/index.vue
git commit -m "feat: 实现僵尸末日风首页与连接按钮状态机"
```

---

### Task 7: 手动连接教程页与 404 页

**Files:**
- Create: `src/pages/manual.vue`, `src/pages/[...all].vue`

**Interfaces:**
- Consumes: `srcdsEnv`（Task 2）、`copy`（Task 2）、`GlobalFooter`（Task 5）
- Produces: `/manual`、404 catch-all

- [ ] **Step 1: 写 `src/pages/manual.vue`**

```vue
<template>
  <div class="zombie-bg" aria-hidden="true"></div>

  <div class="relative min-h-screen flex flex-col">
    <div class="flex-1 mx-auto pt-8 pb-8 container max-w-3xl px-4">
      <div class="mb-6">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 text-bone/70 hover:text-blood transition-colors"
        >
          <i class="pi pi-arrow-left"></i>
          返回首页
        </RouterLink>
      </div>

      <h1 class="font-display text-4xl md:text-5xl tracking-wide text-bone mb-8">手动连接服务器</h1>

      <section class="mb-6 rounded-lg border border-white/10 bg-black/40 p-6">
        <h2 class="text-xl font-semibold text-bone mb-3">
          <span class="text-blood mr-2">第一步</span>启用控制台
        </h2>
        <ol class="list-decimal list-inside space-y-2 text-bone/80">
          <li>在主菜单中，单击<code>选项</code>→<code>键盘/鼠标</code>，进入键盘/鼠标设置页面。</li>
          <li>将<code>允许使用开发者控制台</code>设置为<code>已启用</code>。</li>
        </ol>
      </section>

      <section class="mb-6 rounded-lg border border-white/10 bg-black/40 p-6">
        <h2 class="text-xl font-semibold text-bone mb-3">
          <span class="text-blood mr-2">第二步</span>连接到服务器
        </h2>

        <div class="mb-4 rounded-md border border-black/60 bg-[#101010] shadow-inner font-mono">
          <div class="flex items-center gap-1.5 border-b border-black/60 bg-[#161616] px-3 py-2">
            <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f56]"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-[#27c93f]"></span>
            <span class="ml-2 text-xs text-bone/50">~ developer console</span>
          </div>
          <div class="flex items-center justify-between gap-2 px-3 py-3">
            <code class="!bg-transparent text-blood">connect {{ srcdsEnv.addr }}:{{ srcdsEnv.port }}</code>
            <Button
              icon="pi pi-copy"
              severity="secondary"
              variant="text"
              aria-label="复制进服命令"
              @click="copy(consoleConnectCommand, toast)"
            />
          </div>
        </div>

        <ol class="list-decimal list-inside space-y-2 text-bone/80">
          <li>按下打开控制台的按键<code>`~</code>（标点和波浪线）打开控制台。</li>
          <li>将以上进服命令复制到控制台输入框中，并按下回车。</li>
        </ol>
      </section>
    </div>

    <footer class="relative">
      <GlobalFooter />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import { srcdsEnv } from '@/srcds'
import { copy } from '@/utils'

defineOptions({
  name: 'ManualPage',
})

const toast = useToast()
const consoleConnectCommand = ref(`connect ${srcdsEnv.addr}:${srcdsEnv.port}`)
</script>
```

- [ ] **Step 2: 写 `src/pages/[...all].vue`**

```vue
<template>
  <div class="zombie-bg" aria-hidden="true"></div>

  <div class="relative min-h-screen flex flex-col">
    <div class="flex-1 flex flex-col items-center justify-center text-center px-6">
      <h2 class="font-display text-6xl md:text-7xl text-blood">404</h2>
      <h3 class="mt-2 text-3xl text-bone">页面未找到</h3>
      <p class="mb-8 text-bone/60">NotFound</p>
      <Button as-child raised severity="secondary" v-slot="slotProps">
        <RouterLink to="/" :class="slotProps.class">返回首页</RouterLink>
      </Button>
    </div>

    <footer class="relative">
      <GlobalFooter />
    </footer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'NotFoundPage',
})
</script>
```

- [ ] **Step 3: 验证两页可访问**

```powershell
pnpm dev
```

Expected: `/#/manual` 显示教程页与终端风命令框；任意不存在的 hash 路由显示 404 页。

- [ ] **Step 4: Commit**

```powershell
git add src/pages/manual.vue "src/pages/[...all].vue"
git commit -m "feat: 实现手动连接教程页与 404 页"
```

---

### Task 8: Tauri 工程（src-tauri）

**Files:**
- Create: `src-tauri/Cargo.toml`, `src-tauri/build.rs`, `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/default.json`, `src-tauri/.gitignore`
- Generate: `src-tauri/icons/*`（由 `pnpm tauri icon` 生成）

**Interfaces:**
- Consumes: Task 1 脚手架（依赖、`dist/` 产物、`tauri` 脚本）、Task 4 `app-icon-source.png`
- Produces: 可 `pnpm tauri build` 打包的桌面客户端

- [ ] **Step 1: 写 `src-tauri/Cargo.toml`**

```toml
[package]
name = "summonl4d2-server-launcher"
version = "1.0.3"
description = "A simple page to quickly connect to SummonHIM's Left 4 Dead 2 server."
authors = ["SummonHIM"]
edition = "2021"

[lib]
name = "summonl4d2_server_launcher_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
tauri-plugin-window-state = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

- [ ] **Step 2: 写 `src-tauri/build.rs`**

```rust
fn main() {
    tauri_build::build()
}
```

- [ ] **Step 3: 写 `src-tauri/src/main.rs`**

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    summonl4d2_server_launcher_lib::run()
}
```

- [ ] **Step 4: 写 `src-tauri/src/lib.rs`**

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_window_state::Builder::default().build());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 5: 写 `src-tauri/tauri.conf.json`**

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "SummonL4D2-Server-Launcher",
  "version": "1.0.3",
  "identifier": "top.summonhim.l4d2-server-introduce",
  "build": {
    "beforeDevCommand": "pnpm dev",
    "devUrl": "http://localhost:5173",
    "beforeBuildCommand": "pnpm build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "SummonL4D2-Server-Launcher",
        "width": 1024,
        "height": 768,
        "minWidth": 640,
        "minHeight": 480
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

- [ ] **Step 6: 写 `src-tauri/capabilities/default.json`**

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "main-capability",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    {
      "identifier": "opener:allow-open-url",
      "allow": [{ "url": "steam:*" }]
    },
    "window-state:default"
  ]
}
```

- [ ] **Step 7: 写 `src-tauri/.gitignore`**

```
/target/
/gen/schemas/
```

- [ ] **Step 8: 生成 Tauri 图标集**

```powershell
pnpm tauri icon src/assets/logo/app-icon-source.png
```

Expected: 在 `src-tauri/icons/` 生成 `32x32.png`、`128x128.png`、`128x128@2x.png`、`icon.icns`、`icon.ico`、`icon.png` 等图标。

- [ ] **Step 9: 验证前端 type-check 通过**

```powershell
pnpm type-check
```

Expected: 无类型错误。（Rust 侧编译依赖 Rust 工具链，推迟到 Task 11 / 用户装好 Rust 后执行 `pnpm tauri build`。）

- [ ] **Step 10: Commit**

```powershell
git add src-tauri/
git commit -m "feat: 添加 Tauri 桌面客户端工程"
```

---

### Task 9: E2E 测试

**Files:**
- Create: `playwright.config.ts`, `e2e/tsconfig.json`, `e2e/vue.spec.ts`

**Interfaces:**
- Consumes: 全部页面（Task 6/7 产出）
- Produces: `pnpm test:e2e` 可运行的端到端测试

- [ ] **Step 1: 写 `playwright.config.ts`**

```ts
import process from 'node:process'

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    actionTimeout: 0,
    baseURL: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: !!process.env.CI,
  },
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npm run dev',
    port: process.env.CI ? 4173 : 5173,
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 2: 写 `e2e/tsconfig.json`**

```json
{
  "extends": "@tsconfig/node24/tsconfig.json",
  "include": ["./**/*"]
}
```

- [ ] **Step 3: 写 `e2e/vue.spec.ts`**

```ts
import { expect, test } from '@playwright/test'
import 'dotenv/config'

const serverProvider = process.env.VITE_SRCDS_SERVER_PROVIDER ?? '好心人'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Check provider and server name heading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('LEFT 4 DEAD 2')
    await expect(page.locator('p', { hasText: `由 ${serverProvider} 提供` })).toBeVisible()
  })

  test('Check connect button visibility and text', async ({ page }) => {
    const button = page.locator('button')
    await expect(button).toBeVisible()
    await expect(button).toHaveText(/开始游戏|正在查询|查询错误|网络错误|未知错误/)
  })

  test('Check logo and L4D2 badge visible', async ({ page }) => {
    await expect(page.locator('img[alt="Server Logo"]')).toBeVisible()
    await expect(page.locator('img[alt="Left 4 Dead 2"]')).toBeVisible()
  })

  test('Check manual and download links', async ({ page }) => {
    await expect(page.locator('a[href="#/manual"]')).toBeVisible()

    const downloadLink = page.locator('a', { hasText: '下载客户端' })
    await expect(downloadLink).toBeVisible()
    await expect(downloadLink).toHaveAttribute('href', /github.com/)
  })

  test('Check footer content', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    const currentYear = new Date().getFullYear().toString()
    const footerText = footer.locator('p').first()
    await expect(footerText).toContainText(currentYear)
    await expect(footerText).toContainText(serverProvider)

    const copyrightText = footer.locator('p').nth(1)
    await expect(copyrightText).toContainText('Left 4 Dead 2 and related assets are trademarks')
  })
})

test.describe('Manual Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/manual')
  })

  test('Check steps and console command', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('手动连接服务器')
    await expect(page.getByText('第一步')).toBeVisible()
    await expect(page.getByText('第二步')).toBeVisible()

    const addr = process.env.VITE_SRCDS_SERVER_ADDRESS ?? 'example.com'
    const port = process.env.VITE_SRCDS_SERVER_PORT ?? '27015'
    await expect(page.locator('code', { hasText: 'connect' })).toContainText(`connect ${addr}:${port}`)
  })
})

test.describe('404 Page', () => {
  test('Check not found page', async ({ page }) => {
    await page.goto('/#/nonexistent-route')
    await expect(page.getByText('页面未找到')).toBeVisible()
  })
})
```

- [ ] **Step 4: 运行测试**

```powershell
pnpm test:e2e
```

Expected: 全部通过（Chromium / Firefox / Mobile Chrome）。

- [ ] **Step 5: Commit**

```powershell
git add playwright.config.ts e2e/
git commit -m "test: 更新 E2E 测试以匹配新布局"
```

---

### Task 10: CI 工作流

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: 全部构建/测试脚本、Tauri 工程（Task 8）
- Produces: GitHub Actions 双端构建发布流水线（Web + Tauri）

- [ ] **Step 1: 写 `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: ["main"]
    tags: ["v*.*.*"]
  pull_request:
    branches: ["main"]

jobs:
  build_web:
    runs-on: ubuntu-latest
    environment: ci
    permissions:
      contents: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js lts/jod
        uses: actions/setup-node@v4
        with:
          node-version: lts/jod
          cache: pnpm

      - name: Install node modules
        run: pnpm install --frozen-lockfile

      - name: Build static pages
        env:
          VITE_SRCDS_SERVER_ADDRESS: ${{ vars.VITE_SRCDS_SERVER_ADDRESS }}
          VITE_SRCDS_SERVER_NAME: ${{ vars.VITE_SRCDS_SERVER_NAME }}
          VITE_SRCDS_SERVER_PORT: ${{ vars.VITE_SRCDS_SERVER_PORT }}
          VITE_SRCDS_SERVER_PROVIDER: ${{ vars.VITE_SRCDS_SERVER_PROVIDER }}
        run: |
          pnpm build

      - name: Test node project
        env:
          VITE_SRCDS_SERVER_ADDRESS: ${{ vars.VITE_SRCDS_SERVER_ADDRESS }}
          VITE_SRCDS_SERVER_NAME: ${{ vars.VITE_SRCDS_SERVER_NAME }}
          VITE_SRCDS_SERVER_PORT: ${{ vars.VITE_SRCDS_SERVER_PORT }}
          VITE_SRCDS_SERVER_PROVIDER: ${{ vars.VITE_SRCDS_SERVER_PROVIDER }}
        run: |
          pnpm exec playwright install --with-deps
          pnpm test:e2e

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist

      - name: Compress built files
        if: startsWith(github.ref, 'refs/tags/')
        run: tar -cJvf dist.tar.xz dist

      - name: Publish new release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v2
        with:
          draft: true
          files: dist.tar.xz
          name: Release ${{ github.ref_name }}

  build_tauri:
    strategy:
      fail-fast: false
      matrix:
        platform:
          - ubuntu-latest
          - windows-latest
    runs-on: ${{ matrix.platform }}
    environment: ci
    permissions:
      contents: write
    needs:
      - build_web
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js lts/jod
        uses: actions/setup-node@v4
        with:
          node-version: lts/jod
          cache: pnpm

      - name: Install node modules
        run: pnpm install --frozen-lockfile

      - name: Install Rust stable
        uses: dtolnay/rust-toolchain@stable

      - name: Rust cache
        uses: swatinem/rust-cache@v2
        with:
          workspaces: "./src-tauri -> target"

      - name: Install Linux dependencies
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

      - name: Build Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VITE_SRCDS_SERVER_ADDRESS: ${{ vars.VITE_SRCDS_SERVER_ADDRESS }}
          VITE_SRCDS_SERVER_NAME: ${{ vars.VITE_SRCDS_SERVER_NAME }}
          VITE_SRCDS_SERVER_PORT: ${{ vars.VITE_SRCDS_SERVER_PORT }}
          VITE_SRCDS_SERVER_PROVIDER: ${{ vars.VITE_SRCDS_SERVER_PROVIDER }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: "Release ${{ github.ref_name }}"
          releaseBody: "See the assets to download."
          releaseDraft: true
          prerelease: false
```

- [ ] **Step 2: Commit**

```powershell
git add .github/workflows/ci.yml
git commit -m "ci: 添加 Web 与 Tauri 双端构建发布流水线"
```

---

### Task 11: 全量验证

**Files:**
- Modify: 无（验证阶段）

- [ ] **Step 1: 安装 + 类型检查 + lint**

```powershell
pnpm install
pnpm type-check
pnpm lint
```

Expected: type-check 无错误；lint 无错误（或仅自动修复）。

- [ ] **Step 2: 生产构建**

```powershell
pnpm build
```

Expected: `dist/` 生成，无报错。

- [ ] **Step 3: 预览验证**

```powershell
pnpm preview
```

Expected: 生产构建在 4173 端口可访问，页面正常。

- [ ] **Step 4: E2E 测试**

```powershell
pnpm test:e2e
```

Expected: 全部通过。

- [ ] **Step 5: 打包 Tauri 桌面客户端（需 Rust ≥1.90 已安装）**

```powershell
pnpm tauri build
```

Expected: `src-tauri/target/release/` 生成可执行文件与安装包（体积远小于 Electron）。若 Rust 未安装则跳过，待用户装好后重跑。

- [ ] **Step 6: 更新 README**

将 `README.md` 更新为简短项目说明（安装/构建/环境变量/Tauri 打包说明），再：

```powershell
git add README.md
git commit -m "docs: 更新 README"
```

---

## Self-Review 结果

- **Spec coverage**：设计文档每个功能点均映射到任务——首页（Task 6）、教程页+404（Task 7）、页脚（Task 5）、资源占位（Task 4）、视觉主题（Task 3）、DNS/连接/Tauri 环境（Task 2）、Tauri 客户端（Task 8）、E2E（Task 9）、CI（Task 10）、清空+脚手架（Task 1）、全量验证（Task 11）。
- **Placeholder scan**：无 TBD/TODO；代码步骤含完整实现。
- **Type consistency**：`srcdsEnv` / `generateSteamBrowserProtocol` / `DNSError` / `getDNSStatusMessage` / `copy` / `isTauri` / `openExternal` / `openSteamConnect` / `GlobalFooter` 命名在各任务间一致；Tauri Rust crate 名 `summonl4d2_server_launcher_lib` 与 `main.rs` 调用一致。
