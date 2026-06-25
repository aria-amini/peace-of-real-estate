import '@tests/__mocks__/browser'

import { test } from '@tests/__fixtures__/browser'

import { expectRouteScreenshot } from '@tests/utils/file-routes'

test('agent index redirect matches desktop screenshot', async () => {
	await expectRouteScreenshot({ path: '/agent/', name: 'agent-redirect' })
})
