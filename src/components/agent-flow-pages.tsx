import { Link, useNavigate } from '@tanstack/react-router'
import {
	BriefcaseIcon,
	ChartLineIcon,
	CurrencyDollarIcon,
	MapPinIcon,
	QuestionIcon,
	UsersIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import * as zipcodes from 'zipcodes'
import { ArrowRight, Check, ChevronsUpDown, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
	AnimatedStatusIcon,
	AnimatedStepCard,
	FlowIntakeProgress,
	StepProgressHeader,
} from '@/components/flow-shared'
import { QuestionFlow } from '@/components/question-flow'
import { WizardShell } from '@/components/wizard-shell'
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
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
	loadAgentDraft,
	saveAgentDraft,
	type AgentDraft,
} from '@/lib/agent-draft-storage'
import type { RepresentationSide } from '@/lib/matching/profile.types'
import {
	agentQuestionFlow,
	getAnswerSummary,
	questionOptionLabel,
	questionOptionSlugs,
	type Answers,
	type Question,
	type QuestionFlow as MatchingQuestionFlow,
} from '@/lib/matching/questions'

const SKIPPED_ANSWER = '__skipped__'

type AgentFlowStep = 'intro' | 'situation' | 'quiz'

const agentFlowSteps: { id: AgentFlowStep; label: string; icon: Icon }[] = [
	{ id: 'intro', label: 'Market', icon: MapPinIcon },
	{ id: 'situation', label: 'Experience', icon: BriefcaseIcon },
	{ id: 'quiz', label: 'Style', icon: UsersIcon },
]

const stepOrder: AgentFlowStep[] = ['intro', 'situation', 'quiz']

type AgentFlowState = {
	serviceArea1?: string
	serviceArea2?: string
	serviceArea3?: string
	typicalPriceRange?: string
	representationSide?: RepresentationSide
	bestClientTypes?: string[]
	yearsLicensed?: string
	averageTransactions?: string
	matchPriorities?: string[]
	answers: Answers
}

