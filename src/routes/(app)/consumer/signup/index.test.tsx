import '@tests/__mocks__/browser'

import { test } from '@tests/__fixtures__/browser'

import { expectRouteScreenshot } from '@tests/utils/file-routes'

test('consumer signup page matches desktop screenshot', async () => {
	await expectRouteScreenshot({
		path: '/consumer/signup/',
		name: 'consumer-signup',
	})
})
