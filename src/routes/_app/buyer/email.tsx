import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/buyer/email')({
	beforeLoad: () => {
		throw redirect({ to: '/buyer/details' })
	},
})
