import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/agent/deep-dive')({
	beforeLoad: () => {
		throw redirect({ to: '/agent/chat' })
	},
})
