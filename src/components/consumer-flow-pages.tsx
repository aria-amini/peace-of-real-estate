import { Link, useNavigate } from '@tanstack/react-router'
import {
	ArrowRight,
	CheckCircle2,
	Circle,
	CreditCard,
	Lock,
	MapPin,
	MessageCircle,
	Sparkles,
	Trophy,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { AgentMatchCard, type AgentMatch } from '@/components/agent-match-card'
import { FlowPageShell } from '@/components/flow-page-shell'
import { QuestionFlow } from '@/components/question-flow'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { upgradeToPremium } from '@/lib/auth-guards'
import {
	clearStoredConsumerDraftForFlow,
	getNextPathForConsumerFlow,
	getNextUnansweredQuestionIndex,
	getStoredConsumerDraftForFlow,
	saveStoredConsumerDraftForFlow,
} from '@/lib/intake-draft'
import { buyerQuestionFlow, sellerQuestionFlow } from '@/lib/questions'
import type { ConsumerFlowKind } from '@/lib/user-settings'

type ConsumerFlowConfig = {
	kind: ConsumerFlowKind
	basePath: '/buyer' | '/seller'
	label: 'Buyer' | 'Seller'
	areaPrompt: string
	intentOptions: string[]
	questionFlow: typeof buyerQuestionFlow
	accent: 'navy' | 'amber'
}

export const buyerConfig = {
	kind: 'buyer',
	basePath: '/buyer',
	label: 'Buyer',
	areaPrompt: 'In what area(s) are you searching?',
	intentOptions: [
		'I am ready to buy a home',
		'I am starting to explore what is out there',
		'I am selling my home first and then buying next',
	],
	questionFlow: buyerQuestionFlow,
	accent: 'navy',
} satisfies ConsumerFlowConfig

export const sellerConfig = {
	kind: 'seller',
	basePath: '/seller',
	label: 'Seller',
	areaPrompt: 'In what area is your property located?',
	intentOptions: [
		'I am ready to sell my home',
		'I am starting to explore what selling looks like',
		'I am selling first, then buying',
	],
	questionFlow: sellerQuestionFlow,
	accent: 'amber',
} satisfies ConsumerFlowConfig

const consumerMatches: AgentMatch[] = [
	{
		id: 1,
		name: 'Sarah Chen',
		agency: 'Horizon Realty Group',
		location: 'Austin, TX',
		overall: 4.8,
		scores: {
			'Working Style': 4.9,
			Communication: 4.7,
			Transparency: 4.8,
			Fit: 4.9,
		},
		experience: '12 years',
		specialties: ['First-time buyers', 'Luxury homes', 'Calm negotiation'],
		about:
			'Known for patient guidance and transparent communication. Strong fit for clients who want a steady, low-pressure process.',
		topMatch: true,
	},
	{
		id: 2,
		name: 'Marcus Johnson',
		agency: 'Urban Nest Properties',
		location: 'Austin, TX',
		overall: 4.5,
		scores: {
			'Working Style': 4.6,
			Communication: 4.4,
			Transparency: 4.5,
			Fit: 4.4,
		},
		experience: '8 years',
		specialties: ['Fast timelines', 'Urban properties', 'Relocation'],
		about:
			'Efficient, data-driven agent who respects your time and keeps decisions moving without extra drama.',
		topMatch: false,
	},
]

export function ConsumerResumeGate({ config }: { config: ConsumerFlowConfig }) {
	const draft = getStoredConsumerDraftForFlow(config.kind)
	const [dialogOpen, setDialogOpen] = useState(false)
	const navigate = useNavigate()

	const hasProgress = Boolean(
		draft.lastCompletedStage ||
		draft.zipCode ||
		draft.intent ||
		Object.keys(draft.answers ?? {}).length > 0,
	)

	useEffect(() => {
		if (!hasProgress) {
			void navigate({ to: `${config.basePath}/intro` })
		}
	}, [hasProgress, config.basePath, navigate])

	const handleStartFresh = () => {
		clearStoredConsumerDraftForFlow(config.kind)
		setDialogOpen(false)
	}

	const resumeTo = getNextPathForConsumerFlow(config.kind, draft)
	const steps = [
		{ id: 'intro', label: 'Basic Information' },
		{ id: 'quiz', label: 'Quiz' },
		{ id: 'details', label: 'Extra Details' },
		{ id: 'summary', label: 'Summary' },
	]
	const stageOrder = ['intro', 'quiz', 'details', 'summary']
	const rawCompletedIndex = stageOrder.indexOf(draft.lastCompletedStage ?? '')
	const completedIndex = Math.min(
		rawCompletedIndex,
		stageOrder.indexOf('details'),
	)
	const currentStepId = resumeTo.split('/').pop()
	const currentIndex = stageOrder.indexOf(currentStepId ?? '')

	return (
		<FlowPageShell
			title={`${config.label} Profile`}
			icon={MapPin}
			roleLabel={config.label}
		>
			<div className="space-y-6">
				<p className="text-muted-foreground text-center text-sm leading-relaxed">
					You have a saved profile. Pick up where you left off or start fresh.
				</p>

				<div className="space-y-2">
					{steps.map((step, index) => {
						const isCompleted = completedIndex >= index
						const isCurrent = currentIndex === index
						return (
							<div
								key={step.id}
								className={cn(
									'flex items-center gap-3 rounded-lg border p-3 text-sm',
									isCompleted && 'border-green-200 bg-green-50/50',
									isCurrent && 'border-foreground',
								)}
							>
								<div className="flex h-6 w-6 shrink-0 items-center justify-center">
									{isCompleted ? (
										<CheckCircle2 className="h-5 w-5 text-green-600" />
									) : (
										<Circle
											className={cn(
												'h-4 w-4',
												isCurrent ? 'text-primary' : 'text-muted-foreground',
											)}
										/>
									)}
								</div>
								<span
									className={cn(
										'font-medium',
										isCurrent && 'text-primary',
										!isCompleted && !isCurrent && 'text-muted-foreground',
									)}
								>
									{step.label}
								</span>
							</div>
						)
					})}
				</div>

				<div className="flex flex-col gap-3 pt-2 sm:flex-row">
					<Button asChild className="flex-1">
						<Link to={resumeTo}>
							Resume where I left off
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button variant="destructive" className="flex-1">
								Start fresh
							</Button>
						</DialogTrigger>
						<DialogContent showCloseButton={false}>
							<DialogHeader>
								<DialogTitle>Start fresh?</DialogTitle>
								<DialogDescription>
									This will clear your saved {config.label.toLowerCase()}{' '}
									profile and you will have to begin from step 1. This action
									cannot be undone.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button variant="outline" onClick={() => setDialogOpen(false)}>
									Cancel
								</Button>
								<Button variant="destructive" onClick={handleStartFresh}>
									Start fresh
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</FlowPageShell>
	)
}

export function ConsumerIntro({ config }: { config: ConsumerFlowConfig }) {
	const draft = getStoredConsumerDraftForFlow(config.kind)
	const [zipCode, setZipCode] = useState(draft.zipCode ?? '')
	const [intent, setIntent] = useState(draft.intent ?? '')
	const canContinue = zipCode.trim().length >= 5 && intent.length > 0

	useEffect(() => {
		saveStoredConsumerDraftForFlow(config.kind, { currentStage: 'intro' })
	}, [config.kind])

	return (
		<FlowPageShell
			title="Basic Information"
			subtitle="Step 1"
			icon={MapPin}
			roleLabel={config.label}
		>
			<div className="space-y-8">
				<div>
					<h2 className="font-heading text-xl leading-relaxed font-normal">
						{config.areaPrompt}
					</h2>
					<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
						This helps us find agents who specialize in your target area.
					</p>
					<div className="mt-4">
						<label
							htmlFor={`${config.kind}-zip`}
							className="text-sm font-medium"
						>
							Zip code
						</label>
						<Input
							id={`${config.kind}-zip`}
							value={zipCode}
							onChange={(event) => setZipCode(event.target.value)}
							placeholder="e.g. 78701"
							className="mt-1.5"
						/>
					</div>
				</div>

				<div className="border-t pt-8">
					<h2 className="font-heading text-xl leading-relaxed font-normal">
						What best describes your situation?
					</h2>
					<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
						Select the option that matches where you are in the process.
					</p>
					<div className="mt-4 space-y-3">
						{config.intentOptions.map((option) => (
							<button
								key={option}
								type="button"
								onClick={() => setIntent(option)}
								className={cn(
									'flex w-full items-center justify-between rounded-lg border p-4 text-left text-sm font-medium transition-colors',
									intent === option
										? 'border-primary bg-primary/5 text-primary'
										: 'border-border hover:bg-accent hover:text-accent-foreground',
								)}
							>
								<span className="pr-4">{option}</span>
								{intent === option && (
									<CheckCircle2 className="h-5 w-5 shrink-0" />
								)}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="mt-10 flex justify-end">
				{canContinue ? (
					<Button asChild>
						<Link
							to={`${config.basePath}/quiz`}
							onClick={() => {
								saveStoredConsumerDraftForFlow(config.kind, {
									zipCode,
									intent,
									lastCompletedStage: 'intro',
								})
							}}
						>
							Find My PRE Match
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				) : (
					<Button disabled>
						Find My PRE Match
						<ArrowRight className="h-4 w-4" />
					</Button>
				)}
			</div>
		</FlowPageShell>
	)
}

export function ConsumerQuiz({ config }: { config: ConsumerFlowConfig }) {
	const draft = getStoredConsumerDraftForFlow(config.kind)

	useEffect(() => {
		saveStoredConsumerDraftForFlow(config.kind, { currentStage: 'quiz' })
	}, [config.kind])

	return (
		<QuestionFlow
			roleLabel={config.label}
			questions={config.questionFlow.questions}
			initialAnswers={draft.answers}
			initialQuestionIndex={getNextUnansweredQuestionIndex(
				config.questionFlow.questions,
				draft.answers,
			)}
			onAnswersChange={(answers) =>
				saveStoredConsumerDraftForFlow(config.kind, { answers })
			}
			onComplete={() =>
				saveStoredConsumerDraftForFlow(config.kind, {
					lastCompletedStage: 'quiz',
				})
			}
			completeTo={`${config.basePath}/details`}
			completeLabel="Continue"
		/>
	)
}

export function ConsumerDetails({ config }: { config: ConsumerFlowConfig }) {
	const draft = getStoredConsumerDraftForFlow(config.kind)
	const [matchDetails, setMatchDetails] = useState(draft.matchDetails ?? '')

	useEffect(() => {
		saveStoredConsumerDraftForFlow(config.kind, { currentStage: 'details' })
	}, [config.kind])

	const save = () =>
		saveStoredConsumerDraftForFlow(config.kind, {
			matchDetails,
			lastCompletedStage: 'details',
		})

	return (
		<FlowPageShell
			title="Extra Details"
			subtitle="Step 3"
			icon={MessageCircle}
			roleLabel={config.label}
		>
			<div className="space-y-8">
				<div>
					<h2 className="font-heading text-xl leading-relaxed font-normal">
						Tell us anything else that would help us find a better match.
					</h2>
					<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
						Optional details help us match you more accurately.
					</p>
				</div>

				<div className="border-t pt-8">
					<label
						htmlFor={`${config.kind}-details`}
						className="font-heading text-xl leading-relaxed font-normal"
					>
						Additional details
					</label>
					<p className="text-muted-foreground mt-2 text-sm">
						Optional — the more you share, the better we can match you.
					</p>
					<Textarea
						id={`${config.kind}-details`}
						value={matchDetails}
						onChange={(event) => setMatchDetails(event.target.value)}
						rows={5}
						placeholder="Timing, concerns, must-haves, constraints, or anything Pax should understand."
						className="mt-4"
					/>
				</div>
			</div>

			<div className="mt-10 flex flex-wrap items-center justify-between gap-3">
				<Button asChild>
					<Link to={`${config.basePath}/summary`} onClick={save}>
						View Fit Summary
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
				<Link
					to={`${config.basePath}/summary`}
					onClick={() =>
						saveStoredConsumerDraftForFlow(config.kind, {
							matchDetails: '',
							lastCompletedStage: 'details',
						})
					}
					className="text-muted-foreground hover:text-foreground text-sm transition-colors"
				>
					Skip for now
				</Link>
			</div>
		</FlowPageShell>
	)
}

export function ConsumerSummary({ config }: { config: ConsumerFlowConfig }) {
	const { data: session } = authClient.useSession()
	const isUnlocked = Boolean(session)
	const unlockTo =
		config.basePath === '/buyer' ? '/buyer/summary' : '/seller/summary'

	useEffect(() => {
		saveStoredConsumerDraftForFlow(config.kind, { currentStage: 'summary' })
	}, [config.kind])

	return (
		<FlowPageShell
			title="Summary"
			subtitle="Step 4"
			icon={Sparkles}
			roleLabel={config.label}
		>
			<div className="space-y-3">
				{[
					'You prefer clear expectations before big decisions.',
					'Communication fit matters as much as market knowledge.',
					'PRE will rank agents by fit, not by ad spend or lead buying.',
				].map((item) => (
					<div
						key={item}
						className="bg-muted/40 flex gap-3 rounded-xl p-4 text-sm"
					>
						<CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
						<span>{item}</span>
					</div>
				))}
			</div>

			<div className="mt-8 space-y-5">
				<div className="space-y-3 text-center">
					<p className="text-muted-foreground text-sm tracking-[0.25em] uppercase">
						{isUnlocked ? 'Preview unlocked' : 'Locked preview'}
					</p>
					<h2 className="text-2xl font-semibold">
						See a sneak peek of your best-fit matches
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed">
						We show you a preview first so you can decide if you want to create
						an account and unlock the full match details.
					</p>
				</div>

				<div className="space-y-4">
					{consumerMatches.slice(0, 2).map((match, index) => (
						<LockedMatchPreview
							key={match.id}
							match={match}
							index={index}
							isUnlocked={isUnlocked}
						/>
					))}
				</div>

				<div className="bg-muted/30 flex flex-col gap-3 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="font-medium">
							{isUnlocked
								? 'Preview unlocked'
								: 'Create a free account to unlock'}
						</p>
						<p className="text-muted-foreground text-sm">
							{isUnlocked
								? 'Continue to checkout when you are ready.'
								: 'No spam. No commitment. Just the next step to reveal the full matches.'}
						</p>
					</div>
					<Button asChild>
						{isUnlocked ? (
							<Link
								to={`${config.basePath}/payment`}
								onClick={() =>
									saveStoredConsumerDraftForFlow(config.kind, {
										lastCompletedStage: 'summary',
									})
								}
							>
								Continue to Payment
								<ArrowRight className="h-4 w-4" />
							</Link>
						) : (
							<Link
								to="/signup"
								search={{ redirect: unlockTo }}
								onClick={() =>
									saveStoredConsumerDraftForFlow(config.kind, {
										lastCompletedStage: 'summary',
									})
								}
							>
								Sign up to Unlock
								<ArrowRight className="h-4 w-4" />
							</Link>
						)}
					</Button>
				</div>
			</div>
		</FlowPageShell>
	)
}

function LockedMatchPreview({
	index,
	match,
	isUnlocked,
}: {
	index: number
	match: AgentMatch
	isUnlocked: boolean
}) {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex items-start justify-between gap-4">
					<div>
						<div className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
							Match {index + 1}
						</div>
						<h3 className="text-xl">{match.name}</h3>
						<p className="text-muted-foreground mt-1 text-sm">
							{match.agency} · {match.location}
						</p>
					</div>
					<div className="text-right">
						<div className="text-3xl font-semibold">
							{match.overall.toFixed(1)}
						</div>
						<div className="text-muted-foreground text-xs">Fit</div>
					</div>
				</div>

				{isUnlocked ? (
					<div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2">
						<p className="text-muted-foreground text-sm leading-relaxed">
							{match.about}
						</p>
						<div className="flex flex-wrap gap-2">
							{match.specialties.map((specialty) => (
								<span
									key={specialty}
									className="bg-secondary text-secondary-foreground rounded-md border px-3 py-1 text-xs font-medium"
								>
									{specialty}
								</span>
							))}
						</div>
					</div>
				) : (
					<div className="text-muted-foreground mt-5 flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm">
						<Lock className="h-4 w-4 shrink-0" />
						<span>
							Full profile, fit breakdown, and contact details unlock after
							sign-up
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export function ConsumerPayment({ config }: { config: ConsumerFlowConfig }) {
	const [isProcessing, setIsProcessing] = useState(false)
	const [isComplete, setIsComplete] = useState(false)

	useEffect(() => {
		saveStoredConsumerDraftForFlow(config.kind, { currentStage: 'payment' })
	}, [config.kind])

	useEffect(() => {
		if (isComplete) {
			saveStoredConsumerDraftForFlow(config.kind, {
				lastCompletedStage: 'payment',
			})
		}
	}, [isComplete, config.kind])

	const handlePayment = () => {
		setIsProcessing(true)
		setTimeout(() => {
			setIsProcessing(false)
			setIsComplete(true)
			void upgradeToPremium()
		}, 1500)
	}

	if (isComplete) {
		return (
			<FlowPageShell
				title="Payment Complete"
				icon={CheckCircle2}
				roleLabel={config.label}
			>
				<div className="space-y-6 text-center">
					<div className="flex justify-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
							<CheckCircle2 className="h-8 w-8 text-green-600" />
						</div>
					</div>
					<div>
						<h2 className="text-2xl font-semibold">Payment Successful</h2>
						<p className="text-muted-foreground mt-2">
							Your matches are ready. Thank you for choosing PRE.
						</p>
					</div>
					<Button asChild className="w-full">
						<Link to={`${config.basePath}/results`}>
							View My Matches
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				</div>
			</FlowPageShell>
		)
	}

	return (
		<FlowPageShell title="Payment" icon={CreditCard} roleLabel={config.label}>
			<div className="space-y-8">
				<div className="bg-muted/30 rounded-lg border p-6 text-center">
					<div className="text-muted-foreground mb-2 text-sm">
						UNLOCK MATCHES
					</div>
					<h2 className="text-2xl font-semibold">
						Meet the agent who actually fits you.
					</h2>
					<div className="mt-4 text-4xl font-bold">$19.99</div>
					<p className="text-muted-foreground mt-2 text-sm">
						One-time fee · No subscription · 100% refundable if no match
					</p>
				</div>

				<div className="space-y-4">
					<div>
						<label htmlFor="card-number" className="text-sm font-medium">
							Card Number
						</label>
						<Input
							id="card-number"
							placeholder="4242 4242 4242 4242"
							className="mt-1.5"
							disabled={isProcessing}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label htmlFor="card-expiry" className="text-sm font-medium">
								Expiry
							</label>
							<Input
								id="card-expiry"
								placeholder="MM/YY"
								className="mt-1.5"
								disabled={isProcessing}
							/>
						</div>
						<div>
							<label htmlFor="card-cvc" className="text-sm font-medium">
								CVC
							</label>
							<Input
								id="card-cvc"
								placeholder="123"
								className="mt-1.5"
								disabled={isProcessing}
							/>
						</div>
					</div>
					<div>
						<label htmlFor="card-name" className="text-sm font-medium">
							Name on Card
						</label>
						<Input
							id="card-name"
							placeholder="Jordan Lee"
							className="mt-1.5"
							disabled={isProcessing}
						/>
					</div>
				</div>

				<Button
					onClick={handlePayment}
					disabled={isProcessing}
					className="w-full"
					size="lg"
				>
					{isProcessing ? 'Processing...' : 'Pay $19.99 — Unlock My Matches'}
				</Button>

				<p className="text-muted-foreground text-center text-xs">
					This is a demo payment. No real charges will be made.
				</p>
			</div>
		</FlowPageShell>
	)
}

export function ConsumerResults({ config }: { config: ConsumerFlowConfig }) {
	useEffect(() => {
		saveStoredConsumerDraftForFlow(config.kind, { currentStage: 'results' })
	}, [config.kind])

	return (
		<FlowPageShell title="Results" icon={Trophy} roleLabel={config.label}>
			<p className="text-muted-foreground mb-6 text-center text-sm leading-relaxed">
				Real agents ranked by fit — not by who paid the most to get your contact
				info. You can select up to 3 agents total.
			</p>
			<div className="space-y-4">
				{consumerMatches.map((match, index) => (
					<AgentMatchCard key={match.id} match={match} index={index} />
				))}
			</div>
			{config.kind === 'seller' ? (
				<p className="text-muted-foreground mt-6 border p-4 text-sm">
					Seller tip: Always request that buyer agent compensation is submitted
					with the offer — not agreed to upfront.
				</p>
			) : null}
		</FlowPageShell>
	)
}
