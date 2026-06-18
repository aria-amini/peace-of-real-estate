import '@tests/mocks/browser'

import { test } from '@config/test/browser'
import { ConsumerIntake, buyerConfig } from '@/components/consumer-flow-pages'

import { expectComponentScreenshot } from '@tests/utils/component-screenshot'

test('buyer-step1 matches desktop screenshot', async () => {
	await expectComponentScreenshot({
		name: 'buyer-step1',
		component: () => <ConsumerIntake config={buyerConfig} step="intro" />,
	})
}, 10_000)

test('buyer-step2 matches desktop screenshot', async () => {
	await expectComponentScreenshot({
		name: 'buyer-step2',
		component: () => <ConsumerIntake config={buyerConfig} step="situation" />,
	})
}, 10_000)

test('buyer-step3 matches desktop screenshot', async () => {
	await expectComponentScreenshot({
		name: 'buyer-step3',
		component: () => <ConsumerIntake config={buyerConfig} step="quiz" />,
	})
}, 10_000)
