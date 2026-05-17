const AUTH_PATH = '/api/auth'

export function toAuthBaseURL(baseURL: string) {
	const url = new URL(baseURL)
	const pathname = url.pathname.replace(/\/$/, '')

	if (!pathname) {
		url.pathname = AUTH_PATH
	} else if (!pathname.endsWith(AUTH_PATH)) {
		url.pathname = `${pathname}${AUTH_PATH}`
	}

	return url.toString()
}
