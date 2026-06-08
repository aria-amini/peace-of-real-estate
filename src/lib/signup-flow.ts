export type SignupFlowKind = 'buyer' | 'seller' | 'agent'

export type SignupFlowStep = {
	label: string
	path: string
}

export const signupFlowSteps = {
	buyer: [
		{ label: 'Basic Information', path: 'intro' },
		{ label: 'Quiz', path: 'quiz' },
		{ label: 'Matches', path: 'preview' },
	],
	seller: [
		{ label: 'Basic Information', path: 'intro' },
		{ label: 'Quiz', path: 'quiz' },
		{ label: 'Matches', path: 'preview' },
	],
	agent: [
		{ label: 'Priorities', path: 'priorities' },
		{ label: 'Quiz', path: 'quiz' },
		{ label: 'Profile', path: 'profile' },
		{ label: 'Compliance', path: 'compliance' },
		{ label: 'Peace Pact', path: 'peace-pact' },
		{ label: 'Description', path: 'chat' },
		{ label: 'Subscribe', path: 'subscribe' },
	],
} satisfies Record<SignupFlowKind, SignupFlowStep[]>

export function getSignupFlowKindFromPath(pathname: string) {
	if (pathname === '/buyer' || pathname.startsWith('/buyer/')) return 'buyer'
	if (pathname === '/seller' || pathname.startsWith('/seller/')) return 'seller'
	if (pathname === '/agent' || pathname.startsWith('/agent/')) return 'agent'

	return null
}

export function isSignupFlowPath(pathname: string) {
	return pathname === '/signup' || getSignupFlowKindFromPath(pathname) !== null
}
