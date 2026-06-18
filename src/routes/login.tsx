import { AuthCard } from '@/components/auth-card'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/login')({
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	beforeLoad: async () => {
		throw redirect({ to: '/matches' })
	},
	component: LoginRoute,
})

function LoginRoute() {
	const search = Route.useSearch()
	return <Login {...(search.redirect ? { redirect: search.redirect } : {})} />
}

export function Login({ redirect }: { redirect?: string }) {
	return <AuthCard mode="sign-in" {...(redirect ? { redirect } : {})} />
}
