import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { WizardShell } from '@/components/signup/wizard-shell'
import { FlowIntakeProgress } from '@/components/signup/shared'
import { LeaveDialog } from '@/components/signup/leave-dialog'
import { authClient } from '@/lib/auth/client'
import { getCurrentSession } from '@/lib/auth/functions'
import {
	hasCompletedConsumerIntake,
	type ConsumerDraft,
	loadConsumerProfile,
	upsertConsumerProfile,
} from '@/lib/matching/profile'
import { createLocalStorage } from '@/lib/utils/localstorage'
import {
	ConsumerHome,
	ConsumerLocation,
	ConsumerQuiz,
	ConsumerSituation,
} from './-steps'
import { ConsumerPreview, draftToPreviewProfile } from './-steps/step-5-preview'
import {
	consumerFlowSteps,
	stepOrder,
	type ConsumerFlowStep,
} from './-steps/shared'
import { isConsumerQuizComplete } from './-steps/step-4-quiz'

const signupSearchSchema = z.object({
	step: z
		.enum(['intro', 'intent', 'home', 'quiz', 'preview'])
		.default('intro')
		.catch('intro'),
	redirect: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/(app)/consumer/signup/')({
	validateSearch: signupSearchSchema,
	loader: async () => {
		const session = await getCurrentSession()
		if (!session) {
			return { profile: null }
		}

		const profile = await loadConsumerProfile()
		return { profile }
	},
	beforeLoad: async ({ search }) => {
		const validSteps = ['intro', 'intent', 'home', 'quiz', 'preview'] as const
		if (!validSteps.includes(search.step)) {
			throw redirect({ to: '/consumer/signup', search: { step: 'intro' } })
		}

		const session = await getCurrentSession()
		// Anonymous sessions are intentionally not redirected so the user can
		// finish signing up. Only fully authenticated users are sent onward.
		if (session && !session.user.isAnonymous) {
			const profile = await loadConsumerProfile()

			if (hasCompletedConsumerIntake(profile)) {
				throw redirect({ to: '/consumer/dashboard/matches' })
			}
		}
	},
	component: ConsumerSignupRoute,
})

const consumerDraftStorage =
	createLocalStorage<ConsumerDraft>('pre-consumer-draft')

function profileToDraft(
	profile: Awaited<ReturnType<typeof loadConsumerProfile>>,
): ConsumerDraft {
	if (!profile) return {}
	const draft: ConsumerDraft = {}
	for (const [key, value] of Object.entries(profile)) {
		if (
			value !== null &&
			value !== undefined &&
			!['id', 'userId', 'status', 'createdAt', 'updatedAt'].includes(key)
		) {
			draft[key as keyof ConsumerDraft] = value as never
		}
	}
	return draft
}

function ConsumerSignupRoute() {
	const { step } = Route.useSearch()
	const navigate = useNavigate()
	const currentIndex = stepOrder.indexOf(step as ConsumerFlowStep)
	const loaderData = Route.useLoaderData()
	const [state, setState] = useState<ConsumerDraft>(() => {
		const stored = consumerDraftStorage.load()
		const serverDraft = loaderData.profile
			? profileToDraft(loaderData.profile)
			: null
		return { zipCodes: [], ...serverDraft, ...stored }
	})
	const [direction, setDirection] = useState(1)
	const [showLeaveDialog, setShowLeaveDialog] = useState(false)
	const previousIndexRef = useRef(currentIndex)
	const saveProfile = useServerFn(upsertConsumerProfile)

	const hasDraft =
		state.intent !== undefined ||
		state.city !== undefined ||
		state.preferredContactMethod !== undefined

	const ensureAnonymousSession = async () => {
		const session = await authClient.getSession()
		if (session.data) {
			return
		}

		const result = await authClient.signIn.anonymous()
		if (result.error) {
			throw result.error
		}
	}

	const updateState = async (patch: Partial<ConsumerDraft>) => {
		setState((current) => {
			const next = { ...current, ...patch }
			consumerDraftStorage.save(next)
			return next
		})

		try {
			await ensureAnonymousSession()
			await saveProfile({ data: patch })
		} catch (error) {
			console.error('Failed to save draft', error)
		}
	}

	const handleHomeClick = () => {
		if (hasDraft) {
			setShowLeaveDialog(true)
			return
		}
		void navigate({ to: '/' })
	}

	useEffect(() => {
		setDirection(currentIndex >= previousIndexRef.current ? 1 : -1)
		previousIndexRef.current = currentIndex
	}, [currentIndex])

	const goToStep = (nextStep: ConsumerFlowStep) => {
		void navigate({
			to: '/consumer/signup',
			search: { step: nextStep },
		})
	}

	const completedStepIds = consumerFlowSteps
		.filter((stepItem) => {
			switch (stepItem.id) {
				case 'intro':
					return Boolean(state.intent)
				case 'intent':
					return Boolean(state.city && state.state)
				case 'home':
					return (
						Boolean(state.priceRange) &&
						Array.isArray(state.propertyTypes) &&
						state.propertyTypes.length > 0
					)
				case 'quiz':
					return isConsumerQuizComplete(state)
				default:
					return false
			}
		})
		.map((stepItem) => stepItem.id)

	if (step === 'preview') {
		const profile = draftToPreviewProfile(state)
		return (
			<>
				<ConsumerPreview profile={profile} />
				<LeaveDialog
					open={showLeaveDialog}
					onConfirm={() => {
						setShowLeaveDialog(false)
						void navigate({ to: '/' })
					}}
					onOpenChange={setShowLeaveDialog}
				/>
			</>
		)
	}

	const progress = (
		<FlowIntakeProgress steps={consumerFlowSteps} current={step} />
	)

	return (
		<>
			<WizardShell
				steps={consumerFlowSteps}
				currentStepId={step}
				progress={progress}
				onHomeClick={handleHomeClick}
				onStepClick={(nextStep) => goToStep(nextStep as ConsumerFlowStep)}
				completedStepIds={completedStepIds}
			>
				{step === 'intro' ? (
					<ConsumerSituation
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('intent')}
					/>
				) : step === 'intent' ? (
					<ConsumerLocation
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('home')}
					/>
				) : step === 'home' ? (
					<ConsumerHome
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('quiz')}
					/>
				) : (
					<ConsumerQuiz
						state={state}
						direction={direction}
						onUpdate={updateState}
						onComplete={() => goToStep('preview')}
					/>
				)}
			</WizardShell>
			<LeaveDialog
				open={showLeaveDialog}
				onConfirm={() => {
					setShowLeaveDialog(false)
					void navigate({ to: '/' })
				}}
				onOpenChange={setShowLeaveDialog}
			/>
		</>
	)
}
