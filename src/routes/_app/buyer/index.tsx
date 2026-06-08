import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/buyer/')({
	beforeLoad: () => {
		throw redirect({ to: '/buyer/intro' })
	},
})
