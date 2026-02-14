import { expect, test } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display title, logo, and valid steam connect link', async ({ page }) => {
    // 访问首页
    await page.goto('/')

    /**
     * 1️⃣ 检查页面标题是否正确
     * 只匹配“服务器”关键词即可，避免环境变量不同导致失败
     */
    await expect(page).toHaveTitle(/服务器/, { timeout: 10000 })

    /**
     * 2️⃣ 检查头图是否正常显示
     * PrimeVue 的 Image 最终会渲染成 img
     */
    const logo = page.locator('img[alt="FavIcon"]')

    // 等待图片可见
    await expect(logo).toBeVisible()

    // 确认图片真正加载成功（naturalWidth > 0）
    const naturalWidth = await logo.evaluate((img: HTMLImageElement) => img.naturalWidth)
    expect(naturalWidth).toBeGreaterThan(0)

    /**
     * 3️⃣ 等待“开始游戏”按钮从 RESOLVING 变成可点击的 a 标签
     */
    const connectButton = page.locator('a:has-text("开始游戏")')

    // 最多等待 10 秒（DNS 解析可能需要时间）
    await expect(connectButton).toBeVisible({ timeout: 10000 })

    // 获取 href
    const href = await connectButton.getAttribute('href')

    // 确保不为空
    expect(href).not.toBeNull()

    /**
     * 4️⃣ 校验 steam 协议格式
     * 格式必须为：
     * steam://connect/<ip>:<port>
     */
    expect(href).toMatch(/^steam:\/\/connect\/\d+\.\d+\.\d+\.\d+:\d+$/)
  })
})
