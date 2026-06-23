import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import { WizardShell } from '@/components/signup/wizard-shell'
import { FlowIntakeProgress } from '@/components/signup/shared'
import { LeaveDialog } from '@/components/signup/leave-dialog'
import { loadAgentDraft, saveAgentDraft, type AgentDraft } from '@/lib/drafts'
import { getCurrentSession } from '@/lib/auth/functions'
import { loadAgentProfile } from '@/lib/matching/profile'
import {
	AgentCompliance,
	AgentIdentity,
	AgentMarket,
	AgentPeacePact,
	AgentWelcome,
} from './-steps'
import { AgentPreview, draftToPreviewProfile } from './-steps/preview'
import { agentFlowSteps, stepOrder, type AgentFlowStep } from './-steps/shared'

const signupSearchSchema = z.object({
	step: z
		.enum([
			'welcome',
			'identity',
			'market',
			'compliance',
			'peacePact',
			'preview',
		])
		.default('welcome')
		.catch('welcome'),
})

export const Route = createFileRoute('/(app)/agent/signup/')({
	validateSearch: signupSearchSchema,
	beforeLoad: async ({ search }) => {
		const validSteps = [
			'welcome',
			'identity',
			'market',
			'compliance',
			'peacePact',
			'preview',
		] as const
		if (!validSteps.includes(search.step)) {
			throw redirect({ to: '/agent/signup', search: { step: 'welcome' } })
		}

		const session = await getCurrentSession()
		if (session) {
			const profile = await loadAgentProfile()
			if (
				profile?.status === 'active' ||
				profile?.status === 'enriched' ||
				profile?.status === 'essentials_submitted'
			) {
				throw redirect({ to: '/agent/dashboard' })
			}
		}
	},
	component: AgentSignupRoute,
})

function AgentSignupRoute() {
	const { step } = Route.useSearch()
	const navigate = useNavigate()
	const currentIndex = stepOrder.indexOf(step as AgentFlowStep)
	const [state, setState] = useState<AgentDraft>(() => {
		return loadAgentDraft() ?? {}
	})
	const [direction, setDirection] = useState(1)
	const [showLeaveDialog, setShowLeaveDialog] = useState(false)
	const previousIndexRef = useRef(currentIndex)

	const hasDraft =
		state.firstName !== undefined ||
		state.city !== undefined ||
		state.representationSide !== undefined

	const updateState = (patch: Partial<AgentDraft>) => {
		setState((current) => {
			const next = { ...current, ...patch }
			saveAgentDraft(next)
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

	const goToStep = (nextStep: AgentFlowStep) => {
		void navigate({
			to: '/agent/signup',
			search: { step: nextStep },
		})
	}

	const completedStepIds = agentFlowSteps
		.filter((s) => {
			switch (s.id) {
				case 'identity':
					return Boolean(state.firstName && state.lastName)
				case 'market':
					return Boolean(
						state.city && state.typicalPriceRange && state.representationSide,
					)
				case 'compliance':
					return Boolean(state.licenseAttested && state.eoInsuranceStatus)
				case 'peacePact':
					return Boolean(state.peacePactSigned)
				default:
					return false
			}
		})
		.map((s) => s.id)

	if (step === 'preview') {
		const profile = draftToPreviewProfile(state)
		return (
			<>
				<AgentPreview profile={profile} />
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

	const progress = <FlowIntakeProgress steps={agentFlowSteps} current={step} />

	return (
		<>
			<WizardShell
				steps={agentFlowSteps}
				currentStepId={step}
				progress={progress}
				onHomeClick={handleHomeClick}
				onStepClick={(nextStep) => goToStep(nextStep as AgentFlowStep)}
				completedStepIds={completedStepIds}
			>
				{step === 'welcome' ? (
					<AgentWelcome onContinue={() => goToStep('identity')} />
				) : step === 'identity' ? (
					<AgentIdentity
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('market')}
					/>
				) : step === 'market' ? (
					<AgentMarket
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('compliance')}
					/>
				) : step === 'compliance' ? (
					<AgentCompliance
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('peacePact')}
					/>
				) : (
					<AgentPeacePact
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('preview')}
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
