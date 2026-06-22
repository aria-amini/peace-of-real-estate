import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
	clearConsumerDraft,
	loadConsumerDraft,
} from '@/lib/consumer-draft-storage'
import { createConsumerProfileFromDraft } from '@/lib/consumer-profile/create-from-draft'
import { getCurrentSession } from '@/lib/auth/functions'

export const Route = createFileRoute('/consumer/complete-profile')({
	ssr: false,
	beforeLoad: async () => {
		const session = await getCurrentSession()

		if (!session) {
			throw redirect({
				to: '/login',
				search: { redirect: '/consumer/complete-profile' },
			})
		}
	},
	component: CompleteProfileRoute,
})

function CompleteProfileRoute() {
	const navigate = useNavigate()
	const createProfile = useServerFn(createConsumerProfileFromDraft)
	const [message, setMessage] = useState('Saving your profile...')

	useEffect(() => {
		let cancelled = false

		async function completeProfile() {
			try {
				const draft = loadConsumerDraft()

				if (draft) {
					await createProfile({ data: draft })
					clearConsumerDraft()
				}

				if (!cancelled) {
					await navigate({ to: '/matches' })
				}
			} catch (error) {
				console.error('Unable to complete consumer profile', error)
				if (!cancelled) {
					setMessage(
						'We could not save your profile. Sending you back to review it.',
					)
					toast.error('Unable to save your profile. Try again.')
					await navigate({ to: '/consumer/preview' })
				}
			}
		}

		void completeProfile()

		return () => {
			cancelled = true
		}
	}, [createProfile, navigate])

	return (
		<div className="bg-primary flex min-h-dvh items-center justify-center px-6 text-white">
			<div className="space-y-4 text-center">
				<Loader2 className="mx-auto h-8 w-8 animate-spin text-white/80" />
				<p className="font-heading text-2xl font-semibold">{message}</p>
			</div>
		</div>
	)
}
