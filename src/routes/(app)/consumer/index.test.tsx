import '@tests/__mocks__/browser'

import { test } from '@tests/__fixtures__/browser'

import { expectRouteScreenshot } from '@tests/utils/file-routes'

test('consumer index redirect matches desktop screenshot', async () => {
	await expectRouteScreenshot({
		path: '/consumer/',
		name: 'consumer-redirect',
	})
})
