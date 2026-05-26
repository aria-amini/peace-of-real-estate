import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'
import { serverEnv } from './src/env.server'

const databaseUrl = serverEnv.DATABASE_URL

if (!databaseUrl) {
	throw Error('Missing DATABASE_URL')
}

export default defineConfig({
	schema: './src/db/tables.ts',
	out: './src/db/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: databaseUrl,
	},
})
