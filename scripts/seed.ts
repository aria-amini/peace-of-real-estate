import { serverEnv as env } from '../src/env.server'
import { seedAgents } from './seeds/agents'

// =============================================================================
// Config
// =============================================================================

const DEFAULT_AGENT_COUNT = 200
const MAX_AGENT_COUNT = 1000

// =============================================================================
// Entry point
// =============================================================================

function getAgentCount(): number {
	const requestedCount = process.argv[2]
		? parseInt(process.argv[2], 10)
		: DEFAULT_AGENT_COUNT
	return Number.isFinite(requestedCount) && requestedCount > 0
		? Math.min(requestedCount, MAX_AGENT_COUNT)
		: DEFAULT_AGENT_COUNT
}

async function main() {
	try {
		if (env.APP_ENV === 'production') {
			console.error(
				'Refusing to run seed in production. Use --force to override.',
			)
			process.exit(1)
		}

		const count = getAgentCount()
		await seedAgents(count)
	} catch (error) {
		console.error('Seed failed:', error)
		process.exit(1)
	}
}

void main()
