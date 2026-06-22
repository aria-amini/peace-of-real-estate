import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/agent/priorities')({
	beforeLoad: async () => {
		throw redirect({
			to: '/agent/deep-profile',
			search: { step: 'priorities' },
		})
	},
})
