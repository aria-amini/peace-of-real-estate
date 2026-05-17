import { AuthCard } from '@/components/auth-card'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/login')({
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	component: Login,
})

function Login() {
	const search = Route.useSearch()

	return (
		<AuthCard
			mode="sign-in"
			{...(search.redirect ? { redirect: search.redirect } : {})}
		/>
	)
}
