import './mocks/browser'

import { test } from '@config/test/browser'
import { expectRouteScreenshot } from './utils/file-routes'

const pages = [
	'/',
	'/buyer/results',
	'/agent/priorities',
	'/agent/quiz',
	'/agent/profile',
	'/match-activity',
	'/login',
	'/signup',
	'/beta',
] as const

test.each(
	pages.map((path) => [path === '/' ? 'home' : path.slice(1), path] as const),
)('%s page matches desktop screenshot', async (_label, path) => {
	await expectRouteScreenshot({ path })
})
