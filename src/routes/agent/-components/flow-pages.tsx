import { useNavigate } from '@tanstack/react-router'
import {
	BriefcaseIcon,
	ChartLineIcon,
	MapPinIcon,
	ScrollIcon,
	ShieldCheckIcon,
	UserIcon,
	UsersIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import type { FeatureCollection } from 'geojson'
import { ArrowRight, Check, ChevronsUpDown, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
	AnimatedStepCard,
	FlowIntakeProgress,
	StepProgressHeader,
} from '@/components/flow/shared'
import { PriceInput } from '@/components/flow/price-range'
import { QuestionFlow } from '@/components/flow/question-flow'
import { WizardShell } from '@/components/flow/wizard-shell'
import { ZipCodeSelector } from '@/components/maps'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { loadAgentDraft, saveAgentDraft, type AgentDraft } from '@/lib/drafts'
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
import {
	DEFAULT_PRICE_RANGE,
	formatPriceCompact,
	formatPriceRange,
	parsePriceRange,
	PRICE_MAX,
	PRICE_MIN,
	PRICE_STEP,
	serializePriceRange,
} from '@/components/flow/price-range-utils'
import {
	loadCityCenter,
	loadCitySuggestions,
	loadZipCodeBoundaries,
} from '@/lib/zip-codes'

const SKIPPED_ANSWER = '__skipped__'

type AgentFlowStep =
	| 'welcome'
	| 'identity'
	| 'market'
	| 'compliance'
	| 'peacePact'

const agentFlowSteps: { id: AgentFlowStep; label: string; icon: Icon }[] = [
	{ id: 'welcome', label: 'Start', icon: UserIcon },
	{ id: 'identity', label: 'Identity', icon: UserIcon },
	{ id: 'market', label: 'Market', icon: MapPinIcon },
	{ id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
	{ id: 'peacePact', label: 'Peace Pact', icon: ScrollIcon },
]

const stepOrder: AgentFlowStep[] = [
	'welcome',
	'identity',
	'market',
	'compliance',
	'peacePact',
]

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
	intentOptions: ['buying', 'selling', 'both'] as RepresentationSide[],
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
} satisfies {
	basePath: '/agent'
	label: string
	intentOptions: RepresentationSide[]
	clientOptions: string[]
	questionFlow: MatchingQuestionFlow
	accent: 'amber'
}

function getNextUnansweredQuestionIndex(
	questions: Question[],
	answers: Answers,
) {
	const nextIndex = questions.findIndex((q) => answers[q.id] === undefined)
	return nextIndex === -1 ? Math.max(questions.length - 1, 0) : nextIndex
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

export function AgentWelcome({ onContinue }: { onContinue: () => void }) {
	return (
		<AnimatedStepCard stepKey="welcome" direction={1}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-8">
					<div className="space-y-2 text-center">
						<h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
							Let's build your agent profile
						</h2>
						<p className="text-muted-foreground text-sm leading-relaxed">
							A few essentials first, then the deeper stuff that helps consumers
							choose you.
						</p>
					</div>

					<div className="space-y-3">
						{agentFlowSteps.slice(1, -1).map((step) => (
							<div
								key={step.id}
								className="flex items-center gap-3 rounded-xl border p-4"
							>
								<step.icon className="text-primary h-5 w-5" weight="duotone" />
								<div>
									<p className="text-sm font-semibold">{step.label}</p>
								</div>
							</div>
						))}
					</div>

					<Button
						onClick={onContinue}
						size="lg"
						className="w-full gap-2 rounded-4xl px-8"
					>
						Start
						<ArrowRight className="h-4 w-4" />
					</Button>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

export function AgentIdentity({
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
	const [firstName, setFirstName] = useState(state.firstName ?? '')
	const [lastName, setLastName] = useState(state.lastName ?? '')
	const [brokerageName, setBrokerageName] = useState(state.brokerageName ?? '')
	const [email, setEmail] = useState(state.email ?? '')
	const [phone, setPhone] = useState(state.phone ?? '')
	const [businessAddress, setBusinessAddress] = useState(
		state.businessAddress ?? '',
	)
	const [licenseNumberState, setLicenseNumberState] = useState(
		state.licenseNumberState ?? '',
	)
	const [licenseProof, setLicenseProof] = useState(state.licenseProof ?? '')
	const [yearsLicensed, setYearsLicensed] = useState(state.yearsLicensed ?? '')
	const [averageTransactions, setAverageTransactions] = useState(
		state.averageTransactions ?? '',
	)
	const [employmentStatus, setEmploymentStatus] = useState(
		state.employmentStatus ?? '',
	)

	const canContinue =
		firstName.trim().length > 0 &&
		lastName.trim().length > 0 &&
		brokerageName.trim().length > 0 &&
		licenseNumberState.trim().length > 0

	const handleContinue = () => {
		if (!canContinue) return
		onUpdate({
			firstName,
			lastName,
			brokerageName,
			email,
			phone,
			businessAddress,
			licenseNumberState,
			licenseProof,
			yearsLicensed,
			averageTransactions,
			employmentStatus,
		})
		onContinue()
	}

	const fillDebugData = () => {
		setFirstName('Alex')
		setLastName('Morgan')
		setBrokerageName('PRE Realty Group')
		setEmail('alex.morgan@example.com')
		setPhone('555-123-4567')
		setBusinessAddress('123 Main St, Austin, TX 78701')
		setLicenseNumberState('TX-12345678')
		setLicenseProof('https://license.example.com/alex-morgan')
		setYearsLicensed('6-10')
		setAverageTransactions('16-30')
		setEmploymentStatus('Full time')
	}

	return (
		<AnimatedStepCard stepKey="identity" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<div className="flex items-start justify-between gap-4">
						<StepHeader
							stepNumber={1}
							totalSteps={5}
							title="Identity"
							icon={UserIcon}
						/>
						{import.meta.env.DEV ? (
							<Button
								variant="outline"
								size="sm"
								onClick={fillDebugData}
								className="shrink-0"
							>
								Fill test data
							</Button>
						) : null}
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<Label className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase">
							First name
							<Input
								value={firstName}
								onChange={(event) => setFirstName(event.target.value)}
								placeholder="Jane"
							/>
						</Label>
						<Label className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase">
							Last name
							<Input
								value={lastName}
								onChange={(event) => setLastName(event.target.value)}
								placeholder="Doe"
							/>
						</Label>
						<Label className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase">
							Brokerage name
							<Input
								value={brokerageName}
								onChange={(event) => setBrokerageName(event.target.value)}
							/>
						</Label>
						<Label className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase">
							Email
							<Input
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
							/>
						</Label>
						<Label className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase">
							Phone
							<Input
								type="tel"
								value={phone}
								onChange={(event) => setPhone(event.target.value)}
							/>
						</Label>
						<Label className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase">
							License number & state
							<Input
								value={licenseNumberState}
								onChange={(event) => setLicenseNumberState(event.target.value)}
								placeholder="CA-DRE-01234567"
							/>
						</Label>
						<Label className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase sm:col-span-2">
							Business address
							<Input
								value={businessAddress}
								onChange={(event) => setBusinessAddress(event.target.value)}
							/>
						</Label>
						<Label className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase">
							Years licensed
							<select
								value={yearsLicensed}
								onChange={(event) => setYearsLicensed(event.target.value)}
								className="h-10 w-full rounded-md border px-3"
							>
								<option value="">Select...</option>
								{yearsLicensedOptions.map((option) => (
									<option key={option.slug} value={option.slug}>
										{option.label}
									</option>
								))}
							</select>
						</Label>
						<Label className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase">
							Avg transactions / year
							<select
								value={averageTransactions}
								onChange={(event) => setAverageTransactions(event.target.value)}
								className="h-10 w-full rounded-md border px-3"
							>
								<option value="">Select...</option>
								{averageTransactionsOptions.map((option) => (
									<option key={option.slug} value={option.slug}>
										{option.label}
									</option>
								))}
							</select>
						</Label>
						<Label className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase">
							Full / part time
							<select
								value={employmentStatus}
								onChange={(event) => setEmploymentStatus(event.target.value)}
								className="h-10 w-full rounded-md border px-3"
							>
								<option value="">Select...</option>
								<option value="Full time">Full time</option>
								<option value="Part time">Part time</option>
							</select>
						</Label>
						<Label className="flex-col items-start gap-2 text-xs font-semibold tracking-wide uppercase">
							License proof URL / note
							<Input
								value={licenseProof}
								onChange={(event) => setLicenseProof(event.target.value)}
							/>
						</Label>
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

export function AgentMarket({
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
	const rawInitialLocation = state.city ?? ''
	const [committedLocation, setCommittedLocation] = useState(rawInitialLocation)
	const [locationQuery, setLocationQuery] = useState(rawInitialLocation)
	const [locationOpen, setLocationOpen] = useState(false)
	const [selectedZipCodes, setSelectedZipCodes] = useState<string[]>(
		state.zipCodes ?? [],
	)
	const [manualZipCode, setManualZipCode] = useState('')
	const [hasTriedContinue, setHasTriedContinue] = useState(false)

	const initialRange = parsePriceRange(state.typicalPriceRange)
	const [priceRange, setPriceRange] = useState(initialRange)
	const [representationSide, setRepresentationSide] = useState<
		RepresentationSide | ''
	>(state.representationSide ?? '')
	const [bestClientTypes, setBestClientTypes] = useState<string[]>(
		state.bestClientTypes ?? [],
	)

	const marketComplete = committedLocation.trim().length >= 2
	const priceComplete =
		priceRange.min >= PRICE_MIN && priceRange.max <= PRICE_MAX
	const sideComplete = representationSide.length > 0
	const clientsComplete = bestClientTypes.length > 0
	const canContinue =
		marketComplete && priceComplete && sideComplete && clientsComplete
	const showMarketError = hasTriedContinue && !marketComplete
	const cityState = parseCityState(committedLocation)

	const { data: locationSuggestions = [] } = useQuery({
		queryKey: ['city-suggestions', locationQuery],
		queryFn: () => loadCitySuggestions(locationQuery),
		enabled: locationQuery.trim().length >= 0,
		staleTime: 1000 * 60 * 60,
	})

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

	const toggleClientType = (option: string) => {
		setBestClientTypes((current) =>
			current.includes(option)
				? current.filter((item) => item !== option)
				: [...current, option],
		)
	}

	const handleContinue = () => {
		if (!canContinue) {
			setHasTriedContinue(true)
			return
		}

		const derivedState = cityState?.state
		onUpdate({
			city: committedLocation,
			...(derivedState ? { state: derivedState } : {}),
			zipCodes: selectedZipCodes,
			serviceAreas:
				selectedZipCodes.length > 0 ? selectedZipCodes : [committedLocation],
			typicalPriceRange: serializePriceRange(priceRange),
			representationSide: representationSide as RepresentationSide,
			bestClientTypes,
		})
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey="market" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={2}
						totalSteps={5}
						title="Market"
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
							Primary market
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

					{marketComplete ? (
						<div className="space-y-3">
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
							{selectedZipCodes.length > 0 ? (
								<div className="flex flex-wrap gap-1.5">
									{selectedZipCodes.map((zipCode) => {
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
									<Skeleton className="h-64 rounded-2xl" />
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
										className="h-64"
									/>
								)}
							</div>
						</div>
					) : null}

					<div className="space-y-5 border-t pt-5">
						<div className="flex items-center justify-between gap-3">
							<p className="text-sm font-semibold">Typical price range</p>
							<span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap">
								{formatPriceRange(priceRange)}
							</span>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<PriceInput
								id="agent-price-min"
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
								id="agent-price-max"
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

					<div className="space-y-3">
						<p className="text-sm font-semibold">Representation side</p>
						<div className="grid grid-cols-3 gap-3">
							{agentConfig.intentOptions.map((option) => {
								const isSelected = representationSide === option
								const SideIcon = getRepresentationIcon(option)
								const label = getRepresentationLabel(option)
								return (
									<button
										key={option}
										type="button"
										onClick={() => setRepresentationSide(option)}
										className={cn(
											'group flex items-center gap-2 rounded-full border px-4 py-3 text-left text-sm font-semibold transition',
											isSelected
												? 'border-primary bg-primary text-primary-foreground shadow-sm'
												: 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-background',
										)}
										aria-pressed={isSelected}
									>
										<SideIcon className="h-4 w-4 shrink-0" weight="duotone" />
										<span className="min-w-0 truncate">{label}</span>
									</button>
								)
							})}
						</div>
					</div>

					<div className="space-y-3">
						<p className="text-sm font-semibold">
							Where do you do your best work?
						</p>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{agentConfig.clientOptions.map((option) => {
								const isSelected = bestClientTypes.includes(option)
								return (
									<button
										key={option}
										type="button"
										onClick={() => toggleClientType(option)}
										className={cn(
											'group flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition',
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

					<StepProgressHeader
						stepNumber={2}
						totalSteps={5}
						title="Market"
						items={[
							marketComplete,
							priceComplete,
							sideComplete,
							clientsComplete,
						]}
						showTitle={false}
					/>

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

export function AgentCompliance({
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
	const [licenseAttested, setLicenseAttested] = useState(
		state.licenseAttested ?? false,
	)
	const [eoInsuranceStatus, setEoInsuranceStatus] = useState(
		state.eoInsuranceStatus ?? '',
	)
	const canContinue = licenseAttested && eoInsuranceStatus.length > 0

	const handleContinue = () => {
		if (!canContinue) return
		onUpdate({ licenseAttested, eoInsuranceStatus })
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey="compliance" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={3}
						totalSteps={5}
						title="Compliance"
						icon={ShieldCheckIcon}
					/>

					<Label className="flex items-start gap-3 border p-5 text-sm leading-relaxed">
						<input
							type="checkbox"
							checked={licenseAttested}
							onChange={(event) => setLicenseAttested(event.target.checked)}
							className="mt-1"
						/>
						<span>
							I confirm that my real estate license is currently active and in
							good standing in all states where I am licensed, that there are no
							pending or active disciplinary actions, complaints, or
							investigations, and that I have not previously had a real estate
							license suspended, revoked, or subject to formal disciplinary
							action.
						</span>
					</Label>

					<div className="space-y-3">
						<p className="text-sm font-semibold">
							Errors and Omissions (E&O) Insurance
						</p>
						<RadioGroup
							value={eoInsuranceStatus}
							onValueChange={setEoInsuranceStatus}
							className="space-y-2"
						>
							{[
								'Yes, I carry my own E&O policy',
								'Yes, I am covered through my brokerage',
								'No',
							].map((option) => (
								<Label
									key={option}
									className="flex items-center gap-3 border p-4 text-sm"
								>
									<RadioGroupItem value={option} />
									{option}
								</Label>
							))}
						</RadioGroup>
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

export function AgentPeacePact({
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
	const [agreed, setAgreed] = useState(state.peacePactSigned ?? false)
	const [signature, setSignature] = useState(state.peacePactSignature ?? '')
	const canContinue = agreed && signature.trim().length > 2

	const handleContinue = () => {
		if (!canContinue) return
		onUpdate({
			peacePactSigned: true,
			peacePactSignature: signature,
		})
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey="peacePact" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={4}
						totalSteps={5}
						title="Peace Pact"
						icon={ScrollIcon}
					/>

					<Card className="max-h-80 overflow-y-auto rounded-2xl border bg-transparent p-5 text-sm leading-relaxed shadow-none ring-0">
						<h2 className="mb-4 text-xl font-semibold">THE PEACE PACT</h2>
						<p>
							This Commitment reinforces ethical, transparent, and
							consumer-first real estate practices consistent with the NAR Code
							of Ethics, particularly Article 1.
						</p>
						<p className="mt-4">
							I commit to protecting and promoting my client's interests with
							loyalty, care, and diligence while treating all parties honestly
							and fairly.
						</p>
						<p className="mt-4">
							I affirm that buyers and sellers retain the right to make their
							own decisions, negotiate compensation freely, and decline any term
							or service that does not align with their goals.
						</p>
						<p className="mt-4">
							I will not steer buyers toward or away from properties based on
							compensation, and I will explain representation, services, and
							compensation options clearly before and during any agency
							relationship.
						</p>
					</Card>

					<Label className="flex items-start gap-3 text-sm leading-relaxed">
						<input
							type="checkbox"
							checked={agreed}
							onChange={(event) => setAgreed(event.target.checked)}
							className="mt-1"
						/>
						<span>
							I agree to uphold the Peace Pact in alignment with the NAR Code of
							Ethics and applicable regulations.
						</span>
					</Label>

					<Label className="flex-col items-start gap-2 text-sm font-medium">
						Agent Signature (type full name)
						<Input
							value={signature}
							onChange={(event) => setSignature(event.target.value)}
						/>
					</Label>

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
							Sign & continue
							<ArrowRight className="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

export function AgentPriorities({
	state,
	onUpdate,
}: {
	state: AgentDraft
	onUpdate: (patch: Partial<AgentDraft>) => void
}) {
	const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
		state.matchPriorities ?? [],
	)

	const answeredQuestions = agentConfig.questionFlow.questions.filter(
		(q) =>
			state.answers?.[q.id] !== undefined &&
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
										{getAnswerSummary(question, state.answers?.[question.id])}
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
					<Button
						onClick={() => onUpdate({ matchPriorities: selectedPriorities })}
						disabled={selectedPriorities.length === 0}
					>
						Save priorities
						<ArrowRight className="h-4 w-4" />
					</Button>
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
	step,
	reset = false,
}: {
	step: AgentFlowStep
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
			to: '/agent/intake',
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
						onContinue={() => void navigate({ to: '/agent/preview' })}
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

// Re-export deep-profile helpers from the legacy question flow for backwards
// compatibility until the deep-profile route fully replaces them.
export function AgentQuiz({
	state,
	direction,
	onUpdate,
	onComplete,
}: {
	state: AgentDraft
	direction: number
	onUpdate: (patch: Partial<AgentDraft>) => void
	onComplete: () => void
}) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() =>
		getNextUnansweredQuestionIndex(
			agentConfig.questionFlow.questions,
			state.answers ?? {},
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
						items={agentConfig.questionFlow.questions.map(
							(q) =>
								state.answers?.[q.id] !== undefined &&
								state.answers[q.id] !== SKIPPED_ANSWER,
						)}
					/>
					<QuestionFlow
						questions={agentConfig.questionFlow.questions}
						titleVisibility="sr-only"
						mode="single-question"
						title="Step 3: Your Style"
						wrapper="wizard"
						answers={state.answers ?? {}}
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
