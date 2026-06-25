import '@tests/__mocks__/browser'

import { test } from '@tests/__fixtures__/browser'

import { expectRouteScreenshot } from '@tests/utils/file-routes'

test('agent compliance page matches desktop screenshot', async () => {
	await expectRouteScreenshot({
		path: '/agent/dashboard/compliance',
		name: 'agent-compliance',
	})
})
