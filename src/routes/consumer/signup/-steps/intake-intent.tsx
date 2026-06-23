import { MapPinIcon } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import type { FeatureCollection } from 'geojson'
import { Check, ArrowRight, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { AnimatedStepCard } from '@/components/signup/shared'
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
import { cn } from '@/lib/utils'
import type { ConsumerDraft } from '@/lib/drafts'
import {
	loadCityCenter,
	loadCitySuggestions,
	loadCityZipCodes,
	loadZipCodeBoundaries,
} from '@/lib/zip-codes'
import { isValidZipCode, parseCityState, StepHeader } from './shared'

export function ConsumerLocation({
	state,
	direction,
	onUpdate,
	onContinue,
}: {
	state: ConsumerDraft
	direction: number
	onUpdate: (patch: Partial<ConsumerDraft>) => void
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
		queryFn: () => loadCitySuggestions({ data: locationQuery }),
		enabled: locationQuery.trim().length >= 0,
		staleTime: 1000 * 60 * 60,
	})

	const { data: _cityZipCodes = [] } = useQuery({
		queryKey: ['city-zip-codes', committedLocation],
		queryFn: async () => {
			if (!cityState) return []
			return loadCityZipCodes({ data: cityState })
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
