import { useServerFn } from '@tanstack/react-start'
import { useNavigate } from '@tanstack/react-router'
import {
	ChatCircleIcon,
	CheckCircleIcon,
	HeartIcon,
	ListChecksIcon,
	NotebookIcon,
	SparkleIcon,
	UsersIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { ArrowRight, Check, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { AnimatedStepCard, FlowIntakeProgress } from '@/components/flow/shared'
import { WizardShell } from '@/components/flow/wizard-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
	createAgentDeepProfileFromDraft,
	loadAgentDraft,
	saveAgentDraft,
	type AgentDraft,
} from '@/lib/drafts'

const deepProfileSteps: { id: DeepProfileStep; label: string; icon: Icon }[] = [
	{ id: 'communication', label: 'Communication', icon: ChatCircleIcon },
	{ id: 'values', label: 'Values', icon: HeartIcon },
	{ id: 'personality', label: 'Personality', icon: SparkleIcon },
	{ id: 'service', label: 'Service', icon: UsersIcon },
	{ id: 'story', label: 'Story', icon: NotebookIcon },
	{ id: 'priorities', label: 'Priorities', icon: ListChecksIcon },
	{ id: 'complete', label: 'Complete', icon: CheckCircleIcon },
]

type DeepProfileStep =
	| 'communication'
	| 'values'
	| 'personality'
	| 'service'
	| 'story'
	| 'priorities'
	| 'complete'

const stepOrder: DeepProfileStep[] = [
	'communication',
	'values',
	'personality',
	'service',
	'story',
	'priorities',
	'complete',
]

const communicationOptions = {
	communicationCadence: {
		title: 'How often do you proactively reach out during a deal?',
		options: {
			scheduled: 'Regularly on a set schedule, even if nothing is happening',
			milestone: 'At every key milestone and decision point',
			clientPaced:
				"I let clients set the pace — I respond but don't initiate unless needed",
		},
	},
	quickContactStyle: {
		title: 'Preferred channel for quick back-and-forth',
		options: {
			text: 'Text — fast and easy',
			call: 'Phone — I prefer to talk it through',
			email: 'Email — documented and clear',
		},
	},
	updateDeliveryStyle: {
		title: 'How do you deliver updates?',
		options: {
			brief: 'Brief bullets — just the facts',
			context: 'Context-rich — I explain the why and what it means',
			mix: 'A mix depending on urgency',
		},
	},
	responseTime: {
		title: 'Typical response time when a client reaches out',
		options: {
			'10m': 'Within 10 minutes',
			'30m': 'Within 30 minutes',
			hours: 'Within a few hours — same day always',
			'24h': 'Within 24 hours',
		},
	},
} as const

const valuesOptions = {
	transparencyStyle: {
		title: 'How do you handle fees, commissions, and conflicts?',
		options: {
			upfront: 'I disclose everything upfront before we work together',
			whenRelevant: 'I explain when it becomes relevant to a decision',
			minimal: 'I keep disclosures minimal unless asked',
		},
	},
	clientBoundaryStyle: {
		title: 'How do you push back when a client wants something unwise?',
		options: {
			direct: 'I am direct — I tell them why it is a bad idea',
			gentle: 'I gently redirect and offer alternatives',
			accommodate: 'I accommodate if it is ultimately their decision',
		},
	},
	negotiationEthic: {
		title: 'Your negotiation default',
		options: {
			winWin: 'Win-win — protect my client while finding common ground',
			protect: 'Protect my client aggressively — every point matters',
			dealmaker: 'Dealmaker — I get it done without unnecessary conflict',
		},
	},
	dualAgencyStyle: {
		title: 'How do you handle dual agency or unrepresented buyers?',
		options: {
			avoid: 'I avoid it — they deserve independent representation',
			disclose: 'I disclose fully and proceed only if everyone agrees',
			comfortable: 'I am comfortable with it when disclosed properly',
		},
	},
} as const

const personalityOptions = {
	energyStyle: {
		title: 'Your energy in a transaction',
		options: {
			calm: 'Calm and steady — I keep things grounded',
			warm: 'Warm and enthusiastic — clients feel energized',
			direct: 'Direct and fast — no fluff',
		},
	},
	teachingStyle: {
		title: 'How much do you educate clients?',
		options: {
			educator: 'Heavy educator — I want them to understand everything',
			onRequest: 'I explain when they ask or when it matters',
			execute: 'I focus on execution — they hired me to handle it',
		},
	},
	dealStressStyle: {
		title: 'When a deal gets stressful, you...',
		options: {
			steady: 'Stay steady and reassure the client',
			solve: 'Go into problem-solving mode immediately',
			transparent: 'Be transparent about the stress and options',
		},
	},
	decisionMakingStyle: {
		title: 'How do you make recommendations?',
		options: {
			data: 'Data-driven — show me the numbers and comps',
			intuition: 'Experience and intuition — I have seen this before',
			collaborative: 'Collaborative — we decide together',
		},
	},
} as const

const serviceOptions = {
	serviceDepth: {
		title: 'Your service model',
		options: {
			concierge: 'Full-service concierge — I handle nearly everything',
			standard: 'Standard full-service — strong support, client stays involved',
			streamlined: 'Streamlined — efficient, no unnecessary meetings',
		},
	},
	involvementLevel: {
		title: 'How hands-on do you expect to be?',
		options: {
			veryInvolved: 'Very involved — frequent check-ins and guidance',
			keyDetails: 'Key details only — I step in when decisions are needed',
			handsOff: 'Mostly hands-off — client drives, I execute',
		},
	},
	representationPreference: {
		title: 'Your default representation style',
		options: {
			exclusive: 'Exclusive partnership — dedicated to this client',
			access: 'Access-first — I provide access and flexibility',
		},
	},
} as const

const narrativeFields = [
	{
		key: 'valueProposition',
		label: 'Your elevator pitch',
		placeholder: 'In one sentence, why should someone choose you?',
	},
	{
		key: 'idealClientDescription',
		label: 'Your ideal client',
		placeholder: 'Who do you work best with?',
	},
	{
		key: 'whyIStarted',
		label: 'Why you started',
		placeholder: 'What drew you to real estate?',
	},
	{
		key: 'typicalDayInDeal',
		label: 'What working with you feels like',
		placeholder: 'Describe a typical day in a transaction with you.',
	},
	{
		key: 'hardNo',
		label: 'Your hard no',
		placeholder: 'Who or what are you NOT the right fit for?',
	},
	{
		key: 'valueBeyondTransaction',
		label: 'Value beyond the transaction',
		placeholder: 'What do clients get from you after closing?',
	},
] as const

const priorityOptions = [
	{ id: 'communicationCadence', label: 'Communication cadence' },
	{ id: 'quickContactStyle', label: 'Quick contact style' },
	{ id: 'updateDeliveryStyle', label: 'Update delivery style' },
	{ id: 'responseTime', label: 'Response time' },
	{ id: 'transparencyStyle', label: 'Transparency style' },
	{ id: 'clientBoundaryStyle', label: 'Client boundary style' },
	{ id: 'negotiationEthic', label: 'Negotiation ethic' },
	{ id: 'dualAgencyStyle', label: 'Dual agency style' },
	{ id: 'energyStyle', label: 'Energy style' },
	{ id: 'teachingStyle', label: 'Teaching style' },
	{ id: 'dealStressStyle', label: 'Deal stress style' },
	{ id: 'decisionMakingStyle', label: 'Decision making style' },
	{ id: 'serviceDepth', label: 'Service depth' },
	{ id: 'involvementLevel', label: 'Involvement level' },
	{ id: 'representationPreference', label: 'Representation preference' },
] as const

function StepHeader({
	stepNumber,
	totalSteps,
	title,
	icon: Icon,
}: {
	stepNumber: number
	totalSteps: number
	title: string
	icon?: Icon
}) {
	return (
		<div className="space-y-1">
			<p className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
				Step {stepNumber} of {totalSteps}
			</p>
			<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
				{Icon ? <Icon className="h-4 w-4" weight="duotone" /> : null}
				{title}
			</p>
		</div>
	)
}

function RadioCardGroup({
	value,
	onChange,
	options,
}: {
	value: string
	onChange: (value: string) => void
	options: Record<string, string>
}) {
	return (
		<div className="grid grid-cols-1 gap-2.5">
			{Object.entries(options).map(([slug, label]) => {
				const isSelected = value === slug
				return (
					<button
						key={slug}
						type="button"
						onClick={() => onChange(slug)}
						className={cn(
							'group flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition',
							isSelected
								? 'border-primary/60 bg-primary/[0.06] text-foreground shadow-sm'
								: 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:shadow-sm',
						)}
						aria-pressed={isSelected}
					>
						<span
							className={cn(
								'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
								isSelected
									? 'border-primary bg-transparent'
									: 'border-muted-foreground/30 bg-muted/30 group-hover:border-primary/50',
							)}
						>
							{isSelected ? (
								<span className="bg-primary h-2 w-2 rounded-full" />
							) : null}
						</span>
						{label}
					</button>
				)
			})}
		</div>
	)
}

function SubjectiveStep({
	title,
	icon,
	stepNumber,
	totalSteps,
	questions,
	state,
	direction,
	onUpdate,
	onContinue,
}: {
	title: string
	icon: Icon
	stepNumber: number
	totalSteps: number
	questions: Record<string, { title: string; options: Record<string, string> }>
	state: AgentDraft
	direction: number
	onUpdate: (patch: Partial<AgentDraft>) => void
	onContinue: () => void
}) {
	const [answers, setAnswers] = useState(() => {
		const initial: Record<string, string> = {}
		for (const key of Object.keys(questions)) {
			const value = state[key as keyof AgentDraft]
			if (typeof value === 'string') initial[key] = value
		}
		return initial
	})

	const allAnswered = Object.keys(questions).every((key) => answers[key])

	const handleContinue = () => {
		if (!allAnswered) return
		onUpdate(answers)
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey={title} direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={stepNumber}
						totalSteps={totalSteps}
						title={title}
						icon={icon}
					/>

					<div className="space-y-6">
						{Object.entries(questions).map(([key, question]) => (
							<div key={key} className="space-y-3">
								<p className="text-sm font-semibold">{question.title}</p>
								<RadioCardGroup
									value={answers[key] ?? ''}
									onChange={(value) =>
										setAnswers((current) => ({
											...current,
											[key]: value,
										}))
									}
									options={question.options}
								/>
							</div>
						))}
					</div>

					<div>
						<Button
							onClick={handleContinue}
							disabled={!allAnswered}
							size="lg"
							className={cn(
								'w-full gap-2 rounded-4xl px-8 transition-all duration-300',
								allAnswered
									? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg'
									: 'bg-muted text-muted-foreground',
							)}
						>
							Continue
							<ArrowRight className="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

export function AgentDeepProfileStory({
	state,
	direction,
	onUpdate,
	onContinue,
}: {
	state: AgentDraft
	direction: number
	onUpdate: (patch: Partial<AgentDraft>) => void
	onContinue: () => void
}) {
	const [story, setStory] = useState(() => {
		const initial: Record<string, string> = {}
		for (const field of narrativeFields) {
			const value = state[field.key as keyof AgentDraft]
			initial[field.key] = typeof value === 'string' ? value : ''
		}
		return initial
	})

	const hasContent = Object.values(story).some(
		(value) => value.trim().length > 0,
	)

	return (
		<AnimatedStepCard stepKey="story" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={5}
						totalSteps={6}
						title="Your story"
						icon={NotebookIcon}
					/>

					<div className="space-y-5">
						{narrativeFields.map((field) => (
							<Label
								key={field.key}
								className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase"
							>
								{field.label}
								<Textarea
									value={story[field.key]}
									onChange={(event) =>
										setStory((current) => ({
											...current,
											[field.key]: event.target.value,
										}))
									}
									placeholder={field.placeholder}
									rows={3}
									className="resize-none text-sm font-normal normal-case"
								/>
							</Label>
						))}
					</div>

					<div>
						<Button
							onClick={() => {
								onUpdate(story)
								onContinue()
							}}
							disabled={!hasContent}
							size="lg"
							className={cn(
								'w-full gap-2 rounded-4xl px-8 transition-all duration-300',
								hasContent
									? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg'
									: 'bg-muted text-muted-foreground',
							)}
						>
							Continue
							<ArrowRight className="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

export function AgentDeepProfilePriorities({
	state,
	direction,
	onUpdate,
	onContinue,
}: {
	state: AgentDraft
	direction: number
	onUpdate: (patch: Partial<AgentDraft>) => void
	onContinue: () => void
}) {
	const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
		state.matchPriorities ?? [],
	)
	const maxSelections = 5

	const togglePriority = (id: string) => {
		setSelectedPriorities((current) => {
			if (current.includes(id)) {
				return current.filter((item) => item !== id)
			}
			if (current.length >= maxSelections) return current
			return [...current, id]
		})
	}

	return (
		<AnimatedStepCard stepKey="priorities" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={6}
						totalSteps={6}
						title="Match priorities"
						icon={ListChecksIcon}
					/>

					<p className="text-muted-foreground text-sm leading-relaxed">
						Pick up to {maxSelections} dimensions that matter most when we match
						you with consumers.
					</p>

					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						{priorityOptions.map((option) => {
							const isSelected = selectedPriorities.includes(option.id)
							const atLimit =
								!isSelected && selectedPriorities.length >= maxSelections
							return (
								<button
									key={option.id}
									type="button"
									disabled={atLimit}
									onClick={() => togglePriority(option.id)}
									className={cn(
										'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition',
										isSelected
											? 'border-primary/60 bg-primary/[0.06] text-foreground shadow-sm'
											: atLimit
												? 'border-border bg-muted/30 opacity-50'
												: 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:shadow-sm',
									)}
									aria-pressed={isSelected}
								>
									<span
										className={cn(
											'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
											isSelected
												? 'border-primary bg-transparent'
												: 'border-muted-foreground/30 bg-muted/30 group-hover:border-primary/50',
										)}
									>
										{isSelected ? (
											<Check className="text-primary h-3 w-3" />
										) : null}
									</span>
									{option.label}
								</button>
							)
						})}
					</div>

					<div>
						<Button
							onClick={() => {
								onUpdate({ matchPriorities: selectedPriorities })
								onContinue()
							}}
							disabled={selectedPriorities.length === 0}
							size="lg"
							className={cn(
								'w-full gap-2 rounded-4xl px-8 transition-all duration-300',
								selectedPriorities.length > 0
									? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg'
									: 'bg-muted text-muted-foreground',
							)}
						>
							Continue
							<ArrowRight className="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

export function AgentDeepProfileComplete({
	state,
	direction,
}: {
	state: AgentDraft
	direction: number
}) {
	const navigate = useNavigate()
	const save = useServerFn(createAgentDeepProfileFromDraft)
	const [saving, setSaving] = useState(false)

	const handleFinish = async () => {
		setSaving(true)
		try {
			await save({ data: state })
			void navigate({ to: '/agent/dashboard' })
		} finally {
			setSaving(false)
		}
	}

	return (
		<AnimatedStepCard stepKey="complete" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-8 text-center">
					<div className="flex justify-center">
						<div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
							<CheckCircleIcon
								className="text-primary h-8 w-8"
								weight="duotone"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<h2 className="font-heading text-2xl font-semibold tracking-tight">
							Deep profile complete
						</h2>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Your profile is now enriched. Consumers will see your narrative
							and our matching will weight what matters most to you.
						</p>
					</div>
					<Button
						onClick={handleFinish}
						disabled={saving}
						size="lg"
						className="w-full gap-2 rounded-4xl"
					>
						{saving ? 'Saving...' : 'Go to account'}
						<ArrowRight className="h-4 w-4" />
					</Button>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

function DeepProfileLeaveDialog({
	open,
	onOpenChange,
	onConfirm,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TriangleAlert className="text-destructive h-5 w-5" />
						Leave this page?
					</DialogTitle>
					<DialogDescription>
						Your deep profile progress is saved in this browser. You can come
						back and finish any time.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Keep going
					</Button>
					<Button variant="destructive" onClick={onConfirm}>
						Leave
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export function AgentDeepProfile({
	step,
	reset = false,
}: {
	step: DeepProfileStep
	reset?: boolean
}) {
	const navigate = useNavigate()
	const currentIndex = stepOrder.indexOf(step)
	const [state, setState] = useState<AgentDraft>(() => {
		if (reset) return {}
		return loadAgentDraft() ?? {}
	})
	const [direction, setDirection] = useState(1)
	const [showLeaveDialog, setShowLeaveDialog] = useState(false)
	const previousIndexRef = useRef(currentIndex)

	const hasDraft = state.firstName !== undefined

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

	const goToStep = (nextStep: DeepProfileStep) => {
		void navigate({
			to: '/agent/deep-profile',
			search: { step: nextStep },
		})
	}

	const completedStepIds = deepProfileSteps
		.filter((s) => {
			switch (s.id) {
				case 'communication':
					return Boolean(
						state.communicationCadence &&
						state.quickContactStyle &&
						state.updateDeliveryStyle &&
						state.responseTime,
					)
				case 'values':
					return Boolean(
						state.transparencyStyle &&
						state.clientBoundaryStyle &&
						state.negotiationEthic &&
						state.dualAgencyStyle,
					)
				case 'personality':
					return Boolean(
						state.energyStyle &&
						state.teachingStyle &&
						state.dealStressStyle &&
						state.decisionMakingStyle,
					)
				case 'service':
					return Boolean(
						state.serviceDepth &&
						state.involvementLevel &&
						state.representationPreference,
					)
				case 'story':
					return Boolean(state.valueProposition || state.whyIStarted)
				case 'priorities':
					return Boolean(
						state.matchPriorities && state.matchPriorities.length > 0,
					)
				default:
					return false
			}
		})
		.map((s) => s.id)

	const progress = (
		<FlowIntakeProgress steps={deepProfileSteps} current={step} />
	)

	return (
		<>
			<WizardShell
				steps={deepProfileSteps}
				currentStepId={step}
				progress={progress}
				onHomeClick={handleHomeClick}
				onStepClick={(nextStep) => goToStep(nextStep as DeepProfileStep)}
				completedStepIds={completedStepIds}
			>
				{step === 'communication' ? (
					<SubjectiveStep
						title="Communication"
						icon={ChatCircleIcon}
						stepNumber={1}
						totalSteps={6}
						questions={communicationOptions}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('values')}
					/>
				) : step === 'values' ? (
					<SubjectiveStep
						title="Working values"
						icon={HeartIcon}
						stepNumber={2}
						totalSteps={6}
						questions={valuesOptions}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('personality')}
					/>
				) : step === 'personality' ? (
					<SubjectiveStep
						title="Personality & energy"
						icon={SparkleIcon}
						stepNumber={3}
						totalSteps={6}
						questions={personalityOptions}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('service')}
					/>
				) : step === 'service' ? (
					<SubjectiveStep
						title="Service model"
						icon={UsersIcon}
						stepNumber={4}
						totalSteps={6}
						questions={serviceOptions}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('story')}
					/>
				) : step === 'story' ? (
					<AgentDeepProfileStory
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('priorities')}
					/>
				) : step === 'priorities' ? (
					<AgentDeepProfilePriorities
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('complete')}
					/>
				) : (
					<AgentDeepProfileComplete state={state} direction={direction} />
				)}
			</WizardShell>
			<DeepProfileLeaveDialog
				open={showLeaveDialog}
				onConfirm={() => {
					setShowLeaveDialog(false)
					void navigate({ to: '/' })
				}}
				onOpenChange={(open) => {
					if (!open) setShowLeaveDialog(false)
				}}
			/>
		</>
	)
}
