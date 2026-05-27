import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { resolve } from 'node:path'
import { test as baseTest } from 'vite-plus/test'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { drizzle } from 'drizzle-orm/node-postgres'
import { reset } from 'drizzle-seed'
import { Wait } from 'testcontainers'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { startMswServer } from './msw-server'

const DEFAULT_SCHEMA_PATH = 'src/db/tables.ts'
const DEFAULT_MIGRATIONS_PATH = 'src/db/migrations'
const DEFAULT_IMAGE = 'postgres:17'
const DEFAULT_EXTENSIONS = ['pg_trgm']

export interface DbConfig {
	schemaPath?: string
	migrationsPath?: string
	postgresImage?: string
}

export type Database = NodePgDatabase & {
	$client: Pool
}

let dbConfig: DbConfig = {}
let seedFunction: (db: Database) => Promise<void> | void = async () => {}

export const test = baseTest
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
	.extend('seedFunction', { scope: 'file' }, () => seedFunction)
	.extend('db', { scope: 'file' }, async ({ seedFunction }, { onCleanup }) => {
		const schemaPath = resolve(
			process.cwd(),
			dbConfig.schemaPath ?? DEFAULT_SCHEMA_PATH,
		)
		const migrationsFolder = resolve(
			process.cwd(),
			dbConfig.migrationsPath ?? DEFAULT_MIGRATIONS_PATH,
		)
		const container = await new PostgreSqlContainer(
			dbConfig.postgresImage ?? DEFAULT_IMAGE,
		)
			.withWaitStrategy(Wait.forHealthCheck())
			.start()
		const client = new Pool({
			connectionString: container.getConnectionUri(),
		})
		const db = Object.assign(drizzle({ client }), { $client: client })
		let cleanedUp = false
		const cleanup = async () => {
			if (cleanedUp) return
			cleanedUp = true
			await db.$client.end()
			await container.stop()
		}
		onCleanup(cleanup)

		try {
			await seedDatabase(db, { schemaPath, migrationsFolder, seedFunction })
		} catch (error) {
			await cleanup()
			throw error
		}

		return db
	})

export { afterEach, beforeEach, describe, expect, vi } from 'vite-plus/test'

export function initDb(
	seed: (db: Database) => Promise<void> | void,
	config: DbConfig = {},
) {
	dbConfig = config
	seedFunction = seed
}

export interface SeedDatabaseOptions {
	schemaPath: string
	migrationsFolder: string
	seedFunction?: (db: Database) => Promise<void> | void
	extensions?: string[]
}

export async function seedDatabase(
	db: Database,
	{
		schemaPath,
		migrationsFolder,
		seedFunction,
		extensions = DEFAULT_EXTENSIONS,
	}: SeedDatabaseOptions,
) {
	const schema = await import(/* @vite-ignore */ schemaPath)

	for (const ext of extensions) {
		await db.execute(`CREATE EXTENSION IF NOT EXISTS "${ext}"`)
	}
	await migrate(db, { migrationsFolder })
	await reset(db, schema)
	if (seedFunction) await seedFunction(db)
}
