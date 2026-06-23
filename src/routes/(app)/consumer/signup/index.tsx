import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import { WizardShell } from '@/components/signup/wizard-shell'
import { FlowIntakeProgress } from '@/components/signup/shared'
import { LeaveDialog } from '@/components/signup/leave-dialog'
import {
	clearConsumerDraft,
	loadConsumerDraft,
	saveConsumerDraft,
	type ConsumerDraft,
} from '@/lib/drafts'
import { getCurrentSession } from '@/lib/auth/functions'
import {
	hasCompletedConsumerIntake,
	loadConsumerProfile,
} from '@/lib/matching/profile.db'
import { consumerQuestionFlow } from '@/lib/matching/questions'
import {
	ConsumerHome,
	ConsumerLocation,
	ConsumerQuiz,
	ConsumerSituation,
} from './-steps'
import { ConsumerPreview, draftToPreviewProfile } from './-steps/preview'
import {
	consumerFlowSteps,
	SKIPPED_ANSWER,
	stepOrder,
	type ConsumerFlowStep,
} from './-steps/shared'

const signupSearchSchema = z.object({
	step: z
		.enum(['intro', 'intent', 'home', 'quiz', 'preview'])
		.default('intro')
		.catch('intro'),
	reset: z.boolean().optional().catch(undefined),
	redirect: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/(app)/consumer/signup/')({
	validateSearch: signupSearchSchema,
	beforeLoad: async ({ search }) => {
		const validSteps = ['intro', 'intent', 'home', 'quiz', 'preview'] as const
		if (!validSteps.includes(search.step)) {
			throw redirect({ to: '/consumer/signup', search: { step: 'intro' } })
		}

		if (search.reset) {
			clearConsumerDraft()
		}

		const session = await getCurrentSession()
		if (session) {
			const profile = await loadConsumerProfile()

			if (hasCompletedConsumerIntake(profile)) {
				throw redirect({ to: '/consumer/dashboard' })
			}
		}
	},
	component: ConsumerSignupRoute,
})

function ConsumerSignupRoute() {
	const { step } = Route.useSearch()
	const navigate = useNavigate()
	const currentIndex = stepOrder.indexOf(step as ConsumerFlowStep)
	const [state, setState] = useState<ConsumerDraft>(() => {
		return loadConsumerDraft() ?? { answers: {} }
	})
	const [direction, setDirection] = useState(1)
	const [showLeaveDialog, setShowLeaveDialog] = useState(false)
	const previousIndexRef = useRef(currentIndex)

	const hasDraft =
		Object.keys(state.answers).length > 0 ||
		state.location !== undefined ||
		state.intent !== undefined

	const updateState = (patch: Partial<ConsumerDraft>) => {
		setState((current) => {
			const next = { ...current, ...patch }
			saveConsumerDraft(next)
			return next
		})
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
					return Boolean(state.location ?? state.city)
				case 'intent':
					return Boolean(state.intent)
				case 'home':
					return (
						Boolean(state.priceRange) &&
						Array.isArray(state.propertyTypes) &&
						state.propertyTypes.length > 0
					)
				case 'quiz':
					return consumerQuestionFlow.questions.every(
						(q) =>
							state.answers[q.id] !== undefined &&
							state.answers[q.id] !== SKIPPED_ANSWER,
					)
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
