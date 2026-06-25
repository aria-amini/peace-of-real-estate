import '@tests/__mocks__/browser'

import { test } from '@tests/__fixtures__/browser'

import { expectRouteScreenshot } from '@tests/utils/file-routes'

const consumerSignupSteps = [
	{ step: 'intro', name: 'consumer-signup-step-1-intro' },
	{ step: 'intent', name: 'consumer-signup-step-2-intent' },
	{ step: 'home', name: 'consumer-signup-step-3-home' },
	{ step: 'quiz', name: 'consumer-signup-step-4-quiz' },
	{ step: 'preview', name: 'consumer-signup-step-5-preview' },
] as const

for (const { step, name } of consumerSignupSteps) {
	test(`consumer signup ${step} step matches desktop screenshot`, async () => {
		await expectRouteScreenshot({
			path: `/consumer/signup/?step=${step}`,
			name,
		})
	})
}
