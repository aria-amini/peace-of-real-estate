import { setupServer, type SetupServer } from 'msw/node'
import { resolve } from 'node:path'
import { test as baseTest } from 'vite-plus/test'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { Pool } from 'pg'

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

export interface DbFixture {
	server: SetupServer
	_cleanup: void
	db: Database
	seedFunction: (db: Database) => Promise<void> | void
}

let dbConfig: DbConfig = {}
let mswServer: SetupServer | undefined
let seedFunction: (db: Database) => Promise<void> | void = async () => {}

async function ensureMswServer(): Promise<SetupServer> {
	if (!mswServer) {
		const { default: handlers } = await import('@/mocks/handlers')
		mswServer = setupServer(...handlers)
	}
	return mswServer
}

export const test = baseTest.extend<DbFixture>({
	server: [
		async ({}, use) => {
			const server = await ensureMswServer()
			server.listen({ onUnhandledRequest: 'bypass' })
			await use(server)
			server.close()
		},
		{ auto: true, scope: 'worker' },
	],
	_cleanup: [
		async ({ server }, use) => {
			await use()
			server.resetHandlers()
		},
		{ auto: true },
	],
	seedFunction: [async ({}, use) => use(seedFunction), { scope: 'file' }],
	db: [
		async ({ seedFunction }, use) => {
			const { PostgreSqlContainer } = await import('@testcontainers/postgresql')
			const { drizzle } = await import('drizzle-orm/node-postgres')
			const { Wait } = await import('testcontainers')
			const { Pool } = await import('pg')
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

			try {
				await seedDatabase(db, { schemaPath, migrationsFolder, seedFunction })
				await use(db)
			} finally {
				await db.$client.end()
				await container.stop()
			}
		},
		{ scope: 'file' },
	],
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
	const { migrate } = await import('drizzle-orm/node-postgres/migrator')
	const { reset } = await import('drizzle-seed')
	const schema = await import(/* @vite-ignore */ schemaPath)

	for (const ext of extensions) {
		await db.execute(`CREATE EXTENSION IF NOT EXISTS "${ext}"`)
	}
	await migrate(db, { migrationsFolder })
	await reset(db, schema)
	if (seedFunction) await seedFunction(db)
}
