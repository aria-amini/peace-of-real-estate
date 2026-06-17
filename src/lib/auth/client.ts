import { createAuthClient } from 'better-auth/react'

const AUTH_PATH = '/api/auth'

function toAuthBaseURL(baseURL: string) {
	const url = new URL(baseURL)
	const pathname = url.pathname.replace(/\/$/, '')

	if (!pathname) {
		url.pathname = AUTH_PATH
	} else if (!pathname.endsWith(AUTH_PATH)) {
		url.pathname = `${pathname}${AUTH_PATH}`
	}

	return url.toString()
}

const authBaseURL =
	typeof window !== 'undefined'
		? toAuthBaseURL(window.location.origin)
		: undefined

export const authClient = createAuthClient({
	baseURL: authBaseURL,
})
