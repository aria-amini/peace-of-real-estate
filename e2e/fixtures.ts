import { test as base } from '@playwright/test'
import { eq } from 'drizzle-orm'

import { getDb } from '@/db/connection'
import { consumerProfiles, user } from '@/db/tables'

export const test = base.extend<{
	cleanupUser: { email: string }
}>({
	cleanupUser: [
		async ({}, use) => {
			const cleanupUserRef = { email: 'test-consumer-signup@example.com' }
			await use(cleanupUserRef)

			const db = getDb()
			const existingUser = await db
				.select({ id: user.id })
				.from(user)
				.where(eq(user.email, cleanupUserRef.email))
				.limit(1)

			if (existingUser[0]) {
				await db
					.delete(consumerProfiles)
					.where(eq(consumerProfiles.userId, existingUser[0].id))
			}

			await db.delete(user).where(eq(user.email, cleanupUserRef.email))
		},
		{ auto: true },
	],
})

export { expect } from '@playwright/test'
