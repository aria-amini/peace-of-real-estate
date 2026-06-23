import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Check, Home, MapPin, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { ChipSelect } from '@/components/ui/chip-select'
import { Input } from '@/components/ui/input'
import { PriceInput } from '@/components/signup/price-range'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import {
	loadConsumerProfile,
	saveConsumerProfile,
} from '@/lib/matching/profile'
import type {
	ConsumerProfile,
	ConsumerProfileUpdate,
	RepresentationSide,
} from '@/lib/matching/profile'
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
import { withSaveToast } from '@/lib/toast'
import { cn } from '@/lib/utils/ui'

export const Route = createFileRoute(
	'/(app)/consumer/dashboard/search-preferences',
)({
	component: SearchPreferences,
	loader: () => loadConsumerProfile(),
})

const intentOptions: RepresentationSide[] = ['buying', 'selling', 'both']

const propertyOptions = [
	'Single-Family',
	'Condo/Townhome',
	'Multi-family',
	'Land',
]

const propertySlugMap: Record<string, string> = {
	'Single-Family': 'singleFamily',
	'Condo/Townhome': 'condoTownhome',
	'Multi-family': 'multiFamily',
	Land: 'land',
}

const reversePropertySlugMap: Record<string, string> = Object.fromEntries(
	Object.entries(propertySlugMap).map(([label, slug]) => [slug, label]),
)

const experienceOptions = [
	'First-time client',
	"I've done this before",
	"I'm very experienced",
]

const experienceSlugMap: Record<string, string> = {
	'First-time client': 'firstTime',
	"I've done this before": 'experienced',
	"I'm very experienced": 'veryExperienced',
}

const reverseExperienceSlugMap: Record<string, string> = Object.fromEntries(
	Object.entries(experienceSlugMap).map(([label, slug]) => [slug, label]),
)

const priorityOptions = [
	'Communication style',
	'Availability',
	'Negotiation approach',
	'Transparency',
	'Local expertise',
	'Client education',
]

const prioritySlugMap: Record<string, string> = {
	'Communication style': 'preferredContactMethod',
	Availability: 'involvementLevel',
	'Negotiation approach': 'commissionComfort',
	Transparency: 'representationPreference',
	'Local expertise': 'state',
	'Client education': 'experienceLevel',
}

const reversePrioritySlugMap: Record<string, string> = Object.fromEntries(
	Object.entries(prioritySlugMap).map(([label, slug]) => [slug, label]),
)

type FormState = {
	location: string | undefined
	state: string | undefined
	intent: RepresentationSide | undefined
	priceRange: string | undefined
	propertyTypes: string[]
	experienceLevel: string | undefined
	matchPriorities: string[]
	matchDetails: string | undefined
}

function profileToForm(profile: Partial<ConsumerProfile>): FormState {
	return {
		location: profile.location ?? undefined,
		state: profile.state ?? undefined,
		intent: profile.intent ?? undefined,
		priceRange: profile.priceRange
			? serializePriceRange(parsePriceRange(profile.priceRange))
			: undefined,
		propertyTypes: (profile.propertyTypes ?? [])
			.map((slug) => reversePropertySlugMap[slug] ?? slug)
			.filter(Boolean),
		experienceLevel: profile.experienceLevel
			? (reverseExperienceSlugMap[profile.experienceLevel] ??
				profile.experienceLevel)
			: undefined,
		matchPriorities: (profile.matchPriorities ?? [])
			.map((slug) => reversePrioritySlugMap[slug] ?? slug)
			.filter(Boolean),
		matchDetails: profile.matchDetails ?? undefined,
	}
}

function formToUpdate(form: FormState): ConsumerProfileUpdate {
	const update: ConsumerProfileUpdate = {}

	if (form.location !== undefined) update.location = form.location
	if (form.state !== undefined) update.state = form.state
	if (form.intent !== undefined) update.intent = form.intent
	if (form.priceRange !== undefined) {
		update.priceRange = serializePriceRange(parsePriceRange(form.priceRange))
	}

	const propertyTypes = form.propertyTypes
		.map((label) => propertySlugMap[label])
		.filter((value): value is string => Boolean(value))
	if (propertyTypes.length > 0) update.propertyTypes = propertyTypes

	if (form.experienceLevel !== undefined) {
		update.experienceLevel = experienceSlugMap[form.experienceLevel]
	}

	const matchPriorities = form.matchPriorities
		.map((label) => prioritySlugMap[label])
		.filter((value): value is string => Boolean(value))
	if (matchPriorities.length > 0) update.matchPriorities = matchPriorities

	if (form.matchDetails !== undefined) update.matchDetails = form.matchDetails

	return update
}

