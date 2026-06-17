import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { getCurrentSession } from '@/lib/auth/functions'
import {
	clearStoredConsumerDraftForFlow,
	getStoredConsumerDraftForFlow,
} from '@/lib/matching/intake-draft'
import { saveUserSettings } from '@/lib/matching/settings'

export const Route = createFileRoute('/_app/buyer/complete-profile')({
	beforeLoad: async () => {
		const session = await getCurrentSession()
		if (!session) {
			throw redirect({ to: '/buyer/preview' })
		}
	},
	component: CompleteBuyerProfile,
})

function CompleteBuyerProfile() {
	const navigate = useNavigate()
	const [message, setMessage] = useState('Creating your buyer profile...')
	const hasStartedRef = useRef(false)

	useEffect(() => {
		if (hasStartedRef.current) return

		hasStartedRef.current = true

		async function completeProfile() {
			const draft = getStoredConsumerDraftForFlow('buyer')
			const hasAnswers = Object.keys(draft.answers ?? {}).length > 0

			if (!hasAnswers) {
				await navigate({ to: '/buyer/intake', search: { step: 'intro' } })
				return
			}

			try {
				await saveUserSettings(draft)
				clearStoredConsumerDraftForFlow('buyer')
				setMessage('Profile created. Loading your matches...')
				await navigate({ to: '/matches' })
			} catch (error) {
				console.error('Could not create buyer profile', error)
				toast.error('Could not create your profile. Try again.')
				setMessage('We could not create your profile. Returning to preview...')
				await navigate({ to: '/buyer/preview' })
			}
		}

		void completeProfile()
	}, [navigate])

	return (
		<div className="flex min-h-dvh items-center justify-center px-6 text-center">
			<div className="space-y-4">
				<Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
				<p className="text-muted-foreground text-sm">{message}</p>
			</div>
		</div>
	)
}
