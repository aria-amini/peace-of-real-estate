import { Link, useNavigate } from '@tanstack/react-router'
import {
	ArrowsLeftRightIcon,
	BarnIcon,
	BuildingApartmentIcon,
	BuildingIcon,
	ClockIcon,
	CurrencyDollarIcon,
	HouseLineIcon,
	MapPinIcon,
	QuestionIcon,
	TagIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import * as zipcodes from 'zipcodes'
import {
	ArrowRight,
	Check,
	CheckCircle2,
	ChevronsUpDown,
	CreditCard,
	ListChecks,
	TriangleAlert,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { QuestionFlow } from '@/components/question-flow'
import { WizardShell } from '@/components/wizard-shell'
import type { MatchDetails } from '@/components/match-card-variants'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { upgradeToPremium } from '@/lib/premium'

function StepProgressHeader({
	stepNumber,
	totalSteps,
	title,
	items,
	activeIndex,
	titleIcon: TitleIcon,
	showTitle = true,
}: {
	stepNumber: number
	totalSteps: number
	title: string
	items: boolean[]
	activeIndex?: number
	titleIcon?: Icon
	showTitle?: boolean
}) {
	const completedCount = items.filter(Boolean).length
	const total = items.length
	const isComplete = completedCount === total

	return (
		<div className="space-y-2">
			{showTitle && (
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
							Step {stepNumber} of {totalSteps}
						</p>
						<h2 className="font-heading flex items-center gap-2 text-xl font-semibold tracking-tight">
							{TitleIcon && <TitleIcon className="h-5 w-5" />}
							{title}
						</h2>
					</div>
				</div>
			)}
			<div className="flex flex-col items-center gap-1.5">
				<div className="flex items-center gap-2.5">
					{Array.from({ length: total }).map((_, index) => {
						const isActive = activeIndex === index
						const isCompleted = index < completedCount
						return (
							<div
								key={index}
								className={cn(
									'h-2.5 w-2.5 rounded-full transition-all duration-300',
									isCompleted ? 'bg-primary' : 'bg-muted',
									isActive &&
										'ring-primary ring-2 ring-offset-2 ring-offset-background scale-110',
								)}
							/>
						)
					})}
				</div>
				<span
					className={cn(
						'text-xs font-bold transition-colors',
						isComplete ? 'text-primary' : 'text-muted-foreground',
					)}
				>
					{Math.max(completedCount, 1)} of {total}
				</span>
			</div>
		</div>
	)
}

function AnimatedStatusIcon({
	complete,
	icon: Icon,
	className,
}: {
	complete: boolean
	icon: React.ElementType
	className?: string
}) {
	return (
		<span
			className={cn(
				'relative flex h-5 w-5 items-center justify-center',
				className,
			)}
		>
			<span
				className={cn(
					'absolute inset-0 flex items-center justify-center rounded-full border transition-all duration-300',
					'border-foreground/20 bg-foreground/5 text-foreground/70',
					complete ? 'scale-50 opacity-0' : 'scale-100 opacity-100',
				)}
			>
				<Icon className="h-3 w-3" weight="duotone" />
			</span>
			<span
				className={cn(
					'absolute inset-0 flex items-center justify-center rounded-full border transition-all duration-300',
					'border-primary bg-primary/[0.04] text-primary',
					complete ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
				)}
			>
				<Check className="h-3 w-3" />
			</span>
		</span>
	)
}
import type { RepresentationSide } from '@/lib/matching/profile.types'
import {
	loadConsumerDraft,
	saveConsumerDraft,
	type ConsumerDraft,
} from '@/lib/consumer-draft-storage'
import {
	consumerQuestionFlow,
	getAnswerSummary,
	propertyTypeOptions,
	questionOptionLabel,
	questionOptionSlugs,
	type Answers,
	type Question,
	type QuestionFlow as MatchingQuestionFlow,
} from '@/lib/matching/questions'

function getNextUnansweredQuestionIndex(
	questions: Question[],
	answers: Answers,
) {
	const nextIndex = questions.findIndex((q) => answers[q.id] === undefined)

	return nextIndex === -1 ? Math.max(questions.length - 1, 0) : nextIndex
}

type ConsumerFlowState = {
	location?: string
	state?: string
	priceRange?: string
	propertyTypes?: string[]
	intent?: RepresentationSide
	experienceLevel?: string
	matchPriorities?: string[]
	answers: Answers
}

type ConsumerFlowConfig = {
	basePath: '/consumer'
	label: 'Consumer'
	areaPrompt: string
	situationPrompt: string
	intentOptions: RepresentationSide[]
	experiencePrompt: string
	experienceOptions: string[]
	pricePrompt: string
	priceOptions: { slug: string; label: string }[]
	propertyPrompt: string
	propertyOptions: string[]
	questionFlow: MatchingQuestionFlow
	accent: 'navy' | 'amber'
}

type ConsumerFlowStep = 'intro' | 'situation' | 'quiz'
const SKIPPED_ANSWER = '__skipped__'

const consumerFlowSteps: { id: ConsumerFlowStep; label: string }[] = [
	{ id: 'intro', label: 'Home' },
	{ id: 'situation', label: 'Situation' },
	{ id: 'quiz', label: 'Preferences' },
]

const stepOrder: ConsumerFlowStep[] = ['intro', 'situation', 'quiz']

const cardVariants = {
	enter: (direction: number) => ({
		y: direction > 0 ? '100%' : '-40%',
		opacity: 0,
		scale: 0.96,
	}),
	center: {
		y: 0,
		opacity: 1,
		scale: 1,
	},
	exit: (direction: number) => ({
		y: direction > 0 ? '-40%' : '60%',
		opacity: 0,
		scale: 0.96,
	}),
}

function AnimatedStepCard({
	children,
	stepKey,
	direction,
}: {
	children: React.ReactNode
	stepKey: string
	direction: number
}) {
	return (
		<div className="relative overflow-hidden">
			<AnimatePresence mode="wait" custom={direction}>
				<motion.div
					key={stepKey}
					custom={direction}
					variants={cardVariants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{
						y: { type: 'spring', stiffness: 320, damping: 30 },
						opacity: { duration: 0.25 },
						scale: { duration: 0.25 },
					}}
				>
					{children}
				</motion.div>
			</AnimatePresence>
		</div>
	)
}

function ConsumerIntakeProgress({
	current,
	currentStepProgress = 1,
}: {
	current: ConsumerFlowStep
	currentStepProgress?: number
}) {
	const currentIndex = consumerFlowSteps.findIndex(
		(step) => step.id === current,
	)
	const clampedCurrentStepProgress = Math.min(
		Math.max(currentStepProgress, 0),
		1,
	)

	return (
		<div
			className="grid grid-cols-3 gap-3"
			aria-label={`Step ${currentIndex + 1} of ${consumerFlowSteps.length}`}
		>
			{consumerFlowSteps.map((step, index) => {
				const isCurrent = index === currentIndex
				const isComplete = index < currentIndex
				const fillPercent = isComplete
					? 100
					: isCurrent
						? clampedCurrentStepProgress * 100
						: 0

				return (
					<div
						key={step.id}
						className={cn(
							'space-y-2 transition-opacity',
							isCurrent || isComplete ? 'opacity-100' : 'opacity-45',
						)}
					>
						<div className="bg-muted-foreground/15 h-1.5 overflow-hidden rounded-full">
							<div
								className={cn(
									'h-full origin-left rounded-full transition-all duration-700 ease-out',
									isComplete ? 'bg-primary/70' : 'bg-primary',
								)}
								style={{ width: `${fillPercent}%` }}
							/>
						</div>
						<p
							className={cn(
								'flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase transition-colors',
								isCurrent
									? 'text-primary'
									: isComplete
										? 'text-primary/75'
										: 'text-muted-foreground',
							)}
						>
							<span
								className={cn(
									'flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
									isCurrent
										? 'bg-primary text-primary-foreground'
										: isComplete
											? 'bg-primary/15 text-primary'
											: 'bg-muted text-muted-foreground',
								)}
							>
								{index + 1}
							</span>
							<span>{step.label}</span>
						</p>
					</div>
				)
			})}
		</div>
	)
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

const experienceQuestion = consumerQuestionFlow.questions.find(
	(q) => q.id === 'experienceLevel',
)!

export const consumerConfig = {
	basePath: '/consumer',
	label: 'Consumer',
	areaPrompt: 'City, State, or ZIP code',
	situationPrompt: 'What do you want to do?',
	intentOptions: ['buying', 'selling', 'both'],
	experiencePrompt: 'What is your experience level?',
	experienceOptions: questionOptionSlugs(experienceQuestion),
	pricePrompt: 'What price range are you considering?',
	priceOptions: [...priceOptions],
	propertyPrompt: 'What type of home are you looking for?',
	propertyOptions: Object.keys(propertyTypeOptions),
	questionFlow: {
		...consumerQuestionFlow,
		questions: consumerQuestionFlow.questions.filter(
			(q) => q.id !== 'experienceLevel',
		),
	},
	accent: 'navy',
} satisfies ConsumerFlowConfig

export const consumerMatches: MatchDetails[] = [
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
		avatar: 'https://i.pravatar.cc/150?u=sarah-chen',
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
		avatar: 'https://i.pravatar.cc/150?u=marcus-johnson',
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
	{
		id: 'consumer-3',
		name: 'Elena Rodriguez',
		role: 'agent',
		location: 'Austin, TX',
		zipCodes: ['78701'],
		fitScore: 88,
		status: 'new',
		date: 'Just now',
		experience: '6 years',
		agency: 'Coastal Living Realty',
		avatar: 'https://i.pravatar.cc/150?u=elena-rodriguez',
		specialties: ['Waterfront', 'Condos', 'Vacation Homes'],
		about:
			'Elena brings a fresh perspective to real estate. Her background in interior design helps clients envision the potential in every property she shows.',
		scores: {
			'Working Style': 4.5,
			Communication: 4.6,
			Transparency: 4.4,
			Fit: 4.5,
		},
		isTopMatch: false,
	},
]

function getPropertyIcon(slug: string): Icon {
	if (slug === 'singleFamily') return HouseLineIcon
	if (slug === 'condoTownhome') return BuildingIcon
	if (slug === 'land') return BarnIcon
	if (slug === 'multiFamily') return BuildingApartmentIcon
	return QuestionIcon
}

function getIntentIcon(intent: RepresentationSide): Icon {
	if (intent === 'buying') return HouseLineIcon
	if (intent === 'selling') return TagIcon
	if (intent === 'both') return ArrowsLeftRightIcon
	return QuestionIcon
}

function getIntentLabel(intent: RepresentationSide) {
	if (intent === 'buying') return 'Buy'
	if (intent === 'selling') return 'Sell'
	return 'Buy then Sell'
}

function getExperienceLevel(slug: string) {
	if (slug === 'firstTime') return 1
	if (slug === 'experienced') return 2
	if (slug === 'veryExperienced') return 3
	return 1
}

function deriveStateFromLocation(location: string): string | undefined {
	const trimmed = location.trim()
	if (!trimmed) return undefined

	// Direct 5-digit ZIP lookup
	const zipMatch = trimmed.match(/\b(\d{5})\b/)
	if (zipMatch) {
		const record = zipcodes.lookup(zipMatch[1] as string)
		if (record?.state) return record.state
	}

	// "City, ST" or "ST"
	const parts = trimmed.split(',').map((s) => s.trim())
	const lastPart = parts.at(-1)
	if (lastPart) {
		const normalized = zipcodes.states.normalize(lastPart)
		if (normalized) return normalized
	}

	return undefined
}

export function ConsumerIntro({
	config,
	state,
	direction,
	onUpdate,
	onContinue,
}: {
	config: ConsumerFlowConfig
	state: ConsumerFlowState
	direction: number
	onUpdate: (patch: Partial<ConsumerFlowState>) => void
	onContinue: () => void
}) {
	const [committedLocation, setCommittedLocation] = useState(
		state.location ?? '',
	)
	const [locationQuery, setLocationQuery] = useState(state.location ?? '')
	const [locationEdited, setLocationEdited] = useState(false)
	const [locationOpen, setLocationOpen] = useState(false)
	const [hasTriedContinue, setHasTriedContinue] = useState(false)
	const [priceIndex, setPriceIndex] = useState(() => {
		const storedIndex = config.priceOptions.findIndex(
			(option) => option.slug === state.priceRange,
		)
		return storedIndex >= 0 ? storedIndex : undefined
	})
	const [propertyTypes, setPropertyTypes] = useState<string[]>(
		state.propertyTypes ?? [],
	)
	const priceRange =
		priceIndex !== undefined ? config.priceOptions[priceIndex]?.slug : undefined
	const marketComplete = committedLocation.trim().length >= 2
	const priceComplete = priceRange !== undefined
	const propertyComplete = propertyTypes.length > 0
	const effectiveLocation = (
		locationEdited ? locationQuery : committedLocation
	).trim()
	const canContinue =
		effectiveLocation.length >= 2 && priceComplete && propertyComplete
	const locationSuggestions = getLocationSuggestions(locationQuery)
	const showMarketError = hasTriedContinue && !marketComplete
	const showPriceError = hasTriedContinue && !priceComplete
	const showPropertyError = hasTriedContinue && !propertyComplete

	const handleContinue = () => {
		const finalLocation = (
			locationEdited ? locationQuery : committedLocation
		).trim()
		const finalMarketComplete = finalLocation.length >= 2
		const finalCanContinue =
			finalMarketComplete && priceComplete && propertyComplete

		if (!finalCanContinue) {
			setHasTriedContinue(true)
			return
		}

		const derivedState = deriveStateFromLocation(finalLocation)

		onUpdate({
			location: finalLocation,
			...(derivedState ? { state: derivedState } : {}),
			priceRange,
			propertyTypes,
		})
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
							<HouseLineIcon className="h-5 w-5" />
							Your Home
						</h2>
					</div>

					{/* Location */}
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
							Location
						</div>
						<Popover
							open={locationOpen}
							onOpenChange={(open) => {
								if (!open) {
									setCommittedLocation(locationQuery)
									setLocationEdited(false)
								}
								setLocationOpen(open)
							}}
						>
							<PopoverTrigger asChild>
								<Button
									id="consumer-location"
									variant="outline"
									aria-expanded={locationOpen}
									className={cn(
										'h-14 w-full justify-between rounded-xl px-4 text-left text-base font-medium transition',
										marketComplete
											? 'border-primary/60 bg-primary/[0.04] hover:bg-primary/[0.06]'
											: 'border-border bg-card hover:bg-muted/30',
									)}
								>
									<span
										className={cn(
											!committedLocation && 'text-muted-foreground',
											'truncate',
										)}
									>
										{committedLocation || config.areaPrompt}
									</span>
									<ChevronsUpDown className="text-muted-foreground h-4 w-4 shrink-0" />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								align="start"
								className="w-(--radix-popover-trigger-width) min-w-[260px] p-0"
							>
								<Command shouldFilter={false}>
									<CommandInput
										value={locationQuery}
										onValueChange={(value) => {
											setLocationQuery(value)
											setLocationEdited(true)
										}}
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
														setCommittedLocation(value)
														setLocationQuery(value)
														setLocationEdited(false)
														setLocationOpen(false)
													}}
												>
													<Check
														className={cn(
															committedLocation === suggestion
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
						{showMarketError ? (
							<p className="text-destructive text-xs">
								Enter a city, state, or ZIP.
							</p>
						) : null}
					</div>

					{/* Budget & Home type */}
					<div className="grid gap-6 sm:grid-cols-2">
						{/* Budget */}
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
								Budget
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
									Choose a price range.
								</p>
							) : null}
						</div>

						{/* Home type */}
						<div className="space-y-3">
							<div
								className={cn(
									'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-foreground',
									showPropertyError
										? 'text-destructive'
										: propertyComplete
											? 'text-primary'
											: 'text-foreground',
								)}
							>
								<AnimatedStatusIcon
									complete={propertyComplete}
									icon={HouseLineIcon}
								/>
								Home type
							</div>
							<div className="grid grid-cols-1 gap-2.5">
								{config.propertyOptions.map((option) => {
									const isSelected = propertyTypes.includes(option)
									const PropertyIcon = getPropertyIcon(option)

									return (
										<button
											key={option}
											type="button"
											onClick={() => {
												setPropertyTypes((current) =>
													current.includes(option)
														? current.filter((item) => item !== option)
														: [...current, option],
												)
											}}
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
											<PropertyIcon
												className={cn(
													'h-5 w-5 shrink-0',
													isSelected
														? 'text-primary'
														: 'text-muted-foreground group-hover:text-primary',
												)}
												weight="duotone"
											/>
											{
												propertyTypeOptions[
													option as keyof typeof propertyTypeOptions
												]
											}
										</button>
									)
								})}
							</div>
							{showPropertyError ? (
								<p className="text-destructive text-xs">
									Choose at least one property type.
								</p>
							) : null}
						</div>
					</div>

					<div className="space-y-4">
						<StepProgressHeader
							stepNumber={1}
							totalSteps={3}
							title="Your Home"
							titleIcon={HouseLineIcon}
							items={[marketComplete, priceComplete, propertyComplete]}
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

export function ConsumerSituation({
	config,
	state,
	direction,
	onUpdate,
	onContinue,
}: {
	config: ConsumerFlowConfig
	state: ConsumerFlowState
	direction: number
	onUpdate: (patch: Partial<ConsumerFlowState>) => void
	onContinue: () => void
}) {
	const [intent, setIntent] = useState<RepresentationSide | ''>(
		state.intent ?? '',
	)
	const [experienceLevel, setExperienceLevel] = useState(
		state.experienceLevel ?? '',
	)
	const canContinue = intent.length > 0 && experienceLevel.length > 0

	const handleContinue = () => {
		if (!canContinue || !intent) return
		onUpdate({
			intent,
			experienceLevel,
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
							Your situation
						</h2>
					</div>

					{/* Intent */}
					<div className="space-y-3">
						<div
							className={cn(
								'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-foreground transition-colors',
								intent.length > 0 ? 'text-primary' : 'text-foreground',
							)}
						>
							<AnimatedStatusIcon
								complete={intent.length > 0}
								icon={ClockIcon}
							/>
							{config.situationPrompt}
						</div>
						<div className="grid gap-3 sm:grid-cols-3">
							{config.intentOptions.map((option) => {
								const isSelected = intent === option
								const IntentIcon = getIntentIcon(option)
								const label = getIntentLabel(option)

								return (
									<button
										key={option}
										type="button"
										onClick={() => setIntent(option)}
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
												'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
												isSelected
													? 'border-primary/20 bg-white text-primary'
													: 'border-border bg-muted text-muted-foreground group-hover:border-primary/20 group-hover:text-primary',
											)}
										>
											<IntentIcon className="h-5 w-5" weight="duotone" />
										</span>
										<span className="text-foreground text-sm leading-snug font-medium">
											{label}
										</span>
									</button>
								)
							})}
						</div>
					</div>

					{/* Experience */}
					<div className="space-y-3">
						<div
							className={cn(
								'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-foreground transition-colors',
								experienceLevel.length > 0 ? 'text-primary' : 'text-foreground',
							)}
						>
							<AnimatedStatusIcon
								complete={experienceLevel.length > 0}
								icon={QuestionIcon}
							/>
							{config.experiencePrompt}
						</div>
						<div className="grid gap-3 sm:grid-cols-3">
							{config.experienceOptions.map((option) => {
								const isSelected = experienceLevel === option
								const level = getExperienceLevel(option)

								return (
									<button
										key={option}
										type="button"
										onClick={() => setExperienceLevel(option)}
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
											{[1, 2, 3].map((bar) => (
												<span
													key={bar}
													className={cn(
														'w-1 rounded-full',
														bar === 1 && 'h-2',
														bar === 2 && 'h-3',
														bar === 3 && 'h-4',
														bar <= level ? 'bg-current' : 'bg-current/25',
													)}
												/>
											))}
										</span>
										<span className="text-foreground text-sm leading-snug font-medium">
											{questionOptionLabel(experienceQuestion, option)}
										</span>
									</button>
								)
							})}
						</div>
					</div>

					<div className="space-y-4">
						<StepProgressHeader
							stepNumber={2}
							totalSteps={3}
							title="Your situation"
							items={[intent.length > 0, experienceLevel.length > 0]}
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

export function ConsumerQuiz({
	config,
	state,
	direction,
	onUpdate,
	onComplete,
}: {
	config: ConsumerFlowConfig
	state: ConsumerFlowState
	direction: number
	onUpdate: (patch: Partial<ConsumerFlowState>) => void
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
						title="Your preferences"
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
						title="Step 3: Your Agent"
						wrapper="wizard"
						answers={state.answers}
						currentQuestionIndex={currentQuestionIndex}
						onAnswersChange={(nextAnswers) =>
							onUpdate({ answers: nextAnswers })
						}
						onQuestionIndexChange={setCurrentQuestionIndex}
						onComplete={onComplete}
						completeTo="/consumer/preview"
						completeLabel="Continue"
						navigateOnComplete={false}
					/>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

function ConsumerLeaveDialog({
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

export function ConsumerIntake({
	config,
	step,
	reset = false,
}: {
	config: ConsumerFlowConfig
	step: ConsumerFlowStep
	reset?: boolean
}) {
	const navigate = useNavigate()
	const currentIndex = stepOrder.indexOf(step)
	const [state, setState] = useState<ConsumerFlowState>(() => {
		if (reset) return { answers: {} }
		const draft = loadConsumerDraft()
		return draft ? { ...draft } : { answers: {} }
	})
	const [direction, setDirection] = useState(1)
	const [showLeaveDialog, setShowLeaveDialog] = useState(false)
	const previousIndexRef = useRef(currentIndex)
	const hasDraft =
		Object.keys(state.answers).length > 0 ||
		state.location !== undefined ||
		state.intent !== undefined

	const updateState = (patch: Partial<ConsumerFlowState>) => {
		setState((current) => {
			const next = { ...current, ...patch }
			saveConsumerDraft(next as ConsumerDraft)
			return next
		})
	}

	const handleComplete = () => {
		saveConsumerDraft(state as ConsumerDraft)
		void navigate({ to: '/consumer/preview' })
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
			to: `${config.basePath}/intake`,
			search: { step: nextStep },
		})
	}

	const progress = (() => {
		switch (step) {
			case 'intro':
				return <ConsumerIntakeProgress current="intro" />
			case 'situation':
				return <ConsumerIntakeProgress current="situation" />
			case 'quiz':
				return <ConsumerIntakeProgress current="quiz" />
		}
	})()

	return (
		<>
			<WizardShell
				steps={consumerFlowSteps}
				currentStepId={step}
				progress={progress}
				onHomeClick={handleHomeClick}
			>
				{step === 'intro' ? (
					<ConsumerIntro
						config={config}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('situation')}
					/>
				) : step === 'situation' ? (
					<ConsumerSituation
						config={config}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('quiz')}
					/>
				) : (
					<ConsumerQuiz
						config={config}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onComplete={handleComplete}
					/>
				)}
			</WizardShell>
			<ConsumerLeaveDialog
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

export function ConsumerPriorities({
	config,
	state,
	onUpdate,
}: {
	config: ConsumerFlowConfig
	state: ConsumerFlowState
	onUpdate: (patch: Partial<ConsumerFlowState>) => void
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
		<FlowPageShell
			title="What matters most?"
			subtitle="Pick up to 2 answers we should prioritize when ranking your matches."
			icon={ListChecks}
			headerInsideCard
		>
			<div className="space-y-4">
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
			</div>

			<div className="mt-4 flex justify-end">
				{canContinue ? (
					<Button asChild>
						<Link
							to="/matches"
							onClick={() => {
								onUpdate({ matchPriorities: selectedPriorities })
							}}
						>
							Preview my match
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				) : (
					<Button disabled>
						Preview my match
						<ArrowRight className="h-4 w-4" />
					</Button>
				)}
			</div>
		</FlowPageShell>
	)
}

export function ConsumerPayment() {
	const [isProcessing, setIsProcessing] = useState(false)
	const [isComplete, setIsComplete] = useState(false)

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
						<Link to="/matches">
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
