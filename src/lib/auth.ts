import { getDb } from '@/db/connection'
import { account, session, user, verification } from '@/db/tables'
import { env } from '@/env'

import { toAuthBaseURL } from '@/lib/auth-base-url'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { createAuthMiddleware } from 'better-auth/api'
import { betterAuth } from 'better-auth'
import { oAuthProxy } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

let authInstance: ReturnType<typeof betterAuth> | undefined

function resolveForwardedOrigin(request: Request) {
	const forwardedHost = request.headers
		.get('x-forwarded-host')
		?.split(',')[0]
		?.trim()
	const host = request.headers.get('host')?.split(',')[0]?.trim()
	const resolvedHost = forwardedHost || host

	if (!resolvedHost) {
		return null
	}

	const forwardedProto = request.headers
		.get('x-forwarded-proto')
		?.split(',')[0]
		?.trim()
	const protocol =
		forwardedProto ||
		(resolvedHost.startsWith('localhost') ||
		resolvedHost.startsWith('127.0.0.1')
			? 'http'
			: 'https')

	return `${protocol}://${resolvedHost}`
}

function forwardedHostOAuthShim() {
	return {
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

						const forwardedOrigin = resolveForwardedOrigin(ctx.request)

						if (!forwardedOrigin) {
							return
						}

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
	}
}

export function getAuth() {
	if (!authInstance) {
		const betterAuthUrl = env.BETTER_AUTH_URL
		const betterAuthSecret = env.BETTER_AUTH_SECRET
		const oAuthProxySecret = env.OAUTH_PROXY_SECRET ?? betterAuthSecret
		const googleClientId = env.GOOGLE_CLIENT_ID
		const googleClientSecret = env.GOOGLE_CLIENT_SECRET

		const productionAppOrigin = betterAuthUrl
			? new URL(betterAuthUrl).origin
			: undefined

		const authBaseURL = {
			allowedHosts: [
				'127.0.0.1:*',
				'localhost:*',
				'peace-of-real-estate-production.up.railway.app',
				'peace-of-real-estate-*.up.railway.app',
				'peace-of-real-estate-projects-*.up.railway.app',
			],
			protocol: 'auto' as const,
			fallback:
				(betterAuthUrl ? toAuthBaseURL(betterAuthUrl) : undefined) ??
				'http://localhost:3000/api/auth',
		}
		const trustedOrigins = [
			'http://127.0.0.1:*',
			'http://localhost:*',
			'https://peaceofrealestate.com',
			'https://www.peaceofrealestate.com',
			'https://peace-of-real-estate-production.up.railway.app',
			'https://peace-of-real-estate-*.up.railway.app',
			'https://peace-of-real-estate-projects-*.up.railway.app',
		]

		authInstance = betterAuth({
			appName: 'Peace of Real Estate',
			baseURL: authBaseURL,
			trustedOrigins,
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
				googleClientId && googleClientSecret
					? {
							google: {
								clientId: googleClientId,
								clientSecret: googleClientSecret,
							},
						}
					: undefined,
			plugins: [
				tanstackStartCookies(),
				forwardedHostOAuthShim(),
				...(productionAppOrigin
					? [
							oAuthProxy({
								productionURL: productionAppOrigin,
								secret: oAuthProxySecret,
							}),
						]
					: []),
			],
		}) as unknown as ReturnType<typeof betterAuth>
	}

	return authInstance
}
