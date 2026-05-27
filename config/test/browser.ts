import { setupWorker, type SetupWorker } from 'msw/browser'
import { expect as baseExpect, test as baseTest } from 'vite-plus/test'
import type { ExpectPollOptions } from 'vite-plus/test'
import type { Locator } from 'vite-plus/test/browser'

import handlers from '@test/handlers'

type BrowserElementExpectation = {
	element: <T extends HTMLElement | SVGElement | null | Locator>(
		element: T,
		options?: ExpectPollOptions,
	) => any
}

let workerSingleton: SetupWorker | undefined

async function ensureWorker(): Promise<SetupWorker> {
	if (!workerSingleton) {
		workerSingleton = setupWorker(...handlers)
	}
	return workerSingleton
}

const extended = baseTest
	.extend(
		'worker',
		{ auto: true, scope: 'worker' },
		async ({}, { onCleanup }) => {
			const worker = await ensureWorker()
			await worker.start({ quiet: true, onUnhandledRequest: 'bypass' })
			onCleanup(() => worker.stop())

			return worker
		},
	)
	.extend('_cleanup', { auto: true }, ({ worker }, { onCleanup }) => {
		onCleanup(() => worker.resetHandlers())
	})

export { afterEach, beforeEach, describe, vi } from 'vite-plus/test'
export const expect = baseExpect as typeof baseExpect &
	BrowserElementExpectation
export const test = extended
