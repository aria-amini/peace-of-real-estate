import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/consumer/')({
	beforeLoad: () => {
		throw redirect({ to: '/consumer/signup', search: { step: 'intro' } })
	},
})
