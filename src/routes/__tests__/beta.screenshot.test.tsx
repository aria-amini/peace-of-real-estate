import '@tests/mocks/browser'

import { test } from '@config/test/browser'

import { expectRouteScreenshot } from '@tests/utils/file-routes'

test('beta page matches desktop screenshot', async () => {
	await expectRouteScreenshot({ path: '/beta', name: 'beta' })
})
