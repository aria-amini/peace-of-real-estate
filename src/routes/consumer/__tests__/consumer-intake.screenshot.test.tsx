import '@tests/__mocks__/browser'

import { test } from '@config/test/browser'
import {
	ConsumerIntake,
	consumerConfig,
} from '@/components/consumer-flow-pages'

import { expectComponentScreenshot } from '@tests/utils/component-screenshot'

test('consumer-step1 matches desktop screenshot', async () => {
	await expectComponentScreenshot({
		name: 'consumer-step1',
		component: () => <ConsumerIntake config={consumerConfig} step="intro" />,
	})
}, 10_000)

test('consumer-step2 matches desktop screenshot', async () => {
	await expectComponentScreenshot({
		name: 'consumer-step2',
		component: () => <ConsumerIntake config={consumerConfig} step="intent" />,
	})
}, 10_000)

test('consumer-step3 matches desktop screenshot', async () => {
	await expectComponentScreenshot({
		name: 'consumer-step3',
		component: () => <ConsumerIntake config={consumerConfig} step="home" />,
	})
}, 10_000)

test('consumer-step4 matches desktop screenshot', async () => {
	await expectComponentScreenshot({
		name: 'consumer-step4',
		component: () => <ConsumerIntake config={consumerConfig} step="quiz" />,
	})
}, 10_000)
