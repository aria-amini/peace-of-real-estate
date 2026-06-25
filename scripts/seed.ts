import { config } from 'dotenv'

const environmentName =
	process.env.APP_ENV === 'staging' ? 'staging' : 'development'

config({
	path: [`.env.${environmentName}.local`, `.env.${environmentName}`],
	override: true,
})

import { serverEnv as env } from '../src/env.server'
import { seedAgents } from './seeds/agents'

// =============================================================================
// Config
// =============================================================================

const AGENT_COUNT = 10000

// =============================================================================
// Entry point
// =============================================================================

async function main() {
	try {
		if (env.APP_ENV === 'production') {
			console.error(
				'Refusing to run seed in production. Use --force to override.',
			)
			process.exit(1)
		}

		await seedAgents(AGENT_COUNT)
	} catch (error) {
		console.error('Seed failed:', error)
		process.exit(1)
	}
}

void main()
