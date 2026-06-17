import { AuthCard } from '@/components/auth-card'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_app/signup')({
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	beforeLoad: async () => {
		throw redirect({ to: '/matches' })
	},
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
