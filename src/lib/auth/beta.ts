import { createIsomorphicFn, createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

import { serverEnv as env } from '@/env.server'

export const authenticateBeta = createServerFn({ method: 'POST' })
	.validator((data: { password: string }) => data)
	.handler(async ({ data }) => {
		const isValid = data.password === env.BETA_PASSWORD

		if (isValid) {
			setCookie('beta_auth', 'true', {
				path: '/',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30,
			})
		}

		return { success: isValid }
	})

export const hasBetaAccess = createIsomorphicFn()
	.server(() => getCookie('beta_auth') === 'true')
	.client(() => document.cookie.includes('beta_auth=true'))
