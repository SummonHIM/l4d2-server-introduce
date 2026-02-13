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

test.describe('Manual Page', () => {
  test('should render all help content correctly', async ({ page }) => {
    // 访问手动连接页面
    await page.goto('/manual')

    /**
     * 1️⃣ 检查两个教程标题存在
     */
    const firstTitle = page.getByText('第一步：启用控制台')
    await expect(firstTitle).toBeVisible({ timeout: 10000 })

    const secondTitle = page.getByText('第二步：连接到服务器')
    await expect(secondTitle).toBeVisible({ timeout: 10000 })

    /**
     * 2️⃣ 检查进服命令输入框存在
     */
    const input = page.locator('#console_connect_command')
    await expect(input).toBeVisible()

    const value = await input.inputValue()
    expect(value).toMatch(/^connect\s+\S+:\d+$/)

    /**
     * 3️⃣ 检查所有教程图片是否正常加载
     * 不关心数量，只验证存在的图片都加载成功
     */
    const images = page.locator('img')

    const count = await images.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const img = images.nth(i)

      await expect(img).toBeVisible()

      const naturalWidth = await img.evaluate((image: HTMLImageElement) => image.naturalWidth)

      expect(naturalWidth).toBeGreaterThan(0)
    }
  })
})
