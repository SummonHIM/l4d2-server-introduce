import { expect, test } from '@playwright/test'
import 'dotenv/config'

// 从 .env 或系统环境读取 serverProvider
const serverProvider = process.env.VITE_SRCDS_SERVER_PROVIDER ?? '好心人'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Check H1 and H3 text', async ({ page }) => {
    // 检查 h3 文本
    const h3 = page.locator('h3')
    await expect(h3).toHaveText(`由 ${serverProvider} 提供的`)

    // 检查 h1 文本
    const h1 = page.locator('h1')
    await expect(h1).toHaveText(/服务器$/)
  })

  test('Check button visibility and text', async ({ page }) => {
    // 检查按钮是否可见
    const button = page.locator('button, a[role="button"]')
    await expect(button).toBeVisible()

    // 检查按钮文字
    await expect(button).toHaveText(/开始游戏|正在查询|查询错误|网络错误|未知错误/)
  })

  test('Check image is visible and loaded', async ({ page }) => {
    // 检查 FavIcon 是否可见
    const img = page.locator('img[alt="FavIcon"]')
    await expect(img).toBeVisible()

    // 检查图片是否已加载完成
    const loaded = await img.evaluate((el) => el.complete && el.naturalWidth > 0)
    expect(loaded).toBe(true)
  })

  test('Check manual and download links', async ({ page }) => {
    // 检查手动连接链接存在
    const manualLink = page.locator('a[href="#/manual"]')
    await expect(manualLink).toBeVisible()

    // 检查客户端下载链接存在并指向 GitHub
    const downloadLink = page.locator('a', { hasText: '下载客户端' })
    await expect(downloadLink).toBeVisible()
    await expect(downloadLink).toHaveAttribute('href', /github.com/)
  })

  test('Check footer content', async ({ page }) => {
    // 检查 footer 是否存在
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // 检查 GlobalFooter 内年份和 serverProvider 是否显示
    const currentYear = new Date().getFullYear().toString()
    const footerText = footer.locator('p').first()
    await expect(footerText).toContainText(currentYear) // 检查年份
    await expect(footerText).toContainText(serverProvider) // 检查 serverProvider

    // 检查版权声明存在
    const copyrightText = footer.locator('p').nth(1)
    await expect(copyrightText).toContainText('Left 4 Dead 2 and related assets are trademarks')
  })
})
