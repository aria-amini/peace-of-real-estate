import { AuthCard } from '@/components/auth/card'
import { redirectAuthenticatedUsers } from '@/lib/auth/functions'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/(app)/login')({
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	beforeLoad: redirectAuthenticatedUsers,
	component: LoginRoute,
})

function LoginRoute() {
	const search = Route.useSearch()
	return <Login {...(search.redirect ? { redirect: search.redirect } : {})} />
}

export function Login({ redirect }: { redirect?: string }) {
	return <AuthCard mode="sign-in" {...(redirect ? { redirect } : {})} />
}
