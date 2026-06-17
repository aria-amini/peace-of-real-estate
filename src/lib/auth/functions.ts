import { getAuth } from '@/lib/auth'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const getCurrentSession = createServerFn({ method: 'GET' }).handler(() =>
	getAuth().api.getSession({
		headers: getRequestHeaders(),
	}),
)

export const ensureSession = createServerFn({ method: 'GET' }).handler(
	async () => {
		const session = await getAuth().api.getSession({
			headers: getRequestHeaders(),
		})

		if (!session) {
			throw new Error('Unauthorized')
		}

		return session
	},
)

export async function requireUserId(): Promise<string> {
	const session = await ensureSession()

	return session.user.id
}

export async function redirectAuthenticatedUsers() {
	const session = await getCurrentSession()

	if (session) {
		throw redirect({ to: '/matches' })
	}
}

export async function redirectUnauthenticatedUsers({
	redirectTo = '/matches',
}: {
	redirectTo?: string
} = {}) {
	const session = await getCurrentSession()

	if (!session) {
		throw redirect({ to: '/login', search: { redirect: redirectTo } })
	}

	return { session }
}
