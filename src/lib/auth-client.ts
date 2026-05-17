import { createAuthClient } from 'better-auth/react'

import { toAuthBaseURL } from '@/lib/auth-base-url'

const authBaseURL =
	typeof window !== 'undefined'
		? toAuthBaseURL(window.location.origin)
		: undefined

export const authClient = createAuthClient({
	baseURL: authBaseURL,
})
