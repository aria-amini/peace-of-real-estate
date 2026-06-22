import { serverEnv } from './src/env.server'
import type { NitroAppPlugin } from 'nitro/types'

const validateEnvPlugin: NitroAppPlugin = () => {
	// Trigger lazy zod parse so the server fails fast on startup if required env is missing.
	Object.keys(serverEnv)
}

import { createAppConfig } from '@aamini/config/vite'
import type { TestProjectConfiguration } from 'vite-plus'
import { mergeConfig } from 'vite-plus'

type ScreenshotPathData = {
	arg: string
	ext: string
	root: string
	screenshotDirectory: string
	testFileDirectory: string
	testFileName: string
}

const CENTRAL_SCREENSHOTS_DIR = 'tests/__screenshots__'

function getScreenshotGroupName(testFileName: string) {
	return testFileName.replace(/\.[^.]+$/, '')
}

function resolveCentralScreenshotPath({
	arg,
	ext,
	root,
	testFileName,
}: ScreenshotPathData) {
	return `${root}/${CENTRAL_SCREENSHOTS_DIR}/${getScreenshotGroupName(testFileName)}/${arg}${ext}`
}
const browserProjectOverrides = {
	test: {
		browser: {
			expect: {
				toMatchScreenshot: {
					resolveScreenshotPath: resolveCentralScreenshotPath,
				},
			},
		},
	},
} as unknown as TestProjectConfiguration

const appConfig = createAppConfig({
	root: import.meta.dirname,
	projectOverrides: {
		browser: browserProjectOverrides,
	},
})

export default mergeConfig(appConfig, {
	resolve: {
		tsconfigPaths: true,
	},
	lint: {
		overrides: [
			{
				files: ['scripts/**'],
				rules: {
					'no-console': 'off',
				},
			},
		],
	},
	nitro: {
		plugins: [validateEnvPlugin],
	},
	staged: {
		'*': 'vp check --fix',
	},
	plugins: [],
})
