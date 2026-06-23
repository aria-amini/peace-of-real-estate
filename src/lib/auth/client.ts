import { createAuthClient } from 'better-auth/react'

const authBaseURL =
	typeof window !== 'undefined'
		? `${window.location.origin}/api/auth`
		: undefined

export const authClient = createAuthClient({
	baseURL: authBaseURL,
})
