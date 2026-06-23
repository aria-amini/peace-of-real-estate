import { setupServer, type SetupServer } from 'msw/node'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { test as baseTest } from 'vite-plus/test'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { Pool } from 'pg'

const DEFAULT_SCHEMA_PATH = 'src/db/tables.ts'
const DEFAULT_IMAGE = 'postgres:17'
const DEFAULT_EXTENSIONS = ['pg_trgm']
const ROOT_MARKERS = [
	'vite.config.ts',
	'vite.config.mts',
	'vite.config.js',
	'vite.config.mjs',
	'vitest.config.ts',
	'vitest.config.mts',
	'vitest.config.js',
	'vitest.config.mjs',
]

export interface DbConfig {
	root?: string
	schemaPath?: string
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
		const { default: handlers } = await import('@test/handlers')
		mswServer = setupServer(...handlers)
	}
	return mswServer
}

function findProjectRoot(start = process.cwd()) {
	let directory = start

	while (true) {
		if (ROOT_MARKERS.some((marker) => existsSync(resolve(directory, marker)))) {
			return directory
		}

		const parent = dirname(directory)
		if (parent === directory) return start
		directory = parent
	}
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
			const root = dbConfig.root ?? findProjectRoot()
			const schemaPath = resolve(
				root,
				dbConfig.schemaPath ?? DEFAULT_SCHEMA_PATH,
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
				await seedDatabase(db, { schemaPath, seedFunction })
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
	seedFunction?: (db: Database) => Promise<void> | void
	extensions?: string[]
}

export async function seedDatabase(
	db: Database,
	{
		schemaPath,
		seedFunction,
		extensions = DEFAULT_EXTENSIONS,
	}: SeedDatabaseOptions,
) {
	const { pushSchema } = await import('drizzle-kit/api')
	const { reset } = await import('drizzle-seed')
	const schema = await import(/* @vite-ignore */ schemaPath)

	for (const ext of extensions) {
		await db.execute(`CREATE EXTENSION IF NOT EXISTS "${ext}"`)
	}
	await (await pushSchema(schema, db)).apply()
	await reset(db, schema)
	if (seedFunction) await seedFunction(db)
}
