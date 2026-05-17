import { expect, test as base, type Page } from '@playwright/test'

type AppFixture = {
	gotoHome: () => Promise<void>
}

async function gotoHome(page: Page) {
	await page.setViewportSize({ width: 1440, height: 2200 })
	await page.goto('/', { waitUntil: 'domcontentloaded' })
	await page.getByRole('link', { name: 'Peace of Real Estate' }).waitFor()
}

export const test = base.extend<{ app: AppFixture }>({
	page: async ({ page, baseURL }, use) => {
		const url = new URL(baseURL || 'http://localhost:3000')
		await page.context().addCookies([
			{
				name: 'beta_auth',
				value: 'true',
				path: '/',
				domain: url.hostname,
			},
		])
		await use(page)
	},
	app: async ({ page }, use) => {
		await use({
			gotoHome: () => gotoHome(page),
		})
	},
})

export { expect }
