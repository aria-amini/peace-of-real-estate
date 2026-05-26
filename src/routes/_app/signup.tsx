import { AuthCard } from '@/components/auth-card'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_app/signup')({
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	component: SignupRoute,
})

function SignupRoute() {
	const search = Route.useSearch()
	return <Signup redirect={search.redirect} />
}

export function Signup({ redirect }: { redirect?: string }) {
	return <AuthCard mode="sign-up" {...(redirect ? { redirect } : {})} />
}
