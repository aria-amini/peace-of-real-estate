import { createAppConfig } from '@aamini/config/vite'
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
	plugins: [validateServerEnvPlugin()],
})
