import { getDb } from '@/db/connection'
import { userEntitlements } from '@/db/tables'
import { getCurrentSession } from '@/lib/auth/functions'
import { createServerFn } from '@tanstack/react-start'
import { and, eq, gt, isNull, or } from 'drizzle-orm'

const consumerPremiumKey = 'consumer_lifetime_premium'

export const upgradeToPremium = createServerFn({ method: 'POST' }).handler(
	async () => {
		const session = await getCurrentSession()
		if (!session) {
			throw new Error('Unauthorized')
		}

		const db = getDb()
		const now = new Date()

		await db
			.insert(userEntitlements)
			.values({
				id: crypto.randomUUID(),
				userId: session.user.id,
				key: consumerPremiumKey,
				source: 'manual',
				startsAt: now,
				createdAt: now,
				updatedAt: now,
			})
			.onConflictDoUpdate({
				target: [userEntitlements.userId, userEntitlements.key],
				set: {
					source: 'manual',
					startsAt: now,
					endsAt: null,
					updatedAt: now,
				},
			})

		return { success: true }
	},
)

export const isUserPremium = createServerFn({ method: 'GET' }).handler(
	async () => {
		const session = await getCurrentSession()
		if (!session) {
			return false
		}

		const db = getDb()
		const now = new Date()
		const result = await db
			.select({ id: userEntitlements.id })
			.from(userEntitlements)
			.where(
				and(
					eq(userEntitlements.userId, session.user.id),
					eq(userEntitlements.key, consumerPremiumKey),
					or(isNull(userEntitlements.endsAt), gt(userEntitlements.endsAt, now)),
				),
			)
			.limit(1)

		return result.length > 0
	},
)
