function getSignupFlowKindFromPath(pathname: string) {
	if (pathname === '/buyer' || pathname.startsWith('/buyer/')) return 'buyer'
	if (pathname === '/seller' || pathname.startsWith('/seller/')) return 'seller'
	if (pathname === '/agent' || pathname.startsWith('/agent/')) return 'agent'

	return null
}

export function isSignupFlowPath(pathname: string) {
	return pathname === '/signup' || getSignupFlowKindFromPath(pathname) !== null
}
