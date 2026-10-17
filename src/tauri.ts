import { openUrl } from '@tauri-apps/plugin-opener'

/**
 * 是否运行在 Tauri 桌面客户端中
 */
export function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window
}

/**
 * 打开外部 URL（http/https 等）。
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
 * 打开 Steam 连接协议。
 * Tauri 内用 opener，否则导航当前页
 */
export function openSteamConnect(url: string): void {
  if (isTauri()) {
    openUrl(url)
  } else {
    window.location.href = url
  }
}
