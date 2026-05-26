import { getAuth } from '@/lib/auth'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const getCurrentSession = createServerFn({ method: 'GET' }).handler(() =>
	getAuth().api.getSession({
		headers: getRequestHeaders(),
	}),
)

export async function redirectAuthenticatedUsers() {
	const session = await getCurrentSession()

	if (session) {
		throw redirect({ to: '/match-activity' })
	}
}

export async function redirectUnauthenticatedUsers({
	redirectTo = '/match-activity',
}: {
	redirectTo?: string
} = {}) {
	const session = await getCurrentSession()

	if (!session) {
		throw redirect({ to: '/login', search: { redirect: redirectTo } })
	}

	return { session }
}
