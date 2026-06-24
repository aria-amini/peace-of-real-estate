import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getAuth } from './config'

export const getCurrentSession = createServerFn({ method: 'GET' }).handler(() =>
	getAuth().api.getSession({
		headers: getRequestHeaders(),
	}),
)

export async function requireUserId(): Promise<string> {
	const session = await getCurrentSession()

	if (!session) {
		throw new Error('Unauthorized')
	}

	return session.user.id
}

export async function redirectAuthenticatedUsers() {
	const session = await getCurrentSession()

	if (session) {
		throw redirect({ to: '/consumer/dashboard' })
	}
}

export async function redirectUnauthenticatedUsers({
	redirectTo = '/consumer/dashboard/matches',
}: {
	redirectTo?: string
} = {}) {
	const session = await getCurrentSession()

	if (!session) {
		throw redirect({ to: '/login', search: { redirect: redirectTo } })
	}

	return session
}