type AgentFlowConfig = {
	basePath: '/agent'
	label: 'Agent'
	areaPrompt: string
	situationPrompt: string
	intentOptions: RepresentationSide[]
	experiencePrompt: string
	experienceOptions: string[]
	volumePrompt: string
	volumeOptions: { slug: string; label: string }[]
	pricePrompt: string
	priceOptions: { slug: string; label: string }[]
	clientPrompt: string
	clientOptions: string[]
	questionFlow: MatchingQuestionFlow
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

const priceOptions = [
	{ slug: 'under400k', label: 'Under $400k' },
	{ slug: '400kTo750k', label: '$400k to $750k' },
	{ slug: '750kTo1_5m', label: '$750k to $1.5M' },
	{ slug: '1_5mPlus', label: '$1.5M and above' },
] as const

const yearsLicensedOptions = [
	{ slug: '0-2', label: '0-2 years' },
	{ slug: '3-5', label: '3-5 years' },
	{ slug: '6-10', label: '6-10 years' },
	{ slug: '10+', label: '10+ years' },
] as const

const averageTransactionsOptions = [
	{ slug: '0-5', label: '0-5 per year' },
	{ slug: '6-15', label: '6-15 per year' },
	{ slug: '16-30', label: '16-30 per year' },
	{ slug: '30+', label: '30+ per year' },
] as const

const bestClientTypesQuestion = agentQuestionFlow.questions.find(
	(q) => q.id === 'bestClientTypes',
)!

export const agentConfig = {
	basePath: '/agent',
	label: 'Agent',
	areaPrompt: 'City, State, or ZIP code',
	situationPrompt: 'Which side do you primarily represent?',
	intentOptions: ['buying', 'selling'] as RepresentationSide[],
	experiencePrompt: 'How long have you been licensed?',
	experienceOptions: yearsLicensedOptions.map((option) => option.slug),
	volumePrompt: 'How many transactions do you close per year?',
	volumeOptions: [...averageTransactionsOptions],
	pricePrompt: 'What is your typical price range?',
	priceOptions: [...priceOptions],
	clientPrompt: 'Where do you do your best work?',
	clientOptions: questionOptionSlugs(bestClientTypesQuestion),
	questionFlow: {
		...agentQuestionFlow,
		questions: agentQuestionFlow.questions.filter(
			(q) =>
				![
					'representationSide',
					'typicalPriceRange',
					'bestClientTypes',
				].includes(q.id),
		),
	},
	accent: 'amber',
} satisfies AgentFlowConfig

function getNextUnansweredQuestionIndex(
	questions: Question[],
	answers: Answers,
) {
	const nextIndex = questions.findIndex((q) => answers[q.id] === undefined)

	return nextIndex === -1 ? Math.max(questions.length - 1, 0) : nextIndex
}

function getServiceAreas(state: AgentFlowState): string[] {
	return [state.serviceArea1, state.serviceArea2, state.serviceArea3].filter(
		(area): area is string => Boolean(area),
	)
}

function getRepresentationIcon(side: RepresentationSide): Icon {
	if (side === 'buying') return UsersIcon
	if (side === 'selling') return ChartLineIcon
	return BriefcaseIcon
}

function getRepresentationLabel(side: RepresentationSide) {
	if (side === 'buying') return 'Buyers'
	if (side === 'selling') return 'Sellers'
	return 'Both'
}

function getExperienceLevel(slug: string) {
	if (slug === '0-2') return 1
	if (slug === '3-5') return 2
	if (slug === '6-10') return 3
	if (slug === '10+') return 4
	return 1
}

export function AgentIntro({
	config,
	state,
	direction,
	onUpdate,
	onContinue,
}: {
	config: AgentFlowConfig
	state: AgentFlowState
	direction: number
	onUpdate: (patch: Partial<AgentFlowState>) => void
	onContinue: () => void
}) {
	const [serviceAreas, setServiceAreas] = useState<string[]>(() =>
		getServiceAreas(state),
	)
	const [locationQuery, setLocationQuery] = useState('')
	const [locationOpen, setLocationOpen] = useState(false)
	const [priceIndex, setPriceIndex] = useState(() => {
		const storedIndex = config.priceOptions.findIndex(
			(option) => option.slug === state.typicalPriceRange,
		)
		return storedIndex >= 0 ? storedIndex : undefined
	})
	const [representationSide, setRepresentationSide] = useState<
		RepresentationSide | ''
	>(state.representationSide ?? '')
	const [hasTriedContinue, setHasTriedContinue] = useState(false)

	const typicalPriceRange =
		priceIndex !== undefined ? config.priceOptions[priceIndex]?.slug : undefined
	const marketComplete = serviceAreas.length > 0
	const priceComplete = typicalPriceRange !== undefined
	const sideComplete = representationSide.length > 0
	const canContinue = marketComplete && priceComplete && sideComplete
	const locationSuggestions = getLocationSuggestions(locationQuery)
	const showMarketError = hasTriedContinue && !marketComplete
	const showPriceError = hasTriedContinue && !priceComplete
	const showSideError = hasTriedContinue && !sideComplete
	const maxServiceAreas = 3

	const addServiceArea = (area: string) => {
		const trimmed = area.trim()
		if (!trimmed || serviceAreas.includes(trimmed)) return
		if (serviceAreas.length >= maxServiceAreas) return
		setServiceAreas((current) => [...current, trimmed])
		setLocationQuery('')
	}

	const removeServiceArea = (area: string) => {
		setServiceAreas((current) => current.filter((item) => item !== area))
	}

	const handleContinue = () => {
		if (
			!marketComplete ||
			!priceComplete ||
			!sideComplete ||
			!representationSide ||
			!typicalPriceRange
		) {
			setHasTriedContinue(true)
			return
		}

		onUpdate({
			serviceArea1: serviceAreas[0],
			serviceArea2: serviceAreas[1],
			serviceArea3: serviceAreas[2],
			typicalPriceRange,
			representationSide,
		} as Partial<AgentFlowState>)
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey="intro" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-8">
					<div className="space-y-2">
						<p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
							Step 1 of 3
						</p>
						<h2 className="font-heading flex items-center gap-2 text-xl font-semibold tracking-tight">
							<MapPinIcon className="h-5 w-5" />
							Your Market
						</h2>
					</div>

					{/* Service areas */}
					<div className="space-y-3">
						<div
							className={cn(
								'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-foreground',
								showMarketError
									? 'text-destructive'
									: marketComplete
										? 'text-primary'
										: 'text-foreground',
							)}
						>
							<AnimatedStatusIcon complete={marketComplete} icon={MapPinIcon} />
							Service areas
						</div>

						<div className="flex flex-wrap gap-2">
							{serviceAreas.map((area) => (
								<button
									key={area}
									type="button"
									onClick={() => removeServiceArea(area)}
									className="bg-primary/[0.06] text-primary border-primary/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium"
								>
									{area}
									<span className="text-primary/70">×</span>
								</button>
							))}
							{serviceAreas.length < maxServiceAreas ? (
								<Popover
									open={locationOpen}
									onOpenChange={(open) => {
										if (!open) setLocationQuery('')
										setLocationOpen(open)
									}}
								>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											aria-expanded={locationOpen}
											className="h-10 rounded-full px-4 text-sm"
										>
											{config.areaPrompt}
											<ChevronsUpDown className="text-muted-foreground ml-2 h-4 w-4 shrink-0" />
										</Button>
									</PopoverTrigger>
									<PopoverContent
										align="start"
										className="w-(--radix-popover-trigger-width) min-w-[260px] p-0"
									>
										<Command shouldFilter={false}>
											<CommandInput
												value={locationQuery}
												onValueChange={setLocationQuery}
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
																addServiceArea(value)
																setLocationOpen(false)
															}}
														>
															{suggestion}
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							) : null}
						</div>
						{showMarketError ? (
							<p className="text-destructive text-xs">
								Add at least one service area.
							</p>
						) : null}
					</div>

					{/* Price range & Representation side */}
					<div className="grid gap-6 sm:grid-cols-2">
						{/* Price range */}
						<div className="space-y-3">
							<div
								className={cn(
									'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-foreground',
									showPriceError
										? 'text-destructive'
										: priceComplete
											? 'text-primary'
											: 'text-foreground',
								)}
							>
								<AnimatedStatusIcon
									complete={priceComplete}
									icon={CurrencyDollarIcon}
								/>
								Price range
							</div>
							<div className="grid grid-cols-1 gap-2.5">
								{config.priceOptions.map((option, index) => {
									const isSelected = priceIndex === index

									return (
										<button
											key={option.slug}
											type="button"
											onClick={() => setPriceIndex(index)}
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
											{option.label}
										</button>
									)
								})}
							</div>
							{showPriceError ? (
								<p className="text-destructive text-xs">
									Choose a typical price range.
								</p>
							) : null}
						</div>

						{/* Representation side */}
						<div className="space-y-3">
							<div
								className={cn(
									'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-foreground',
									showSideError
										? 'text-destructive'
										: sideComplete
											? 'text-primary'
											: 'text-foreground',
								)}
							>
								<AnimatedStatusIcon
									complete={sideComplete}
									icon={BriefcaseIcon}
								/>
								Side
							</div>
							<div className="grid grid-cols-1 gap-2.5">
								{config.intentOptions.map((option) => {
									const isSelected = representationSide === option
									const SideIcon = getRepresentationIcon(option)
									const label = getRepresentationLabel(option)

									return (
										<button
											key={option}
											type="button"
											onClick={() => setRepresentationSide(option)}
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
											<SideIcon
												className={cn(
													'h-5 w-5 shrink-0',
													isSelected
														? 'text-primary'
														: 'text-muted-foreground group-hover:text-primary',
												)}
												weight="duotone"
											/>
											{label}
										</button>
									)
								})}
							</div>
							{showSideError ? (
								<p className="text-destructive text-xs">
									Choose a representation side.
								</p>
							) : null}
						</div>
					</div>

					<div className="space-y-4">
						<StepProgressHeader
							stepNumber={1}
							totalSteps={3}
							title="Your Market"
							titleIcon={MapPinIcon}
							items={[marketComplete, priceComplete, sideComplete]}
							showTitle={false}
						/>
						<div className="flex justify-center">
							<Button
								onClick={handleContinue}
								disabled={!canContinue}
								size="lg"
								className={cn(
									'gap-2 rounded-xl px-8 transition-all duration-300',
									canContinue
										? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg'
										: 'bg-muted text-muted-foreground',
								)}
							>
								Continue
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

export function AgentSituation({
	config,
	state,
	direction,
	onUpdate,
	onContinue,
}: {
	config: AgentFlowConfig
	state: AgentFlowState
	direction: number
	onUpdate: (patch: Partial<AgentFlowState>) => void
	onContinue: () => void
}) {
	const [bestClientTypes, setBestClientTypes] = useState<string[]>(
		state.bestClientTypes ?? [],
	)
	const [yearsLicensedIndex, setYearsLicensedIndex] = useState(() => {
		const storedIndex = yearsLicensedOptions.findIndex(
			(option) => option.slug === state.yearsLicensed,
		)
		return storedIndex >= 0 ? storedIndex : undefined
	})
	const [averageTransactionsIndex, setAverageTransactionsIndex] = useState(
		() => {
			const storedIndex = averageTransactionsOptions.findIndex(
				(option) => option.slug === state.averageTransactions,
			)
			return storedIndex >= 0 ? storedIndex : undefined
		},
	)

	const yearsLicensed =
		yearsLicensedIndex !== undefined
			? yearsLicensedOptions[yearsLicensedIndex]?.slug
			: undefined
	const averageTransactions =
		averageTransactionsIndex !== undefined
			? averageTransactionsOptions[averageTransactionsIndex]?.slug
			: undefined
	const clientsComplete = bestClientTypes.length > 0
	const yearsComplete = yearsLicensed !== undefined
	const volumeComplete = averageTransactions !== undefined
	const canContinue = clientsComplete && yearsComplete && volumeComplete

	const toggleClientType = (option: string) => {
		setBestClientTypes((current) =>
			current.includes(option)
				? current.filter((item) => item !== option)
				: [...current, option],
		)
	}

	const handleContinue = () => {
		if (!canContinue) return
		onUpdate({
			bestClientTypes,
			yearsLicensed,
			averageTransactions,
		})
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey="situation" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-8">
					<div className="space-y-2">
						<p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
							Step 2 of 3
						</p>
						<h2 className="font-heading text-xl font-semibold tracking-tight">
							Your experience
						</h2>
					</div>

					{/* Best client types */}
					<div className="space-y-3">
						<div
							className={cn(
								'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-foreground transition-colors',
								clientsComplete ? 'text-primary' : 'text-foreground',
							)}
						>
							<AnimatedStatusIcon complete={clientsComplete} icon={UsersIcon} />
							{config.clientPrompt}
						</div>
						<div className="grid grid-cols-1 gap-2.5">
							{config.clientOptions.map((option) => {
								const isSelected = bestClientTypes.includes(option)

								return (
									<button
										key={option}
										type="button"
										onClick={() => toggleClientType(option)}
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
										{questionOptionLabel(bestClientTypesQuestion, option)}
									</button>
								)
							})}
						</div>
					</div>

					{/* Years licensed & Volume */}
					<div className="grid gap-6 sm:grid-cols-2">
						{/* Years licensed */}
						<div className="space-y-3">
							<div
								className={cn(
									'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-foreground transition-colors',
									yearsComplete ? 'text-primary' : 'text-foreground',
								)}
							>
								<AnimatedStatusIcon
									complete={yearsComplete}
									icon={QuestionIcon}
								/>
								{config.experiencePrompt}
							</div>
							<div className="grid grid-cols-1 gap-2.5">
								{yearsLicensedOptions.map((option, index) => {
									const isSelected = yearsLicensedIndex === index
									const level = getExperienceLevel(option.slug)

									return (
										<button
											key={option.slug}
											type="button"
											onClick={() => setYearsLicensedIndex(index)}
											className={cn(
												'group relative flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition',
												isSelected
													? 'border-primary/30 bg-secondary shadow-sm'
													: 'border-border bg-card hover:border-primary/30 hover:shadow-sm',
											)}
											aria-pressed={isSelected}
										>
											<span
												className={cn(
													'absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-full border transition-colors',
													isSelected
														? 'border-primary/40 bg-white text-primary'
														: 'border-muted-foreground/25 bg-muted/30',
												)}
											>
												<Check
													className={cn(
														'h-2.5 w-2.5 transition-opacity',
														isSelected ? 'opacity-100' : 'opacity-0',
													)}
												/>
											</span>
											<span
												className={cn(
													'flex h-9 w-9 items-end justify-center gap-0.5 rounded-lg border pb-1.5 transition-colors',
													isSelected
														? 'border-primary/20 bg-white text-primary'
														: 'border-border bg-muted text-muted-foreground group-hover:border-primary/20 group-hover:text-primary',
												)}
											>
												{[1, 2, 3, 4].map((bar) => (
													<span
														key={bar}
														className={cn(
															'w-1 rounded-full',
															bar === 1 && 'h-2',
															bar === 2 && 'h-3',
															bar === 3 && 'h-4',
															bar === 4 && 'h-5',
															bar <= level ? 'bg-current' : 'bg-current/25',
														)}
													/>
												))}
											</span>
											<span className="text-foreground text-sm leading-snug font-medium">
												{option.label}
											</span>
										</button>
									)
								})}
							</div>
						</div>

						{/* Average transactions */}
						<div className="space-y-3">
							<div
								className={cn(
									'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-foreground transition-colors',
									volumeComplete ? 'text-primary' : 'text-foreground',
								)}
							>
								<AnimatedStatusIcon
									complete={volumeComplete}
									icon={ChartLineIcon}
								/>
								{config.volumePrompt}
							</div>
							<div className="grid grid-cols-1 gap-2.5">
								{averageTransactionsOptions.map((option, index) => {
									const isSelected = averageTransactionsIndex === index

									return (
										<button
											key={option.slug}
											type="button"
											onClick={() => setAverageTransactionsIndex(index)}
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
											{option.label}
										</button>
									)
								})}
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<StepProgressHeader
							stepNumber={2}
							totalSteps={3}
							title="Your experience"
							items={[clientsComplete, yearsComplete, volumeComplete]}
							showTitle={false}
						/>
						<div className="flex justify-center">
							<Button
								onClick={handleContinue}
								disabled={!canContinue}
								size="lg"
								className={cn(
									'rounded-xl px-8 transition-all duration-300',
									canContinue
										? 'shadow-md hover:shadow-lg'
										: 'bg-muted text-muted-foreground',
								)}
							>
								Continue
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

export function AgentQuiz({
	config,
	state,
	direction,
	onUpdate,
	onComplete,
}: {
	config: AgentFlowConfig
	state: AgentFlowState
	direction: number
	onUpdate: (patch: Partial<AgentFlowState>) => void
	onComplete: () => void
}) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() =>
		getNextUnansweredQuestionIndex(
			config.questionFlow.questions,
			state.answers,
		),
	)

	return (
		<AnimatedStepCard stepKey="quiz" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepProgressHeader
						stepNumber={3}
						totalSteps={3}
						title="Your style"
						activeIndex={currentQuestionIndex}
						items={config.questionFlow.questions.map(
							(q) =>
								state.answers[q.id] !== undefined &&
								state.answers[q.id] !== SKIPPED_ANSWER,
						)}
					/>
					<QuestionFlow
						questions={config.questionFlow.questions}
						titleVisibility="sr-only"
						mode="single-question"
						title="Step 3: Your Style"
						wrapper="wizard"
						answers={state.answers}
						currentQuestionIndex={currentQuestionIndex}
						onAnswersChange={(nextAnswers) =>
							onUpdate({ answers: nextAnswers })
						}
						onQuestionIndexChange={setCurrentQuestionIndex}
						onComplete={onComplete}
						completeTo="/agent/profile"
						completeLabel="Continue"
						navigateOnComplete={false}
					/>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

export function AgentPriorities({
	config,
	state,
	onUpdate,
}: {
	config: AgentFlowConfig
	state: AgentFlowState
	onUpdate: (patch: Partial<AgentFlowState>) => void
}) {
	const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
		state.matchPriorities ?? [],
	)
	const canContinue = selectedPriorities.length > 0

	const answeredQuestions = config.questionFlow.questions.filter(
		(q) =>
			state.answers[q.id] !== undefined &&
			state.answers[q.id] !== SKIPPED_ANSWER,
	)
	const maxSelections = 2

	const togglePriority = (questionId: string) => {
		setSelectedPriorities((current) => {
			if (current.includes(questionId)) {
				return current.filter((item) => item !== questionId)
			}
			if (current.length >= maxSelections) return current
			return [...current, questionId]
		})
	}

	return (
		<Card size="sm" className="shadow-sm">
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
						Priorities
					</p>
					<h2 className="font-heading text-xl font-semibold tracking-tight">
						What matters most?
					</h2>
					<p className="text-muted-foreground text-sm leading-relaxed">
						Pick up to 2 answers we should prioritize when matching you with
						consumers.
					</p>
				</div>

				<div className="space-y-2">
					{answeredQuestions.map((question) => {
						const isSelected = selectedPriorities.includes(question.id)
						const rank = selectedPriorities.indexOf(question.id) + 1
						const atLimit =
							!isSelected && selectedPriorities.length >= maxSelections

						return (
							<button
								key={question.id}
								type="button"
								disabled={atLimit}
								onClick={() => togglePriority(question.id)}
								className={cn(
									'flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition',
									isSelected
										? 'border-primary/60 bg-primary/5 shadow-sm'
										: atLimit
											? 'border-border bg-muted/30 opacity-50'
											: 'border-border bg-background hover:border-foreground/20 hover:bg-muted/30',
								)}
								aria-pressed={isSelected}
							>
								<div
									className={cn(
										'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
										isSelected
											? 'border-primary bg-transparent text-primary'
											: 'border-muted-foreground/30',
									)}
								>
									{isSelected ? <Check className="h-3.5 w-3.5" /> : null}
								</div>
								<div className="min-w-0 flex-1 space-y-0.5">
									<p className="text-muted-foreground text-xs">
										{question.title}
									</p>
									<p className="text-sm font-medium">
										{getAnswerSummary(question, state.answers[question.id]!)}
									</p>
								</div>
								{isSelected ? (
									<span className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
										{rank}
									</span>
								) : null}
							</button>
						)
					})}
				</div>

				<div className="flex justify-end">
					{canContinue ? (
						<Button asChild>
							<Link
								to="/agent/profile"
								onClick={() => {
									onUpdate({ matchPriorities: selectedPriorities })
								}}
							>
								Continue to profile
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					) : (
						<Button disabled>
							Continue to profile
							<ArrowRight className="h-4 w-4" />
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

function AgentLeaveDialog({
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
						Your answers are saved in this browser, but you will leave the quiz.
						You can come back and continue any time.
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

export function AgentIntake({
	config,
	step,
	reset = false,
}: {
	config: AgentFlowConfig
	step: AgentFlowStep
	reset?: boolean
}) {
	const navigate = useNavigate()
	const currentIndex = stepOrder.indexOf(step)
	const [state, setState] = useState<AgentFlowState>(() => {
		if (reset) return { answers: {} }
		const draft = loadAgentDraft()
		return draft ? { ...draft } : { answers: {} }
	})
	const [direction, setDirection] = useState(1)
	const previousIndexRef = useRef(currentIndex)
	const hasDraft =
		Object.keys(state.answers).length > 0 ||
		state.serviceArea1 !== undefined ||
		state.representationSide !== undefined

	const [showLeaveDialog, setShowLeaveDialog] = useState(false)

	const updateState = (patch: Partial<AgentFlowState>) => {
		setState((current) => {
			const next = { ...current, ...patch }
			saveAgentDraft(next as AgentDraft)
			return next
		})
	}

	const handleComplete = () => {
		saveAgentDraft(state as AgentDraft)
		void navigate({ to: '/agent/priorities' })
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
			to: `${config.basePath}/intake`,
			search: { step: nextStep },
		})
	}

	const progress = (() => {
		switch (step) {
			case 'intro':
				return <FlowIntakeProgress steps={agentFlowSteps} current="intro" />
			case 'situation':
				return <FlowIntakeProgress steps={agentFlowSteps} current="situation" />
			case 'quiz':
				return <FlowIntakeProgress steps={agentFlowSteps} current="quiz" />
		}
	})()

	return (
		<>
			<WizardShell
				steps={agentFlowSteps}
				currentStepId={step}
				progress={progress}
				onHomeClick={handleHomeClick}
			>
				{step === 'intro' ? (
					<AgentIntro
						config={config}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('situation')}
					/>
				) : step === 'situation' ? (
					<AgentSituation
						config={config}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('quiz')}
					/>
				) : (
					<AgentQuiz
						config={config}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onComplete={handleComplete}
					/>
				)}
			</WizardShell>
			<AgentLeaveDialog
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