function SearchPreferences() {
	const consumerProfile = Route.useLoaderData()
	const saveConsumer = useServerFn(saveConsumerProfile)
	const [form, setForm] = useState<FormState>(() =>
		profileToForm(consumerProfile ?? {}),
	)
	const [isSaving, setIsSaving] = useState(false)

	const updateForm = (patch: Partial<FormState>) => {
		setForm((current) => ({ ...current, ...patch }))
	}

	const handleSave = async () => {
		setIsSaving(true)
		await withSaveToast(() => saveConsumer({ data: formToUpdate(form) }), {
			success: 'Search preferences saved',
			error: 'Could not save preferences. Try again.',
		})
		setIsSaving(false)
	}

	return (
		<div className="mx-auto w-full max-w-4xl px-6 py-10 xl:mx-0 xl:ml-[calc((100vw-56rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Account menu</span>
			</div>

			<div className="mb-8 space-y-3">
				<div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
					<SlidersHorizontal className="size-5" />
				</div>
				<div>
					<p className="text-muted-foreground text-sm font-medium">
						Search Preferences
					</p>
					<h1 className="font-heading text-3xl font-semibold tracking-tight">
						Tune how PRE finds agent matches.
					</h1>
					<p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
						Keep the basics current so matches reflect where you are looking,
						what you are buying or selling, and what kind of agent relationship
						fits you best.
					</p>
				</div>
			</div>

			<div className="grid gap-5">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="size-4" />
							Market
						</CardTitle>
						<CardDescription>
							Where should we focus your matches?
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-5 sm:grid-cols-2">
						<div className="space-y-2 sm:col-span-2">
							<label htmlFor="search-location" className="text-sm font-medium">
								City, state, or ZIP
							</label>
							<Input
								id="search-location"
								value={form.location ?? ''}
								onChange={(event) =>
									updateForm({ location: event.target.value })
								}
								placeholder="Austin, TX 78701"
								className="h-11"
							/>
						</div>

						<OptionGroup
							label="Intent"
							options={intentOptions}
							value={form.intent}
							onChange={(intent) =>
								updateForm({ intent: intent as RepresentationSide })
							}
						/>

						<BudgetRangeField
							value={form.priceRange}
							onChange={(priceRange) => updateForm({ priceRange })}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Home className="size-4" />
							Property Fit
						</CardTitle>
						<CardDescription>
							Pick every property type that belongs in your search.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-3">
							<div className="text-sm font-medium">Property types</div>
							<ChipSelect
								options={propertyOptions.map((option) => ({
									value: option,
									label: option,
								}))}
								selected={form.propertyTypes}
								onChange={(propertyTypes) => updateForm({ propertyTypes })}
							/>
						</div>

						<OptionGroup
							label="Experience level"
							options={experienceOptions}
							value={form.experienceLevel}
							onChange={(experienceLevel) => updateForm({ experienceLevel })}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Match Priorities</CardTitle>
						<CardDescription>
							Tell us what should matter most when ranking agents.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="space-y-3">
							<div className="text-sm font-medium">Top priorities</div>
							<ChipSelect
								options={priorityOptions.map((option) => ({
									value: option,
									label: option,
								}))}
								selected={form.matchPriorities}
								onChange={(matchPriorities) => updateForm({ matchPriorities })}
								maxSelections={3}
							/>
							<p className="text-muted-foreground text-xs">
								Choose up to 3. These guide the first pass of your match list.
							</p>
						</div>

						<div className="space-y-2">
							<label htmlFor="match-details" className="text-sm font-medium">
								Anything else we should know?
							</label>
							<Textarea
								id="match-details"
								value={form.matchDetails ?? ''}
								onChange={(event) =>
									updateForm({ matchDetails: event.target.value })
								}
								placeholder="Timing, neighborhoods, deal-breakers, communication preferences..."
								className="min-h-28"
							/>
						</div>
					</CardContent>
					<CardFooter className="justify-between gap-3 border-t">
						<p className="text-muted-foreground text-xs">
							Saved preferences feed future match and introduction quality.
						</p>
						<Button onClick={() => void handleSave()} disabled={isSaving}>
							{isSaving ? 'Saving...' : 'Save preferences'}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	)
}

function BudgetRangeField({
	value,
	onChange,
}: {
	value: string | undefined
	onChange: (value: string) => void
}) {
	const range = parsePriceRange(value)
	const setRange = (next: { min: number; max: number }) => {
		onChange(serializePriceRange(next))
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-3">
				<div className="text-sm font-medium">Budget</div>
				<span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap">
					{formatPriceRange(range)}
				</span>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<PriceInput
					id="budget-min"
					label="Low"
					value={range.min}
					onChange={(nextMin) =>
						setRange({ ...range, min: Math.min(nextMin, range.max) })
					}
				/>
				<PriceInput
					id="budget-max"
					label="High"
					value={range.max}
					onChange={(nextMax) =>
						setRange({ ...range, max: Math.max(nextMax, range.min) })
					}
				/>
			</div>

			<Slider
				value={[range.min, range.max]}
				min={PRICE_MIN}
				max={PRICE_MAX}
				step={PRICE_STEP}
				onValueChange={([nextMin, nextMax]) =>
					setRange({
						min: nextMin ?? DEFAULT_PRICE_RANGE.min,
						max: nextMax ?? DEFAULT_PRICE_RANGE.max,
					})
				}
			/>
			<div className="relative h-4">
				{[0, 500_000, 1_000_000, 1_500_000, 2_000_000].map((tick) => {
					const percent = (tick / PRICE_MAX) * 100
					return (
						<div
							key={tick}
							className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-0.5"
							style={{ left: `${percent}%` }}
						>
							<span className="bg-muted-foreground/30 h-1 w-px rounded-full" />
							<span className="text-muted-foreground text-[10px] font-medium">
								{formatPriceCompact(tick)}
							</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}

function OptionGroup({
	label,
	options,
	value,
	onChange,
}: {
	label: string
	options: string[]
	value: string | undefined
	onChange: (value: string) => void
}) {
	return (
		<div className="space-y-3">
			<div className="text-sm font-medium">{label}</div>
			<div className="grid gap-2">
				{options.map((option) => {
					const selected = value === option

					return (
						<button
							key={option}
							type="button"
							onClick={() => onChange(option)}
							className={cn(
								'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition',
								selected
									? 'border-primary/60 bg-primary/[0.06] text-foreground'
									: 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/30',
							)}
						>
							<span
								className={cn(
									'flex size-4 items-center justify-center rounded-full border',
									selected ? 'border-primary' : 'border-muted-foreground/30',
								)}
							>
								{selected ? <Check className="text-primary size-3" /> : null}
							</span>
							{option}
						</button>
					)
				})}
			</div>
		</div>
	)
}
