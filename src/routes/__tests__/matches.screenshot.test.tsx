import '@tests/__mocks__/browser'

import { test } from '@tests/__fixtures__/browser'

import { expectRouteScreenshot } from '@tests/utils/file-routes'

test('matches page matches desktop screenshot', async () => {
	await expectRouteScreenshot({
		path: '/consumer/dashboard/matches',
		name: 'matches',
	})
}, 20_000)
