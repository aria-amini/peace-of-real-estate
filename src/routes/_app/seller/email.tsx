import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/seller/email')({
	beforeLoad: () => {
		throw redirect({ to: '/seller/details' })
	},
})
