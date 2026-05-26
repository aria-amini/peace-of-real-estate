import './__mocks__/browser-mocks'

import { test } from './utils/browser'
import { expectRouteScreenshot } from './utils/file-routes'

const pages = [
	{
		path: '/',
	},
	{
		path: '/buyer/results',
	},
	{
		path: '/agent/priorities',
	},
	{
		path: '/agent/quiz',
	},
	{
		path: '/agent/profile',
	},
	{
		name: 'match-activity',
	},
	{
		path: '/login',
	},
	{
		path: '/signup',
	},
	{
		path: '/beta',
	},
] as const

function getPageLabel(options: (typeof pages)[number]) {
	return 'name' in options ? options.name : options.path
}

test.each(pages.map((options) => [getPageLabel(options), options] as const))(
	'%s page matches desktop screenshot',
	async (_label, options) => {
		await expectRouteScreenshot(options)
	},
)
