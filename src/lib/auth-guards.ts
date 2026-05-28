import { getDb } from '@/db/connection'
import { user } from '@/db/tables'
import { getAuth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const getCurrentSession = createServerFn({ method: 'GET' }).handler(() =>
	getAuth().api.getSession({
		headers: getRequestHeaders(),
	}),
)

export const upgradeToPremium = createServerFn({ method: 'POST' }).handler(
	async () => {
		const session = await getAuth().api.getSession({
			headers: getRequestHeaders(),
		})
		if (!session) {
			throw new Error('Unauthorized')
		}
		const db = getDb()
		await db
			.update(user)
			.set({ isPremium: true })
			.where(eq(user.id, session.user.id))
		return { success: true }
	},
)

export const isUserPremium = createServerFn({ method: 'GET' }).handler(
	async () => {
		const session = await getAuth().api.getSession({
			headers: getRequestHeaders(),
		})
		if (!session) return false
		const db = getDb()
		const result = await db
			.select({ isPremium: user.isPremium })
			.from(user)
			.where(eq(user.id, session.user.id))
			.limit(1)
		return result[0]?.isPremium ?? false
	},
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
