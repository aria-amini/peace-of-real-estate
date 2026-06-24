import { createAuthClient } from 'better-auth/react'
import { createIsomorphicFn } from '@tanstack/react-start'

const getAuthBaseURL = createIsomorphicFn()
	.server(() => undefined)
	.client(() => `${window.location.origin}/api/auth`)

export const authClient = createAuthClient({
	baseURL: getAuthBaseURL(),
})
