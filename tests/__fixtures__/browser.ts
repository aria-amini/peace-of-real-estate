import { setupWorker, type SetupWorker } from 'msw/browser'
import { expect as baseExpect, test as baseTest } from 'vite-plus/test'
import type { ExpectPollOptions, TestAPI } from 'vite-plus/test'
import type { Locator } from 'vite-plus/test/browser'

export interface MswBrowserFixture {
	worker: SetupWorker
	_cleanup: void
}

type BrowserElementExpectation = {
	element: <T extends HTMLElement | SVGElement | null | Locator>(
		element: T,
		options?: ExpectPollOptions,
	) => any
}

let workerSingleton: SetupWorker | undefined

async function ensureWorker(): Promise<SetupWorker> {
	if (!workerSingleton) {
		const { default: handlers } = await import('@tests/__mocks__/handlers')
		workerSingleton = setupWorker(...handlers)
	}
	return workerSingleton
}

const extended = baseTest.extend<MswBrowserFixture>({
	worker: [
		async ({}, use) => {
			const worker = await ensureWorker()
			await worker.start({ quiet: true, onUnhandledRequest: 'bypass' })
			await use(worker)
			worker.stop()
		},
		{ auto: true, scope: 'worker' },
	],
	_cleanup: [
		async ({ worker }, use) => {
			await use()
			worker.resetHandlers()
		},
		{ auto: true },
	],
})

export { afterEach, beforeEach, describe, vi } from 'vite-plus/test'
export const expect = baseExpect as typeof baseExpect &
	BrowserElementExpectation
export const test = extended as TestAPI<MswBrowserFixture>
