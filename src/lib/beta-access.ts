import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

export const checkBetaAuthServer = createServerFn({ method: 'GET' }).handler(
	async () => {
		return getCookie('beta_auth') === 'true'
	},
)

export function checkBetaAuthClient(): boolean {
	if (typeof document !== 'undefined') {
		return document.cookie.includes('beta_auth=true')
	}
	return false
}
