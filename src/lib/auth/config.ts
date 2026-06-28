import { db } from '@/db/connection'
import {
	account,
	consumerProfiles,
	session,
	user,
	verification,
} from '@/db/tables'
import { serverEnv as env } from '@/env.server'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'
import { anonymous, oAuthProxy } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { eq } from 'drizzle-orm'

const appOrigin = new URL(env.BETTER_AUTH_URL).origin

async function transferConsumerProfile(
	anonymousUserId: string,
	newUserId: string,
) {
	const now = new Date()

	const existingProfile = await db
		.select({ id: consumerProfiles.id })
		.from(consumerProfiles)
		.where(eq(consumerProfiles.userId, newUserId))
		.limit(1)

	if (existingProfile[0]) {
		await db
			.delete(consumerProfiles)
			.where(eq(consumerProfiles.userId, anonymousUserId))
		return
	}

	await db
		.update(consumerProfiles)
		.set({ userId: newUserId, status: 'active', updatedAt: now })
		.where(eq(consumerProfiles.userId, anonymousUserId))
}

export function getAuth() {
	return betterAuth({
		appName: 'Peace of Real Estate',
		baseURL: {
			allowedHosts: [
				'127.0.0.1:*',
				'localhost:*',
				'peaceofrealestate.com',
				'www.peaceofrealestate.com',
				'peace-of-real-estate-*.up.railway.app',
			],
			protocol: 'auto',
			fallback: appOrigin,
		},
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(db, {
			provider: 'pg',
			schema: { account, session, user, verification },
		}),
		emailAndPassword: {
			enabled: true,
			autoSignIn: true,
		},
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
		plugins: [
			anonymous({
				emailDomainName: 'anonymous.peaceofrealestate.com',
				generateName: () => 'Anonymous User',
				onLinkAccount: async ({ anonymousUser, newUser }) => {
					await transferConsumerProfile(anonymousUser.user.id, newUser.user.id)
				},
			}),
			oAuthProxy({
				productionURL: appOrigin,
				secret: env.BETTER_AUTH_SECRET,
			}),
			tanstackStartCookies(),
		],
	})
}
