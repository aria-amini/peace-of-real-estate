import { env } from '@/env'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

export function getDb() {
	return drizzle({
		client: new Pool({
			connectionString: env.DATABASE_URL,
		}),
	})
}
