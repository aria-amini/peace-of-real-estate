import { createAppConfig } from '@aamini/config'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { playwright } from 'vite-plus/test/browser-playwright'

const root = dirname(fileURLToPath(import.meta.url))

export default createAppConfig(root, {
	browser: {
		test: {
			browser: {
				ui: false,
				viewport: {
					width: 1280,
					height: 720,
				},
				provider: playwright({
					contextOptions: {
						viewport: {
							width: 1280,
							height: 1600,
						},
					},
				}),
			},
		},
	},
})
