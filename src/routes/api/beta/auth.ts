import { env } from '@/env'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/beta/auth')({
	server: {
		handlers: {
			POST: async ({ request }: { request: Request }) => {
				const body = await request.json()
				const { password } = body

				const isValid = password === env.BETA_PASSWORD

				const headers: Record<string, string> = {
					'Content-Type': 'application/json',
				}

				if (isValid) {
					headers['Set-Cookie'] =
						'beta_auth=true; Path=/; SameSite=Lax; Max-Age=2592000'
				}

				return new Response(JSON.stringify({ success: isValid }), {
					status: 200,
					headers,
				})
			},
		},
	},
})
