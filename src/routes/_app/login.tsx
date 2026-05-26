import { AuthCard } from '@/components/auth-card'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_app/login')({
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	component: LoginRoute,
})

function LoginRoute() {
	const search = Route.useSearch()
	return <Login redirect={search.redirect} />
}

export function Login({ redirect }: { redirect?: string }) {
	return <AuthCard mode="sign-in" {...(redirect ? { redirect } : {})} />
}
