import { listAgentMatches } from '@/lib/agent-matches.server'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/agent-matches')({
	server: {
		handlers: {
			GET: async () => {
				const matches = await listAgentMatches()

				return new Response(JSON.stringify(matches), {
					status: 200,
					headers: {
						'Content-Type': 'application/json',
					},
				})
			},
		},
	},
})
