import { redirectAuthenticatedUsers } from '@/lib/auth-guards'
import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/components/landing-page'

export const Route = createFileRoute('/_app/')({
	beforeLoad: redirectAuthenticatedUsers,
	component: LandingPage,
})
