import { vi } from 'vite-plus/test'

const testSession = {
	user: {
		id: 'test-user',
		name: 'Test User',
		email: 'test@example.com',
	},
}

vi.mock('@/lib/auth-guards', () => ({
	getCurrentSession: async () => testSession,
	redirectAuthenticatedUsers: async () => {},
	redirectUnauthenticatedUsers: async () => ({ session: testSession }),
}))

vi.mock('@/lib/beta-auth', () => ({
	checkBetaAuthClient: () => true,
	checkBetaAuthServer: async () => true,
}))
