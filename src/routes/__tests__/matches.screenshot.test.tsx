import '@tests/__mocks__/browser'

import { test } from '@config/test/browser'

import { expectRouteScreenshot } from '@tests/utils/file-routes'

test('matches page matches desktop screenshot', async () => {
	await expectRouteScreenshot({
		path: '/matches',
		name: 'matches',
	})
}, 20_000)
