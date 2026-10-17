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
