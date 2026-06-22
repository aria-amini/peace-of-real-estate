import { AuthCard } from '@/components/auth-card'
import { redirectAuthenticatedUsers } from '@/lib/auth/functions'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/signup')({
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	beforeLoad: redirectAuthenticatedUsers,
	component: SignupRoute,
})

function SignupRoute() {
	const search = Route.useSearch()
	return (
		<AuthCard
			mode="sign-up"
			{...(search.redirect ? { redirect: search.redirect } : {})}
		/>
	)
}
