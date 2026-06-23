import { getDb } from '@/db/connection'
import { account, session, user, verification } from '@/db/tables'
import { serverEnv as env } from '@/env.server'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { createAuthMiddleware } from 'better-auth/api'
import { Auth, betterAuth } from 'better-auth'
import { oAuthProxy } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export function getAuth(): Auth {
	const betterAuthUrl = env.BETTER_AUTH_URL
	const betterAuthSecret = env.BETTER_AUTH_SECRET
	const googleClientId = env.GOOGLE_CLIENT_ID
	const googleClientSecret = env.GOOGLE_CLIENT_SECRET

	const localAuthEnabled =
		import.meta.env.DEV ||
		(betterAuthUrl ? new URL(betterAuthUrl).hostname === 'localhost' || new URL(betterAuthUrl).hostname === '127.0.0.1' : false)

	const productionAppOrigin = betterAuthUrl
		? new URL(betterAuthUrl).origin
		: undefined

	return betterAuth({
		appName: 'Peace of Real Estate',
		baseURL: {
			allowedHosts: [
				'127.0.0.1:*',
				'localhost:*',
				'peace-of-real-estate-production.up.railway.app',
				'peace-of-real-estate-*.up.railway.app',
				'peace-of-real-estate-projects-*.up.railway.app',
			],
			protocol: 'auto' as const,
			fallback:
				(betterAuthUrl ? `${new URL(betterAuthUrl).origin}/api/auth` : undefined) ??
				(localAuthEnabled ? 'http://localhost:3000/api/auth' : undefined),
		},
		trustedOrigins: [
			'http://127.0.0.1:*',
			'http://localhost:*',
			'https://peaceofrealestate.com',
			'https://www.peaceofrealestate.com',
			'https://peace-of-real-estate-production.up.railway.app',
			'https://peace-of-real-estate-*.up.railway.app',
			'https://peace-of-real-estate-projects-*.up.railway.app',
		],
		secret: betterAuthSecret,
		database: drizzleAdapter(getDb(), {
			provider: 'pg',
			schema: {
				account,
				session,
				user,
				verification,
			},
		}),
		emailAndPassword: {
			enabled: true,
			autoSignIn: true,
		},
		socialProviders:
		{
			google: {
				clientId: googleClientId,
				clientSecret: googleClientSecret,
			},
		},
		plugins: [
			{
				id: 'forwarded-host-oauth-shim',
				hooks: {
					before: [
						{
							matcher(context: { path?: string }) {
								return !!(
									context.path?.startsWith('/sign-in/social') ||
									context.path?.startsWith('/sign-in/oauth2')
								)
							},
							handler: createAuthMiddleware(async (ctx) => {
								if (!ctx.request) {
									return
								}

								const forwardedHost = ctx.request.headers
									.get('x-forwarded-host')
									?.split(',')[0]
									?.trim()
								const host = ctx.request.headers
									.get('host')
									?.split(',')[0]
									?.trim()
								const resolvedHost = forwardedHost || host

								if (!resolvedHost) {
									return
								}

								const forwardedProto = ctx.request.headers
									.get('x-forwarded-proto')
									?.split(',')[0]
									?.trim()
								const protocol =
									forwardedProto ||
									(resolvedHost.startsWith('localhost') ||
										resolvedHost.startsWith('127.0.0.1')
										? 'http'
										: 'https')

								const forwardedOrigin = `${protocol}://${resolvedHost}`
								const requestURL = new URL(ctx.request.url)
								const forwardedURL = new URL(
									requestURL.pathname + requestURL.search,
									forwardedOrigin,
								)

								if (forwardedURL.origin === requestURL.origin) {
									return
								}

								ctx.request = new Proxy(ctx.request, {
									get(target, prop, receiver) {
										if (prop === 'url') {
											return forwardedURL.toString()
										}

										return Reflect.get(target, prop, receiver)
									},
								}) as Request
							}),
						},
					],
				},
			},
			...(productionAppOrigin
				? [
					oAuthProxy({
						productionURL: productionAppOrigin,
						secret: betterAuthSecret,
					}),
				]
				: []),
			tanstackStartCookies(),
		],
	})
}

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
