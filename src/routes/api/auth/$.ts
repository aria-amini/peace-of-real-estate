import { getAuth } from '@/lib/auth/config'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
	server: {
		handlers: {
			GET: async ({ request }: { request: Request }) => {
				return await getAuth().handler!(request)
			},
			POST: async ({ request }: { request: Request }) => {
				return await getAuth().handler!(request)
			},
		},
	},
})
