import { MapPinIcon } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import type { FeatureCollection } from 'geojson'
import { Check, ArrowRight, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import {
	AnimatedStepCard,
	StepProgressHeader,
} from '@/components/signup/shared'
import { PriceInput } from '@/components/signup/price-range'
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils/ui'
import type { AgentDraft } from '@/lib/drafts'
import type { RepresentationSide } from '@/lib/matching/profile.types'
import {
	agentQuestionFlow,
	questionOptionLabel,
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
} from '@/components/signup/price-range-utils'
import {
	loadCityCenter,
	loadCitySuggestions,
	loadZipCodeBoundaries,
} from '@/lib/zip-codes'
import {
	agentConfig,
	getRepresentationIcon,
	getRepresentationLabel,
	isValidZipCode,
	parseCityState,
	StepHeader,
} from './shared'

const bestClientTypesQuestion = agentQuestionFlow.questions.find(
	(q) => q.id === 'bestClientTypes',
)!

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
		queryFn: () => loadCitySuggestions({ data: locationQuery }),
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
			return loadZipCodeBoundaries({ data: cityState })
		},
		enabled: marketComplete && Boolean(cityState),
		staleTime: 1000 * 60 * 60,
	})

	const { data: centerForCity } = useQuery({
		queryKey: ['city-center', committedLocation],
		queryFn: async () => {
			if (!cityState) return undefined
			return loadCityCenter({ data: cityState })
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
