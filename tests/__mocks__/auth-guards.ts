export async function redirectAuthenticatedUsers() {}

export async function redirectUnauthenticatedUsers() {
	return { session: null }
}
