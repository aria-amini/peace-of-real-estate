import './mocks/browser'

import { expect, test } from '@config/test/browser'
import { page, userEvent } from 'vite-plus/test/browser'
import { expectRouteScreenshot } from './utils/file-routes'

const pages = [
	'/',
	'/buyer/results',
	'/agent/priorities',
	'/agent/quiz',
	'/agent/profile',
	'/matches',
	'/login',
	'/signup',
	'/beta',
	'/buyer/summary',
] as const

test.each(
	pages.map((path) => [path === '/' ? 'home' : path.slice(1), path] as const),
)(
	'%s page matches desktop screenshot',
	async (_label, path) => {
		await expectRouteScreenshot({ path })
	},
	30_000,
)

test('home get matched dialog matches desktop screenshot', async () => {
	await expectRouteScreenshot({
		path: '/',
		name: 'home-get-matched-dialog',
		prepare: async () => {
			await userEvent.click(
				page.getByRole('button', { name: /I'm a buyer\/seller/i }),
			)
			await expect.element(page.getByRole('dialog')).toBeVisible()
		},
		screenshotTarget: () => document.body,
	})
})
