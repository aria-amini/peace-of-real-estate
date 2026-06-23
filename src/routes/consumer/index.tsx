import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/consumer/')({
	beforeLoad: () => {
		throw redirect({ to: '/consumer/signup', search: { step: 'intro' } })
	},
})
