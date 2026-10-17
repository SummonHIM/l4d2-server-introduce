import { readFileSync, writeFileSync } from 'node:fs'

// 版本号来源：APP_VERSION 环境变量，或命令行第一个参数（如 v2.0.0-beta.2）
let version = process.env.APP_VERSION ?? process.argv[2] ?? ''

// 去掉 v 前缀（v2.0.0 -> 2.0.0）
version = version.replace(/^v/, '')

if (!version) {
  console.error('未提供版本号。用法：APP_VERSION=2.0.0-beta.2 node scripts/sync-version.mjs')
  process.exit(1)
}

// 校验 semver（含 pre-release）
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`非法版本号: ${version}`)
  process.exit(1)
}

// 1. package.json
const pkgPath = new URL('../package.json', import.meta.url)
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
pkg.version = version
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

// 2. tauri.conf.json
const confPath = new URL('../src-tauri/tauri.conf.json', import.meta.url)
const conf = JSON.parse(readFileSync(confPath, 'utf8'))
conf.version = version
writeFileSync(confPath, `${JSON.stringify(conf, null, 2)}\n`)

// 3. Cargo.toml（仅替换 [package] 下首行 version）
const cargoPath = new URL('../src-tauri/Cargo.toml', import.meta.url)
const cargo = readFileSync(cargoPath, 'utf8')
if (!/^version = ".*"$/m.test(cargo)) {
  console.error('Cargo.toml 中未找到 version 字段')
  process.exit(1)
}
writeFileSync(cargoPath, cargo.replace(/^version = ".*"$/m, `version = "${version}"`))

console.log(`版本已同步为 ${version}`)
