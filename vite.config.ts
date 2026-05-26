import { createAppConfig } from '@aamini/config/vite'
import { playwright } from 'vite-plus/test/browser-playwright'
import type { Plugin } from 'vite'
import { validateServerEnv } from './src/env.server.ts'
import { mergeConfig } from 'vite-plus'

function validateServerEnvPlugin(): Plugin {
	return {
		name: 'validate-server-env',
		apply: 'build',
		buildStart() {
			validateServerEnv()
		},
	}
}
const appConfig = createAppConfig({
	root: import.meta.dirname,
	projectOverrides: {
		browser: {
			test: {
				setupFiles: ['./tests/setup/styles.ts'],
				browser: {
					provider: playwright(),
				},
			},
		},
	},
})
export default mergeConfig(appConfig, {
	resolve: {
		tsconfigPaths: true,
		alias: [
			{
				find: /^@config\/(.*)$/,
				replacement: '@aamini/config/$1',
			},
		],
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
	plugins: [validateServerEnvPlugin()],
})
