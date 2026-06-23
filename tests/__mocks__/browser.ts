import { vi } from 'vite-plus/test'

type MockSession = unknown

const authState = vi.hoisted(() => ({
	session: null as MockSession,
}))

export function setMockSession(session: MockSession) {
	authState.session = session
}

vi.mock('@/lib/auth/client', () => ({
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

vi.mock('@/lib/auth/functions', () => ({
	getCurrentSession: () => authState.session,
	redirectAuthenticatedUsers: () => undefined,
	redirectUnauthenticatedUsers: () => ({ session: authState.session }),
}))

vi.mock('@/lib/premium', () => ({
	isUserPremium: () => false,
	upgradeToPremium: () => ({ success: true }),
}))

vi.mock('@/lib/auth/beta', () => ({
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

const mockMatches = [
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
]

vi.mock('@/lib/matching/server', () => ({
	loadAgentMatches: () => Promise.resolve(mockMatches),
}))

vi.mock('@/lib/matching/profile', async () => {
	const actual = await vi.importActual<typeof import('@/lib/matching/profile')>(
		'@/lib/matching/profile',
	)
	return {
		...actual,
		loadConsumerProfile: () =>
			Promise.resolve({
				id: 'consumer-1',
				userId: 'user-1',
				status: 'draft',
				intent: 'buying',
				location: 'Austin, TX',
				state: 'TX',
				priceRange: '400000-750000',
				propertyTypes: ['singleFamily'],
				experienceLevel: 'firstTime',
				preferredContactMethod: 'text',
				involvementLevel: 'veryInvolved',
				representationPreference: 'exclusive',
				commissionComfort: 'explain',
				matchPriorities: null,
				matchDetails: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		saveConsumerProfile: () => Promise.resolve(),
		loadAgentProfile: () => Promise.resolve(null),
		saveAgentProfile: () => Promise.resolve(),
		saveAgentEssentials: () => Promise.resolve(),
	}
})

vi.mock('@/lib/matching/questions', async () => {
	const actual = await vi.importActual<
		typeof import('@/lib/matching/questions')
	>('@/lib/matching/questions')
	return {
		...actual,
		getAnswerSummary: (
			question: { options?: Record<string, string> },
			answer: unknown,
		) => {
			if (typeof answer === 'string')
				return question.options?.[answer] ?? 'Not answered'
			if (Array.isArray(answer)) {
				return answer
					.map((index) => question.options?.[index])
					.filter(Boolean)
					.join(', ')
			}
			return typeof answer === 'string' ? answer : 'Not answered'
		},
	}
})
