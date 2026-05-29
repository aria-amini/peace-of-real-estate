import { vi } from 'vite-plus/test'

type MockSession = unknown

const authState = vi.hoisted(() => ({
	session: null as MockSession,
}))

export function setMockSession(session: MockSession) {
	authState.session = session
}

vi.mock('@/lib/auth-client', () => ({
	authClient: {
		useSession: () => ({ data: authState.session, isPending: false }),
		signIn: {
			email: vi.fn(),
			social: vi.fn(),
		},
		signUp: {
			email: vi.fn(),
		},
		signOut: vi.fn(),
	},
}))

vi.mock('@/lib/auth-guards', () => ({
	getCurrentSession: () => authState.session,
	isUserPremium: () => false,
	upgradeToPremium: () => ({ success: true }),
	redirectAuthenticatedUsers: () => undefined,
	redirectUnauthenticatedUsers: () => ({ session: authState.session }),
}))

vi.mock('@/lib/beta-auth', () => ({
	checkBetaAuthClient: () => true,
	checkBetaAuthServer: async () => true,
}))

vi.mock('@/routes/__root', async () => {
	const React = await import('react')
	const { Outlet, createRootRouteWithContext } =
		await import('@tanstack/react-router')

	return {
		Route: createRootRouteWithContext()({
			component: () => React.createElement(Outlet),
		}),
	}
})

vi.mock('@/lib/agent-matches', () => ({
	getAgentMatches: () =>
		Promise.resolve([
			{
				id: 'agent-1',
				name: 'Sarah Chen',
				role: 'agent',
				location: 'Austin, TX',
				zipCodes: ['78701'],
				fitScore: 96,
				status: 'new',
				date: '2026-04-21',
				experience: '12 years',
				agency: 'Horizon Realty Group',
				specialties: ['First-time buyers', 'Luxury homes'],
				about: 'Known for patient guidance and transparent communication.',
				scores: {
					'Working Style': 4.9,
					Communication: 4.7,
					Transparency: 4.8,
					Fit: 4.9,
				},
				isTopMatch: true,
			},
		]),
}))

vi.mock('@/components/wavy-background', () => ({
	WavyBackground: () => null,
}))
