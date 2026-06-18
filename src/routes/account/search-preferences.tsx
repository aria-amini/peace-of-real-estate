import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createFileRoute } from '@tanstack/react-router'
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
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Textarea } from '@/components/ui/textarea'
import { useAccountSettings } from '@/hooks/use-account-settings'
import { cn } from '@/lib/utils'
import {
	getDefaultSettings,
	saveUserSettings,
	type UserSettings,
} from '@/lib/matching/settings'

export const Route = createFileRoute('/account/search-preferences')({
	component: SearchPreferences,
})

const intentOptions = ['Buy', 'Sell', 'Buy then Sell']
const priceOptions = [
	'Under $400k',
	'$400k to $750k',
	'$750k to $1.5M',
	'$1.5M and above',
]
const propertyOptions = [
	'Single-Family',
	'Condo/Townhome',
	'Multi-family',
	'Land',
]
const experienceOptions = [
	'First-time client',
	"I've done this before",
	"I'm very experienced",
]
const priorityOptions = [
	'Communication style',
	'Negotiation approach',
	'Local expertise',
	'Availability',
	'Transparency',
	'Client education',
]

function SearchPreferences() {
	const { settings, loading } = useAccountSettings()
	const [form, setForm] = useState<UserSettings>(() => getDefaultSettings())
	const [isSaving, setIsSaving] = useState(false)
	const [hasLoadedSettings, setHasLoadedSettings] = useState(false)

	useEffect(() => {
		if (!loading && settings && !hasLoadedSettings) {
			setForm(settings)
			setHasLoadedSettings(true)
		}
	}, [hasLoadedSettings, loading, settings])

	const updateForm = (patch: Partial<UserSettings>) => {
		setForm((current) => ({ ...current, ...patch }))
	}

	const handleSave = async () => {
		setIsSaving(true)
		try {
			await saveUserSettings({
				...form,
				role: form.role ?? 'consumer',
				flowKind: form.flowKind ?? 'buyer',
				answers: form.answers ?? {},
			})
			toast.success('Search preferences saved')
		} catch {
			toast.error('Could not save preferences. Try again.')
		} finally {
			setIsSaving(false)
		}
	}

	if (loading) {
		return <div className="flex-1" />
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
								value={form.zipCode ?? ''}
								onChange={(event) =>
									updateForm({ zipCode: event.target.value })
								}
								placeholder="Austin, TX 78701"
								className="h-11"
							/>
						</div>

						<OptionGroup
							label="Intent"
							options={intentOptions}
							value={form.intent}
							onChange={(intent) => updateForm({ intent })}
						/>

						<OptionGroup
							label="Budget"
							options={priceOptions}
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
								selected={form.propertyType ?? []}
								onChange={(propertyType) => updateForm({ propertyType })}
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
								selected={form.matchPriorities ?? []}
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
