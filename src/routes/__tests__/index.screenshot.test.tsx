import '@tests/__mocks__/browser'

import { test } from '@config/test/browser'

import { expectRouteScreenshot } from '@tests/utils/file-routes'

test('home page matches desktop screenshot', async () => {
	await expectRouteScreenshot({ path: '/', name: 'home' })
})
