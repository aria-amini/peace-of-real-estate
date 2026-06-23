import '@tests/__mocks__/browser'

import { test } from '@tests/__fixtures__/browser'

import { expectRouteScreenshot } from '@tests/utils/file-routes'

test('home page matches desktop screenshot', async () => {
	await expectRouteScreenshot({ path: '/', name: 'home' })
})
