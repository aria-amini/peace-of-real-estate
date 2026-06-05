import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/agent/deep-dive')({
	beforeLoad: () => {
		throw redirect({ to: '/agent/chat' })
	},
})
