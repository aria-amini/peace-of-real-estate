import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentSession } from '@/lib/auth/functions'
import { clearConsumerDraft } from '@/lib/consumer-draft-storage'
import { loadConsumerProfile } from '@/lib/matching/profile.db'

export const Route = createFileRoute('/consumer/')({
	beforeLoad: async ({ search }) => {
		const reset = (search as { reset?: boolean }).reset
		if (reset) {
			clearConsumerDraft()
			const session = await getCurrentSession()
			if (session) {
				const profile = await loadConsumerProfile()
				if (profile) {
					throw redirect({ to: '/matches' })
				}
			}
			throw redirect({ to: '/consumer/intake', search: { step: 'intro' } })
		}

		throw redirect({ to: '/consumer/intake', search: { step: 'intro' } })
	},
})
