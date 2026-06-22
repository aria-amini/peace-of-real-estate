import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/agent/quiz')({
	beforeLoad: () => {
		throw redirect({ to: '/agent/intake', search: { step: 'welcome' } })
	},
})
