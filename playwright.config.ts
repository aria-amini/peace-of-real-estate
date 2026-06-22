import { baseConfig } from '@aamini/config/playwright'
import { defineConfig } from '@playwright/test'

export default defineConfig(
	await baseConfig({
		webServer: {
			command:
				'BETA_PASSWORD=test123 DATABASE_URL=postgresql://peace_user:peace_test@127.0.0.1:5433/peace_of_real_estate_test?sslmode=disable vp build && BETA_PASSWORD=test123 DATABASE_URL=postgresql://peace_user:peace_test@127.0.0.1:5433/peace_of_real_estate_test?sslmode=disable vp preview --port 3333',
			url: 'http://localhost:3333',
			reuseExistingServer: !process.env.CI,
			timeout: 180 * 1000,
		},
		use: {
			baseURL: 'http://localhost:3333',
		},
	}),
)
