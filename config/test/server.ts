import { test as baseTest } from 'vite-plus/test'

import { startMswServer } from './msw-server'

const extended = baseTest
	.extend(
		'server',
		{ auto: true, scope: 'worker' },
		async ({}, { onCleanup }) => {
			return startMswServer(onCleanup)
		},
	)
	.extend('_cleanup', { auto: true }, ({ server }, { onCleanup }) => {
		onCleanup(() => server.resetHandlers())
	})

export { afterEach, beforeEach, describe, expect, vi } from 'vite-plus/test'
export const test = extended
