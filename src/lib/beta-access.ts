import { createIsomorphicFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

export const hasBetaAccess = createIsomorphicFn()
	.server(() => getCookie('beta_auth') === 'true')
	.client(() => document.cookie.includes('beta_auth=true'))
