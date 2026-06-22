import { listAgentMatches } from '@/lib/matching/server'
import { getCurrentSession } from '@/lib/auth/functions'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/agent-matches')({
	server: {
		handlers: {
			GET: async () => {
				const session = await getCurrentSession()
				if (!session?.user.id) {
					return new Response(JSON.stringify({ error: 'Unauthorized' }), {
						status: 401,
						headers: { 'Content-Type': 'application/json' },
					})
				}
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
