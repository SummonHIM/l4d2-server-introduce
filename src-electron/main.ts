import path from 'path'

import { BrowserWindow, app, shell } from 'electron'
import contextMenu from 'electron-context-menu'
import electronSquirrelStartup from 'electron-squirrel-startup'
import Store from 'electron-store'
import { updateElectronApp } from 'update-electron-app'

const store = new Store<{
  appearance: {
    winWidth: number
    winHeight: number
    winX?: number
    winY?: number
  }
}>()

/**
 * 将当前窗口数据保存到Store中
 * @param win 窗口
 */
function saveBounds(win: BrowserWindow) {
  const bounds = win.getBounds()

  store.set('appearance', {
    winWidth: bounds.width,
    winHeight: bounds.height,
    winX: bounds.x,
    winY: bounds.y,
  })
}

/**
 * 主窗口
 */
function createWindow(): void {
  const savedAppearance = store.get('appearance')

  const win = new BrowserWindow({
    width: savedAppearance?.winWidth ?? 1280,
    height: savedAppearance?.winHeight ?? 800,
    x: savedAppearance?.winX,
    y: savedAppearance?.winY,
  })

  // 右键菜单
  contextMenu({
    showSaveImageAs: true,
  })

  // 清除工具栏
  win.setMenu(null)

  // 加载文件
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173/')
  } else {
    win.loadFile(path.join('dist/', 'index.html'))
  }

  // 调试模式允许打开DevTools
  if (process.env.NODE_ENV === 'development') {
    // 监听 F12 为打开DevTools
    win.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && input.key === 'F12') {
        win.webContents.openDevTools({ mode: 'detach' }) // 弹出窗口
        event.preventDefault() // 阻止默认行为
      }
    })
  }

  // 阻止非文件协议在 Electron 打开
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith('file://')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }

    return { action: 'allow' }
  })

  // 关闭后保存Store
  win.on('close', () => {
    saveBounds(win)
  })
}

// 安装阶段直接退出
if (electronSquirrelStartup) {
  app.quit()
}

// 启动窗口
app
  .whenReady()
  .then(() => {
    createWindow()

    // 如果没有窗口打开则打开一个窗口 (macOS)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  .catch(console.error)

// 更新钩子
updateElectronApp()

// 关闭所有窗口时退出应用 (Windows & Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
