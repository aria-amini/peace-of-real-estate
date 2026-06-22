import { Link, useNavigate } from '@tanstack/react-router'
import {
	ArrowsLeftRightIcon,
	BarnIcon,
	BuildingApartmentIcon,
	BuildingIcon,
	ClockIcon,
	HouseLineIcon,
	MapPinIcon,
	QuestionIcon,
	TagIcon,
	UserIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import {
	ArrowRight,
	Check,
	CheckCircle2,
	ChevronsUpDown,
	CreditCard,
	ListChecks,
	TriangleAlert,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import type { FeatureCollection } from 'geojson'

import { FlowPageShell } from '@/components/flow/page-shell'
import {
	AnimatedStepCard,
	FlowIntakeProgress,
	StepProgressHeader,
} from '@/components/flow/shared'
import { PriceInput } from '@/components/flow/price-range'
import { QuestionFlow } from '@/components/flow/question-flow'
import { WizardShell } from '@/components/flow/wizard-shell'
import { ZipCodeSelector } from '@/components/maps'
import type { MatchDetails } from '@/components/match/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { upgradeToPremium } from '@/lib/premium'
import {
	DEFAULT_PRICE_RANGE,
	formatPriceCompact,
	formatPriceRange,
	parsePriceRange,
	PRICE_MAX,
	PRICE_MIN,
	PRICE_STEP,
	serializePriceRange,
} from '@/lib/price-range'
import {
	loadCityCenter,
	loadCitySuggestions,
	loadCityZipCodes,
	loadZipCodeBoundaries,
} from '@/lib/zip-code-data'

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
	city?: string
	location?: string
	state?: string
	zipCodes?: string[]
	priceRange?: string
	timeline?: string
	propertyTypes?: string[]
	intent?: RepresentationSide
	experienceLevel?: string
	matchPriorities?: string[]
	answers: Answers
}

type ConsumerFlowConfig = {
	basePath: '/consumer'
	label: 'Consumer'
	intentOptions: RepresentationSide[]
	timelineOptions: { slug: string; label: string }[]
	propertyPrompt: string
	propertyOptions: string[]
	questionFlow: MatchingQuestionFlow
	accent: 'navy' | 'amber'
}

type ConsumerFlowStep = 'intro' | 'intent' | 'home' | 'quiz'
const SKIPPED_ANSWER = '__skipped__'

const consumerFlowSteps: { id: ConsumerFlowStep; label: string; icon: Icon }[] =
	[
		{ id: 'intro', label: 'Situation', icon: ClockIcon },
		{ id: 'intent', label: 'Location', icon: MapPinIcon },
		{ id: 'home', label: 'Home', icon: HouseLineIcon },
		{ id: 'quiz', label: 'Preferences', icon: UserIcon },
	]

const stepOrder: ConsumerFlowStep[] = ['intro', 'intent', 'home', 'quiz']

function parseCityState(
	location: string,
): { city: string; state: string } | undefined {
	const [cityName, rest] = location.split(',').map((part) => part.trim())
	if (!cityName || !rest) return undefined
	const state = rest.split(/\s+/)[0]
	if (!state || state.length !== 2) return undefined
	return { city: cityName, state: state.toUpperCase() }
}

function isValidZipCode(zipCode: string) {
	return /^\d{5}$/.test(zipCode)
}

const timelineOptions = [
	{ slug: 'exploring', label: 'Just exploring' },
	{ slug: '1month', label: '1 month' },
	{ slug: '2months', label: '2 months' },
	{ slug: '3months', label: '3 months' },
	{ slug: '4months', label: '4 months' },
	{ slug: '5months', label: '5 months' },
	{ slug: '6months', label: '6 months' },
	{ slug: '7months', label: '7 months' },
	{ slug: '8months', label: '8 months' },
	{ slug: '9months', label: '9 months' },
	{ slug: '10months', label: '10 months' },
	{ slug: '11months', label: '11 months' },
	{ slug: '12monthsPlus', label: '12+ months' },
] as const

export const consumerConfig = {
	basePath: '/consumer',
	label: 'Consumer',
	intentOptions: ['buying', 'selling', 'both'],
	timelineOptions: [...timelineOptions],
	propertyPrompt: 'What type of home are you looking for?',
	propertyOptions: Object.keys(propertyTypeOptions),
	questionFlow: consumerQuestionFlow,
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

export function ConsumerLocation({
	config: _config,
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
	const rawInitialLocation = state.city ?? state.location ?? ''
	const normalizedInitialLocation = (() => {
		const parsed = parseCityState(rawInitialLocation)
		return parsed ? `${parsed.city}, ${parsed.state}` : rawInitialLocation
	})()
	const [committedLocation, setCommittedLocation] = useState(
		normalizedInitialLocation,
	)
	const [locationQuery, setLocationQuery] = useState(normalizedInitialLocation)
	const [locationOpen, setLocationOpen] = useState(false)
	const [selectedZipCodes, setSelectedZipCodes] = useState<string[]>(
		state.zipCodes ?? [],
	)
	const [manualZipCode, setManualZipCode] = useState('')
	const [hasTriedContinue, setHasTriedContinue] = useState(false)
	const marketComplete = committedLocation.trim().length >= 2
	const canContinue = marketComplete
	const showMarketError = hasTriedContinue && !marketComplete
	const cityState = parseCityState(committedLocation)

	const { data: locationSuggestions = [] } = useQuery({
		queryKey: ['city-suggestions', locationQuery],
		queryFn: () => loadCitySuggestions(locationQuery),
		enabled: locationQuery.trim().length >= 0,
		staleTime: 1000 * 60 * 60,
	})

	const { data: _cityZipCodes = [] } = useQuery({
		queryKey: ['city-zip-codes', committedLocation],
		queryFn: async () => {
			if (!cityState) return []
			return loadCityZipCodes(cityState)
		},
		enabled: marketComplete && Boolean(cityState),
		staleTime: 1000 * 60 * 60,
	})

	const displayZipCodes = selectedZipCodes

	const { data: boundaries } = useQuery({
		queryKey: ['zip-code-boundaries', committedLocation],
		queryFn: async () => {
			if (!cityState) {
				return {
					type: 'FeatureCollection',
					features: [],
				} satisfies FeatureCollection
			}
			return loadZipCodeBoundaries(cityState)
		},
		enabled: marketComplete && Boolean(cityState),
		staleTime: 1000 * 60 * 60,
	})

	const { data: centerForCity } = useQuery({
		queryKey: ['city-center', committedLocation],
		queryFn: async () => {
			if (!cityState) return undefined
			return loadCityCenter(cityState)
		},
		enabled: marketComplete && Boolean(cityState),
		staleTime: 1000 * 60 * 60,
	})

	const toggleZipCode = (zipCode: string) => {
		setSelectedZipCodes((current) =>
			current.includes(zipCode)
				? current.filter((item) => item !== zipCode)
				: [...current, zipCode],
		)
	}

	const addManualZipCode = () => {
		const zipCode = manualZipCode.trim()
		if (!marketComplete || !isValidZipCode(zipCode)) return
		setSelectedZipCodes((current) =>
			current.includes(zipCode) ? current : [...current, zipCode],
		)
		setManualZipCode('')
	}

	const selectCity = (city: string) => {
		setCommittedLocation(city)
		setLocationQuery(city)
		setSelectedZipCodes((current) =>
			city === committedLocation ? current : [],
		)
		setLocationOpen(false)
	}

	const handleContinue = () => {
		const finalLocation = committedLocation.trim()
		const finalMarketComplete = finalLocation.length >= 2

		if (!finalMarketComplete) {
			setHasTriedContinue(true)
			return
		}

		const derivedState = cityState?.state
		const location =
			selectedZipCodes.length > 0
				? `${finalLocation} (${selectedZipCodes.join(', ')})`
				: finalLocation

		onUpdate({
			city: finalLocation,
			location,
			...(derivedState ? { state: derivedState } : {}),
			zipCodes: selectedZipCodes,
		})
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey="intent" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={2}
						totalSteps={4}
						title="Location"
						icon={MapPinIcon}
					/>

					<div className="space-y-3">
						<div
							className={cn(
								'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase leading-none',
								showMarketError
									? 'text-destructive'
									: marketComplete
										? 'text-primary'
										: 'text-muted-foreground',
							)}
						>
							City
						</div>
						<Popover
							open={locationOpen}
							onOpenChange={(open) => {
								setLocationQuery(open ? '' : committedLocation)
								setLocationOpen(open)
							}}
						>
							<PopoverTrigger asChild>
								<Button
									id="consumer-location"
									variant="outline"
									aria-expanded={locationOpen}
									className={cn(
										'h-12 w-full justify-between rounded-2xl px-4 text-left text-base font-semibold transition sm:h-14 sm:text-lg',
										marketComplete
											? 'border-primary/60 bg-background text-foreground shadow-sm hover:bg-primary/[0.04]'
											: 'border-primary/25 bg-background text-foreground shadow-sm hover:border-primary/50 hover:bg-background',
									)}
								>
									<span
										className={cn(
											!committedLocation && 'text-muted-foreground',
											'truncate',
										)}
									>
										{committedLocation || 'Search for your city'}
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
										onValueChange={setLocationQuery}
										placeholder="Search city..."
									/>
									<CommandList>
										<CommandEmpty>
											No matching cities. Try a nearby market.
										</CommandEmpty>
										<CommandGroup
											heading={
												locationQuery.trim().length < 2
													? 'Top US cities'
													: 'City matches'
											}
										>
											{locationSuggestions.map((suggestion) => (
												<CommandItem
													key={suggestion}
													value={suggestion}
													onSelect={selectCity}
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
							<p className="text-destructive text-xs">Enter a city.</p>
						) : null}
					</div>

					<div className="space-y-3">
						{marketComplete ? (
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<div className="bg-muted/50 relative flex flex-1 items-center rounded-2xl border px-3">
										<input
											value={manualZipCode}
											onChange={(event) => setManualZipCode(event.target.value)}
											placeholder="Add ZIP code"
											inputMode="numeric"
											maxLength={5}
											className="h-11 w-full bg-transparent text-sm font-semibold outline-none"
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={addManualZipCode}
											disabled={!isValidZipCode(manualZipCode.trim())}
											className="h-8 rounded-xl px-3 text-xs"
										>
											Add
										</Button>
									</div>
								</div>
								{displayZipCodes.length > 0 ? (
									<div className="flex flex-wrap gap-1.5">
										{displayZipCodes.map((zipCode) => {
											const isSelected = selectedZipCodes.includes(zipCode)
											return (
												<button
													key={zipCode}
													type="button"
													onClick={() => toggleZipCode(zipCode)}
													className={cn(
														'resize-none rounded-full border px-2 py-0.5 text-[10px] font-semibold transition',
														isSelected
															? 'border-primary bg-primary text-primary-foreground shadow-sm'
															: 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground',
													)}
													aria-pressed={isSelected}
												>
													{zipCode}
												</button>
											)
										})}
									</div>
								) : null}
								<div className="bg-muted/30 border-border overflow-hidden rounded-2xl border p-3">
									{!centerForCity ? (
										<Skeleton className="h-80 rounded-2xl" />
									) : (
										<ZipCodeSelector
											boundaries={
												boundaries ?? {
													type: 'FeatureCollection',
													features: [],
												}
											}
											selectedZipCodes={selectedZipCodes}
											center={centerForCity}
											readOnly
											className="h-80"
										/>
									)}
								</div>
							</div>
						) : (
							<div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center">
								<MapPinIcon className="text-muted-foreground/60 h-8 w-8" />
								<div>
									<p className="font-semibold">Pick a city to unlock the map</p>
									<p className="text-muted-foreground mt-1 max-w-sm text-sm">
										The ZIP code map and manual ZIP entry will appear here after
										you choose a city.
									</p>
								</div>
							</div>
						)}
					</div>

					<div>
						<Button
							onClick={handleContinue}
							disabled={!canContinue}
							size="lg"
							className={cn(
								'w-full gap-2 rounded-4xl px-8 transition-all duration-300',
								canContinue
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
	const [hasDeadline, setHasDeadline] = useState(
		state.timeline ? state.timeline !== 'exploring' : false,
	)
	const deadlineOptions = config.timelineOptions.filter(
		(option) => option.slug !== 'exploring',
	)
	const [deadlineIndex, setDeadlineIndex] = useState(() => {
		if (!state.timeline || state.timeline === 'exploring') return 0
		const index = deadlineOptions.findIndex(
			(option) => option.slug === state.timeline,
		)
		return Math.max(index, 0)
	})
	const timeline = hasDeadline
		? deadlineOptions[deadlineIndex]!.slug
		: 'exploring'
	const intentComplete = intent.length > 0
	const canContinue = intentComplete

	const handleContinue = () => {
		if (!canContinue || !intent) return
		onUpdate({ intent, timeline })
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey="intent" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={1}
						totalSteps={4}
						title="Situation"
						icon={ClockIcon}
					/>

					<div className="space-y-5">
						<div className="space-y-3">
							<h3 className="font-heading text-base font-semibold tracking-tight">
								Your move
							</h3>

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
												'group flex items-center gap-3 rounded-full border px-5 py-3 text-left text-base font-semibold transition',
												isSelected
													? 'border-primary bg-primary text-primary-foreground shadow-sm'
													: 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-background',
											)}
											aria-pressed={isSelected}
										>
											<IntentIcon
												className={cn(
													'h-5 w-5 shrink-0',
													isSelected
														? 'text-primary-foreground'
														: 'text-muted-foreground',
												)}
												weight="duotone"
											/>
											<span className="min-w-0 truncate">{label}</span>
										</button>
									)
								})}
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="font-heading text-base font-semibold tracking-tight">
								Timeline
							</h3>
							<div className="flex flex-wrap gap-4">
								<label className="flex cursor-pointer items-center gap-2">
									<input
										type="radio"
										name="timeline-mode"
										checked={!hasDeadline}
										onChange={() => setHasDeadline(false)}
										className="border-border text-primary focus:ring-ring h-4 w-4"
									/>
									<span className="text-sm font-semibold">Just exploring</span>
								</label>
								<label className="flex cursor-pointer items-center gap-2">
									<input
										type="radio"
										name="timeline-mode"
										checked={hasDeadline}
										onChange={() => setHasDeadline(true)}
										className="border-border text-primary focus:ring-ring h-4 w-4"
									/>
									<span className="text-sm font-semibold">
										I have a deadline
									</span>
								</label>
							</div>

							<div
								className={cn(
									'space-y-3 transition-opacity',
									hasDeadline ? 'opacity-100' : 'hidden',
								)}
							>
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold">
										When do you need to move?
									</span>
									<span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold">
										{deadlineOptions[deadlineIndex]!.label}
									</span>
								</div>
								<div className="space-y-1">
									<Slider
										value={[deadlineIndex]}
										min={0}
										max={deadlineOptions.length - 1}
										step={1}
										onValueChange={([index]) => setDeadlineIndex(index ?? 0)}
										disabled={!hasDeadline}
									/>
									<div className="text-muted-foreground flex justify-between px-1">
										{deadlineOptions.map((option, index) => (
											<span
												key={option.slug}
												className={cn(
													'h-2 w-0.5 rounded-full transition-colors',
													index === deadlineIndex && hasDeadline
														? 'bg-primary'
														: 'bg-muted',
												)}
											/>
										))}
									</div>
								</div>
								<div className="text-muted-foreground flex justify-between text-xs font-medium">
									<span>{deadlineOptions[0]!.label}</span>
									<span>
										{deadlineOptions[deadlineOptions.length - 1]!.label}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div>
						<Button
							onClick={handleContinue}
							disabled={!canContinue}
							size="lg"
							className={cn(
								'w-full gap-2 rounded-4xl px-8 py-6 text-base transition-all duration-300',
								canContinue
									? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg'
									: 'bg-muted text-muted-foreground',
							)}
						>
							Continue
							<ArrowRight className="h-5 w-5" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

export function ConsumerHome({
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
	const initialRange = parsePriceRange(state.priceRange)
	const [priceRange, setPriceRange] = useState<{
		min: number
		max: number
	}>(initialRange)
	const [propertyTypes, setPropertyTypes] = useState<string[]>(
		state.propertyTypes ?? [],
	)
	const priceComplete =
		priceRange.min >= PRICE_MIN && priceRange.max <= PRICE_MAX
	const propertyComplete = propertyTypes.length > 0
	const canContinue = priceComplete && propertyComplete

	const handleContinue = () => {
		if (!canContinue) return
		onUpdate({
			priceRange: serializePriceRange(priceRange),
			propertyTypes,
		})
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey="home" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={3}
						totalSteps={4}
						title="Home"
						icon={HouseLineIcon}
					/>

					<div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
						<div className="space-y-3">
							<p className="text-sm font-semibold">Home type</p>
							<div className="flex flex-col gap-2">
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
												'group flex items-center gap-3 rounded-full border px-4 py-3 text-left text-sm font-semibold transition',
												isSelected
													? 'border-primary/55 bg-primary/[0.06] text-foreground shadow-sm'
													: 'border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground hover:shadow-sm',
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
												className="h-5 w-5 shrink-0"
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
						</div>

						<div className="space-y-5">
							<div className="flex items-center justify-between gap-3">
								<p className="text-sm font-semibold">
									{state.intent === 'selling'
										? 'Estimated value'
										: 'Target price'}
								</p>
								<span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap">
									{formatPriceRange(priceRange)}
								</span>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<PriceInput
									id="price-min"
									label="Low"
									value={priceRange.min}
									onChange={(nextMin) =>
										setPriceRange((current) => ({
											...current,
											min: Math.min(nextMin, current.max),
										}))
									}
								/>
								<PriceInput
									id="price-max"
									label="High"
									value={priceRange.max}
									onChange={(nextMax) =>
										setPriceRange((current) => ({
											...current,
											max: Math.max(nextMax, current.min),
										}))
									}
								/>
							</div>

							<Slider
								value={[priceRange.min, priceRange.max]}
								min={PRICE_MIN}
								max={PRICE_MAX}
								step={PRICE_STEP}
								onValueChange={([nextMin, nextMax]) => {
									setPriceRange({
										min: nextMin ?? DEFAULT_PRICE_RANGE.min,
										max: nextMax ?? DEFAULT_PRICE_RANGE.max,
									})
								}}
							/>
							<div className="relative h-4">
								{[0, 500_000, 1_000_000, 1_500_000, 2_000_000].map((value) => {
									const percent = (value / PRICE_MAX) * 100
									return (
										<div
											key={value}
											className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-0.5"
											style={{ left: `${percent}%` }}
										>
											<span className="bg-muted-foreground/30 h-1 w-px rounded-full" />
											<span className="text-muted-foreground text-[10px] font-medium">
												{formatPriceCompact(value)}
											</span>
										</div>
									)
								})}
							</div>
						</div>
					</div>

					<div className="border-t pt-4">
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

export function ConsumerAgentPreferences({
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
					<StepHeader
						stepNumber={4}
						totalSteps={4}
						title="Preferences"
						icon={UserIcon}
					/>
					<StepProgressHeader
						stepNumber={4}
						totalSteps={4}
						title="Preferences"
						activeIndex={currentQuestionIndex}
						items={config.questionFlow.questions.map(
							(q) =>
								state.answers[q.id] !== undefined &&
								state.answers[q.id] !== SKIPPED_ANSWER,
						)}
						showTitle={false}
					/>
					<QuestionFlow
						questions={config.questionFlow.questions}
						titleVisibility="sr-only"
						mode="single-question"
						title="Step 3: Your Match"
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
	edit = false,
}: {
	config: ConsumerFlowConfig
	step: ConsumerFlowStep
	reset?: boolean
	edit?: boolean
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
			search: { step: nextStep, edit: edit || undefined },
		})
	}

	const completedStepIds = consumerFlowSteps
		.filter((step) => {
			switch (step.id) {
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
					return config.questionFlow.questions.every(
						(q) =>
							state.answers[q.id] !== undefined &&
							state.answers[q.id] !== SKIPPED_ANSWER,
					)
				default:
					return false
			}
		})
		.map((step) => step.id)

	const progress = (() => {
		switch (step) {
			case 'intro':
				return <FlowIntakeProgress steps={consumerFlowSteps} current="intro" />
			case 'intent':
				return <FlowIntakeProgress steps={consumerFlowSteps} current="intent" />
			case 'home':
				return <FlowIntakeProgress steps={consumerFlowSteps} current="home" />
			case 'quiz':
				return <FlowIntakeProgress steps={consumerFlowSteps} current="quiz" />
		}
	})()

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
						config={config}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('intent')}
					/>
				) : step === 'intent' ? (
					<ConsumerLocation
						config={config}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('home')}
					/>
				) : step === 'home' ? (
					<ConsumerHome
						config={config}
						state={state}
						direction={direction}
						onUpdate={updateState}
						onContinue={() => goToStep('quiz')}
					/>
				) : (
					<ConsumerAgentPreferences
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
