import { createEnv } from '@aamini/lib/env'
import { z } from 'zod'

export const env = createEnv(
	z.object({
		DATABASE_URL: z.string().optional(),
		BETA_PASSWORD: z.string().optional(),
		BETTER_AUTH_URL: z.string(),
		BETTER_AUTH_SECRET: z.string().optional(),
		OAUTH_PROXY_SECRET: z.string().optional(),
		GOOGLE_CLIENT_ID: z.string().optional(),
		GOOGLE_CLIENT_SECRET: z.string().optional(),
		AWS_REGION: z.string(),
		AVATAR_BUCKET: z.string().optional(),
		AWS_ENDPOINT_URL: z.string().optional(),
		AWS_ACCESS_KEY_ID: z.string().optional(),
		AWS_SECRET_ACCESS_KEY: z.string().optional(),
	}),
)
