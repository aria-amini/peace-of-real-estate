import { Link } from '@tanstack/react-router'
import * as zipcodes from 'zipcodes'
import {
	ArrowRight,
	Check,
	CheckCircle2,
	ChevronsUpDown,
	CreditCard,
	MapPin,
	Sparkles,
	Trophy,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

import { FlowPageShell } from '@/components/flow-page-shell'
import { QuestionFlow } from '@/components/question-flow'
import { AuthCard } from '@/components/auth-card'
import {
	MatchCardModern,
	mockMatch1,
	mockMatch2,
	type MatchDetails,
} from '@/components/match-card-variants'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { upgradeToPremium } from '@/lib/auth-guards'
import {
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
const zipCodeLocations = Object.values(zipcodes.codes).filter(
	(location) => location.country === 'US',
)

const usStateCodes = new Set([
	'AL',
	'AK',
	'AZ',
	'AR',
	'CA',
	'CO',
	'CT',
	'DE',
	'DC',
	'FL',
	'GA',
	'HI',
	'ID',
	'IL',
	'IN',
	'IA',
	'KS',
	'KY',
	'LA',
	'ME',
	'MD',
	'MA',
	'MI',
	'MN',
	'MS',
	'MO',
	'MT',
	'NE',
	'NV',
	'NH',
	'NJ',
	'NM',
	'NY',
	'NC',
	'ND',
	'OH',
	'OK',
	'OR',
	'PA',
	'RI',
	'SC',
	'SD',
	'TN',
	'TX',
	'UT',
	'VT',
	'VA',
	'WA',
	'WV',
	'WI',
	'WY',
])

const stateLocations = Object.entries(zipcodes.states.full)
	.filter(([, state]) => usStateCodes.has(state))
	.map(([name, state]) => ({
		name: name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
		state,
	}))

function formatZipCodeLocation(location: (typeof zipCodeLocations)[number]) {
	return `${location.city}, ${location.state} ${location.zip}`
}

function getLocationSuggestions(query: string) {
	const normalizedQuery = query.trim().toLowerCase()
	if (normalizedQuery.length < 2) return []

	const suggestions: string[] = []
	const seen = new Set<string>()
	const addSuggestion = (suggestion: string) => {
		if (seen.has(suggestion)) return
		seen.add(suggestion)
		suggestions.push(suggestion)
	}

	for (const location of stateLocations) {
		if (
			location.name.toLowerCase().includes(normalizedQuery) ||
			location.state.toLowerCase().includes(normalizedQuery)
		) {
			addSuggestion(`${location.name}, ${location.state}`)
		}
	}

	for (const location of zipCodeLocations) {
		const label = formatZipCodeLocation(location)
		if (
			location.zip.startsWith(normalizedQuery) ||
			location.city.toLowerCase().includes(normalizedQuery) ||
			location.state.toLowerCase() === normalizedQuery ||
			label.toLowerCase().includes(normalizedQuery)
		) {
			addSuggestion(label)
		}

		if (suggestions.length >= 8) break
	}

	return suggestions
}

export const buyerConfig = {
	kind: 'buyer',
	basePath: '/buyer',
	label: 'Buyer',
	areaPrompt: 'City, State, or ZIP code',
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

const consumerMatches: MatchDetails[] = [
	{
		id: 'consumer-1',
		name: 'Sarah Chen',
		role: 'agent',
		location: 'Austin, TX',
		zipCodes: ['78701'],
		fitScore: 96,
		status: 'new',
		date: 'Just now',
		experience: '12 years',
		agency: 'Horizon Realty Group',
		specialties: ['First-time buyers', 'Luxury homes', 'Calm negotiation'],
		about:
			'Known for patient guidance and transparent communication. Strong fit for clients who want a steady, low-pressure process.',
		scores: {
			'Working Style': 4.9,
			Communication: 4.7,
			Transparency: 4.8,
			Fit: 4.9,
		},
		isTopMatch: true,
	},
	{
		id: 'consumer-2',
		name: 'Marcus Johnson',
		role: 'agent',
		location: 'Austin, TX',
		zipCodes: ['78701'],
		fitScore: 90,
		status: 'new',
		date: 'Just now',
		experience: '8 years',
		agency: 'Urban Nest Properties',
		specialties: ['Fast timelines', 'Urban properties', 'Relocation'],
		about:
			'Efficient, data-driven agent who respects your time and keeps decisions moving without extra drama.',
		scores: {
			'Working Style': 4.6,
			Communication: 4.4,
			Transparency: 4.5,
			Fit: 4.4,
		},
		isTopMatch: false,
	},
]

export function ConsumerIntro({ config }: { config: ConsumerFlowConfig }) {
	const draft = getStoredConsumerDraftForFlow(config.kind)
	const [location, setLocation] = useState(draft.zipCode ?? '')
	const [locationOpen, setLocationOpen] = useState(false)
	const [intent, setIntent] = useState(draft.intent ?? '')
	const canContinue = location.trim().length >= 2 && intent.length > 0
	const locationSuggestions = getLocationSuggestions(location)

	useEffect(() => {
		saveStoredConsumerDraftForFlow(config.kind, { currentStage: 'intro' })
	}, [config.kind])

	return (
		<FlowPageShell title="Basic Information" icon={MapPin} headerInsideCard>
			<div className="space-y-8">
				<FieldSet className="gap-0">
					<FieldLegend className="font-heading mb-0 text-xl leading-relaxed font-normal">
						{config.areaPrompt}
					</FieldLegend>
					<FieldGroup className="mt-2 gap-0">
						<Field className="gap-0">
							<FieldLabel
								htmlFor={`${config.kind}-location`}
								className="sr-only"
							>
								Location
							</FieldLabel>
							<Popover open={locationOpen} onOpenChange={setLocationOpen}>
								<PopoverTrigger asChild>
									<Button
										id={`${config.kind}-location`}
										variant="outline"
										aria-expanded={locationOpen}
										className="bg-input/30 mt-1.5 h-9 w-full justify-between rounded-4xl px-3 font-normal"
									>
										<span className={cn(!location && 'text-muted-foreground')}>
											{location || 'e.g. Austin, TX or 78704'}
										</span>
										<ChevronsUpDown className="opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									align="start"
									className="w-(--radix-popover-trigger-width) p-0"
								>
									<Command shouldFilter={false}>
										<CommandInput
											value={location}
											onValueChange={setLocation}
											placeholder="Search city, state, or ZIP..."
										/>
										<CommandList>
											<CommandEmpty>
												No suggestions. You can still use what you typed.
											</CommandEmpty>
											<CommandGroup>
												{locationSuggestions.map((suggestion) => (
													<CommandItem
														key={suggestion}
														value={suggestion}
														onSelect={(value) => {
															setLocation(value)
															setLocationOpen(false)
														}}
													>
														<Check
															className={cn(
																location === suggestion
																	? 'opacity-100'
																	: 'opacity-0',
															)}
														/>
														{suggestion}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</Field>
					</FieldGroup>
				</FieldSet>

				<FieldSet className="pt-2">
					<FieldLegend className="font-heading mb-0 text-xl leading-relaxed font-normal">
						What best describes your situation?
					</FieldLegend>
					<RadioGroup value={intent} onValueChange={setIntent} className="mt-4">
						<FieldGroup className="gap-3">
							{config.intentOptions.map((option, index) => {
								const isSelected = intent === option
								const optionId = `${config.kind}-intent-${index}`

								return (
									<FieldLabel
										key={option}
										htmlFor={optionId}
										className={cn(
											'group flex w-full cursor-pointer items-start gap-4 rounded-lg border bg-card/60 p-4 text-left transition-all hover:border-foreground/25 hover:bg-muted/30 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 [&>[data-slot=field]]:p-0',
											isSelected &&
												'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20',
										)}
									>
										<Field
											orientation="horizontal"
											className="items-start gap-4"
										>
											<RadioGroupItem
												id={optionId}
												value={option}
												className="mt-0.5 size-5"
											/>
											<span className="text-foreground flex-1 text-sm leading-relaxed font-medium">
												{option}
											</span>
										</Field>
									</FieldLabel>
								)
							})}
						</FieldGroup>
					</RadioGroup>
				</FieldSet>
			</div>

			<div className="mt-10 flex justify-end">
				{canContinue ? (
					<Button asChild>
						<Link
							to={`${config.basePath}/quiz`}
							onClick={() => {
								saveStoredConsumerDraftForFlow(config.kind, {
									zipCode: location.trim(),
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
			completeTo={`${config.basePath}/preview`}
			completeLabel="Continue"
			headerInsideCard
		/>
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
			<FlowPageShell title="Payment Complete" icon={CheckCircle2}>
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
		<FlowPageShell title="Payment" icon={CreditCard}>
			<div className="space-y-8">
				<Card className="bg-muted/30 rounded-lg border p-6 py-6 text-center shadow-none ring-0">
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
				</Card>

				<div className="space-y-4">
					<div>
						<Label htmlFor="card-number" className="text-sm font-medium">
							Card Number
						</Label>
						<Input
							id="card-number"
							placeholder="4242 4242 4242 4242"
							className="mt-1.5"
							disabled={isProcessing}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="card-expiry" className="text-sm font-medium">
								Expiry
							</Label>
							<Input
								id="card-expiry"
								placeholder="MM/YY"
								className="mt-1.5"
								disabled={isProcessing}
							/>
						</div>
						<div>
							<Label htmlFor="card-cvc" className="text-sm font-medium">
								CVC
							</Label>
							<Input
								id="card-cvc"
								placeholder="123"
								className="mt-1.5"
								disabled={isProcessing}
							/>
						</div>
					</div>
					<div>
						<Label htmlFor="card-name" className="text-sm font-medium">
							Name on Card
						</Label>
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
		<FlowPageShell title="Results" icon={Trophy}>
			<p className="text-muted-foreground mb-6 text-center text-sm leading-relaxed">
				Real agents ranked by fit — not by who paid the most to get your contact
				info. You can select up to 3 agents total.
			</p>
			<div className="space-y-4">
				{consumerMatches.map((match) => (
					<MatchCardModern
						key={match.id}
						match={match}
						showScoreBreakdown
						actionLabel="Select Agent"
					/>
				))}
			</div>
			{config.kind === 'seller' ? (
				<Card className="text-muted-foreground mt-6 rounded-none border bg-transparent p-4 py-4 text-sm shadow-none ring-0">
					Seller tip: Always request that buyer agent compensation is submitted
					with the offer — not agreed to upfront.
				</Card>
			) : null}
		</FlowPageShell>
	)
}

const previewMatches = [mockMatch1, mockMatch2]

export function ConsumerPreview({ config }: { config: ConsumerFlowConfig }) {
	const [dialogOpen, setDialogOpen] = useState(false)
	const [summaryReady, setSummaryReady] = useState(false)
	const [previewsReady, setPreviewsReady] = useState(false)

	useEffect(() => {
		saveStoredConsumerDraftForFlow(config.kind, { currentStage: 'preview' })
	}, [config.kind])

	useEffect(() => {
		const summaryTimer = setTimeout(() => setSummaryReady(true), 3000)
		const previewsTimer = setTimeout(() => setPreviewsReady(true), 5000)
		return () => {
			clearTimeout(summaryTimer)
			clearTimeout(previewsTimer)
		}
	}, [])

	return (
		<FlowPageShell
			title="Your Matches"
			subtitle="Preview"
			icon={Sparkles}
			headerInsideCard
		>
			<div className="space-y-8">
				<div className="space-y-4 text-center">
					<h2 className="font-heading text-xl leading-relaxed font-normal">
						Meet the agents who actually fit you
					</h2>
					<p className="text-muted-foreground text-sm leading-relaxed">
						Based on your answers, we found agents ranked by fit.
					</p>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button size="lg" className="gap-2">
								Unlock Full Matches
								<ArrowRight className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-md">
							<DialogHeader>
								<DialogTitle>Create your account</DialogTitle>
								<DialogDescription>
									Unlock your full match details and connect with agents.
								</DialogDescription>
							</DialogHeader>
							<AuthCard mode="sign-up" embedded redirect="/matches" />
						</DialogContent>
					</Dialog>
				</div>

				<div className="space-y-3">
					<h3 className="text-muted-foreground text-center text-xs font-semibold tracking-widest uppercase">
						Your Profile Summary
					</h3>
					{summaryReady ? (
						<ul className="text-muted-foreground mx-auto max-w-sm list-disc space-y-1 px-6 text-left text-sm leading-relaxed">
							<li>
								You value clear, upfront communication and expect your agent to
								set expectations early.
							</li>
							<li>
								You prefer a data-driven approach with market analysis to inform
								every decision.
							</li>
							<li>
								Timeliness matters to you — you want an agent who responds
								quickly and keeps things moving.
							</li>
						</ul>
					) : (
						<div className="mx-auto max-w-sm space-y-2 px-6 text-left">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
							<Skeleton className="h-4 w-4/5" />
						</div>
					)}
				</div>

				<div className="space-y-3">
					<h3 className="text-muted-foreground text-center text-xs font-semibold tracking-widest uppercase">
						Top Matches
					</h3>
					{previewsReady
						? previewMatches.map((match) => (
								<MatchCardModern key={match.id} match={match} locked />
							))
						: Array.from({ length: 2 }).map((_, i) => (
								<Card key={i} className="mx-auto max-w-xl overflow-hidden">
									<CardContent className="p-5">
										<div className="flex items-start gap-4">
											<Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
											<div className="min-w-0 flex-1 space-y-2">
												<Skeleton className="h-5 w-32" />
												<Skeleton className="h-4 w-48" />
												<Skeleton className="h-3 w-40" />
											</div>
											<Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
										</div>
										<div className="mt-3 space-y-2">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-5/6" />
										</div>
										<div className="mt-3 flex flex-wrap gap-1.5">
											<Skeleton className="h-5 w-20 rounded-full" />
											<Skeleton className="h-5 w-24 rounded-full" />
											<Skeleton className="h-5 w-16 rounded-full" />
										</div>
										<Skeleton className="mt-4 h-11 w-full rounded-xl" />
									</CardContent>
								</Card>
							))}
				</div>
			</div>
		</FlowPageShell>
	)
}
