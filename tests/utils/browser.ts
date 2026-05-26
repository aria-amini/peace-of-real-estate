import { expect as baseExpect, test as baseTest } from 'vite-plus/test'
import type { ExpectPollOptions, TestAPI } from 'vite-plus/test'
import type { Locator } from 'vite-plus/test/browser'

type BrowserElementExpectation = {
	element: <T extends HTMLElement | SVGElement | null | Locator>(
		element: T,
		options?: ExpectPollOptions,
	) => any
}

export { afterEach, beforeEach, describe, vi } from 'vite-plus/test'
export const expect = baseExpect as typeof baseExpect &
	BrowserElementExpectation
export const test = baseTest as TestAPI
