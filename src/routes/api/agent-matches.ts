import { listAgentMatches } from '@/lib/matching/matches.server'
import { getCurrentSession } from '@/lib/auth/functions'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/agent-matches')({
	server: {
		handlers: {
			GET: async () => {
				const session = await getCurrentSession()
				const matches = await listAgentMatches(session?.user.id)

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
