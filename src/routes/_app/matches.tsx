import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import {
	ArrowRightLeft,
	Award,
	Banknote,
	Check,
	ChevronDown,
	Clock,
	Home,
	Lock,
	MapPin,
	MessageSquare,
	Pencil,
	Scale,
	Send,
	Shield,
	Star,
	Target,
	Users,
	Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import type { MatchDetails } from '@/components/match-card-variants'
import { PaywallDialog } from '@/components/paywall-dialog'
import { authClient } from '@/lib/auth/client'
import { getAgentMatches } from '@/lib/matching/matches'
import { isUserPremium } from '@/lib/premium'
import { getStoredConsumerDraftForFlow } from '@/lib/matching/intake-draft'
import { getCurrentSession } from '@/lib/auth/functions'
import { getAnswerSummary, getUserSettings } from '@/lib/matching/settings'
import {
	buyerMatchingQuestionFlow,
	buyerQuestionFlow,
} from '@/lib/matching/questions'
import { cn } from '@/lib/utils'

const stateNames: Record<string, string> = {
	AL: 'Alabama',
	AK: 'Alaska',
	AZ: 'Arizona',
	AR: 'Arkansas',
	CA: 'California',
	CO: 'Colorado',
	CT: 'Connecticut',
	DE: 'Delaware',
	DC: 'District_of_Columbia',
	FL: 'Florida',
	GA: 'Georgia',
	HI: 'Hawaii',
	ID: 'Idaho',
	IL: 'Illinois',
	IN: 'Indiana',
	IA: 'Iowa',
	KS: 'Kansas',
	KY: 'Kentucky',
	LA: 'Louisiana',
	ME: 'Maine',
	MD: 'Maryland',
	MA: 'Massachusetts',
	MI: 'Michigan',
	MN: 'Minnesota',
	MS: 'Mississippi',
	MO: 'Missouri',
	MT: 'Montana',
	NE: 'Nebraska',
	NV: 'Nevada',
	NH: 'New_Hampshire',
	NJ: 'New_Jersey',
	NM: 'New_Mexico',
	NY: 'New_York',
	NC: 'North_Carolina',
	ND: 'North_Dakota',
	OH: 'Ohio',
	OK: 'Oklahoma',
	OR: 'Oregon',
	PA: 'Pennsylvania',
	RI: 'Rhode_Island',
	SC: 'South_Carolina',
	SD: 'South_Dakota',
	TN: 'Tennessee',
	TX: 'Texas',
	UT: 'Utah',
	VT: 'Vermont',
	VA: 'Virginia',
	WA: 'Washington',
	WV: 'West_Virginia',
	WI: 'Wisconsin',
	WY: 'Wyoming',
}

const stateAbbreviations = new Set(Object.keys(stateNames))

function resolveStateCode(...values: Array<string | undefined>) {
	for (const value of values) {
		if (!value) continue
		const normalized = value.trim().toUpperCase()
		if (stateAbbreviations.has(normalized)) return normalized

		const stateMatch = normalized.match(/\b[A-Z]{2}\b(?=\s*$|\s*,|\s+\d{5})/)
		if (stateMatch && stateAbbreviations.has(stateMatch[0])) {
			return stateMatch[0]
		}
	}

	return undefined
}

function statIcon(label: string) {
	const normalized = label.toLowerCase()
	if (normalized.includes('budget') || normalized.includes('price'))
		return Banknote
	if (normalized.includes('communication')) return MessageSquare
	if (normalized.includes('involvement')) return Target
	if (normalized.includes('exclusiv')) return Shield
	if (normalized.includes('negotiation')) return Scale
	if (normalized.includes('response')) return Clock
	if (normalized.includes('experience') || normalized.includes('buyer'))
		return Star
	if (normalized.includes('property') || normalized.includes('home'))
		return Home
	if (normalized.includes('location')) return MapPin
	return Zap
}

export const Route = createFileRoute('/_app/matches')({
	beforeLoad: async () => {
		const draft = getStoredConsumerDraftForFlow('buyer')
		const hasDraftAnswers = Object.keys(draft.answers ?? {}).length > 0
		const session = await getCurrentSession()

		if (!session) {
			if (!hasDraftAnswers) {
				throw redirect({ to: '/buyer/intake', search: { step: 'intro' } })
			}
			throw redirect({ to: '/buyer/preview' })
		}

		const userSettings = await getUserSettings()
		const hasSavedAnswers = Object.keys(userSettings?.answers ?? {}).length > 0

		if (!hasDraftAnswers && !hasSavedAnswers) {
			throw redirect({ to: '/buyer/intake', search: { step: 'intro' } })
		}
	},
	component: Matches,
})

function Matches() {
	const [showPaywall, setShowPaywall] = useState(false)
	const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([])
	const { data: session } = authClient.useSession()
	const draft = useMemo(() => getStoredConsumerDraftForFlow('buyer'), [])

	const { data: premiumStatus, refetch: refetchPremium } = useQuery({
		queryKey: ['user-premium'],
		queryFn: isUserPremium,
	})
	const isLocked = !premiumStatus

	const { data: matches = [], isLoading } = useQuery({
		queryKey: ['agent-matches'],
		queryFn: getAgentMatches,
	})
	const { data: userSettings } = useQuery({
		queryKey: ['user-settings'],
		queryFn: getUserSettings,
	})
	const stateCode = resolveStateCode(
		draft.state,
		userSettings?.state,
		draft.zipCode,
		userSettings?.zipCode,
	)

	const handleUpgrade = () => {
		void refetchPremium()
	}

	const toggleSelectedMatch = (matchId: string) => {
		setSelectedMatchIds((current) => {
			if (current.includes(matchId)) {
				return current.filter((id) => id !== matchId)
			}

			if (current.length >= 3) {
				return current
			}

			return [...current, matchId]
		})
	}

	return (
		<div className="mx-auto w-full max-w-5xl px-6 py-12 xl:mx-0 xl:ml-[calc((100vw-64rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Menu</span>
			</div>

			<div className="mx-auto mb-8 max-w-4xl">
				<div className="flex items-center gap-4">
					<div className="from-primary to-primary/70 text-primary-foreground shadow-primary/20 ring-primary/20 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ring-1">
						<ArrowRightLeft className="h-5 w-5" />
					</div>
					<div>
						<h1 className="text-3xl">Matches</h1>
					</div>
				</div>
			</div>

			{isLocked && (
				<div className="mx-auto mb-6 flex max-w-4xl items-center gap-3 rounded-xl border bg-amber-50/50 px-4 py-3 dark:bg-amber-950/20">
					<Lock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
					<p className="text-sm">
						Preview mode — upgrade to unlock full match details and connect with
						agents.
					</p>
					<Button
						size="sm"
						className="ml-auto shrink-0"
						onClick={() => setShowPaywall(true)}
					>
						Unlock
					</Button>
				</div>
			)}

			<div className="mx-auto mb-6 max-w-4xl space-y-3">
				<PreferencesSummaryCard
					settings={userSettings}
					name={session?.user?.name}
					state={stateCode}
				/>
			</div>

			<div className="mx-auto max-w-4xl">
				{isLoading ? (
					<Card className="py-16 text-center">
						<p className="text-muted-foreground text-sm">Loading matches...</p>
					</Card>
				) : matches.length === 0 ? (
					<Card className="py-16 text-center">
						<Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
						<p className="text-muted-foreground text-sm">
							No matches available yet.
						</p>
					</Card>
				) : (
					<Card className="overflow-hidden p-0">
						<MatchListHeader
							selectedCount={selectedMatchIds.length}
							locked={isLocked}
							onUnlock={() => setShowPaywall(true)}
						/>
						<div className="divide-y">
							{matches.map((match) => (
								<CompactMatchRow
									key={match.id}
									match={match}
									locked={isLocked}
									selected={selectedMatchIds.includes(match.id)}
									selectionDisabled={
										selectedMatchIds.length >= 3 &&
										!selectedMatchIds.includes(match.id)
									}
									onToggleSelected={() => toggleSelectedMatch(match.id)}
									onUnlock={() => setShowPaywall(true)}
								/>
							))}
						</div>
					</Card>
				)}
			</div>

			<PaywallDialog
				open={showPaywall}
				onOpenChange={setShowPaywall}
				onUpgrade={handleUpgrade}
			/>
		</div>
	)
}

function PreferencesSummaryCard({
	settings,
	name,
	state,
}: {
	settings: Awaited<ReturnType<typeof getUserSettings>> | undefined
	name?: string | null | undefined
	state?: string | undefined
}) {
	const items = useMemo(() => getPreferenceSummaryItems(settings), [settings])
	const stateSvgFile = state ? stateNames[state] : null

	return (
		<Card className="p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<div className="mb-5 flex items-center gap-3">
						<div className="bg-primary/8 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
							{stateSvgFile ? (
								<img
									src={`/states/${stateSvgFile}.svg`}
									alt={`${state} state icon`}
									className="h-8 w-8 object-contain opacity-85"
								/>
							) : (
								<MapPin className="h-5 w-5" />
							)}
						</div>
						<div>
							<p className="font-heading text-xl font-bold tracking-tight">
								{name ?? 'Your profile'}
							</p>
						</div>
					</div>

					<div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
						{items.map((item) => {
							const Icon = statIcon(item.label)
							return (
								<div
									key={item.label}
									className="flex min-w-0 items-start gap-3"
								>
									<div className="text-primary bg-secondary/70 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
										<Icon className="h-3.5 w-3.5" />
									</div>
									<div className="min-w-0">
										<p className="text-muted-foreground text-[9px] font-bold tracking-[0.15em] uppercase">
											{item.label}
										</p>
										<p className="truncate text-sm font-semibold">
											{item.value}
										</p>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				<Button asChild variant="outline" size="sm" className="shrink-0">
					<Link to="/buyer/intake" search={{ step: 'quiz' }}>
						<Pencil className="mr-1 h-3.5 w-3.5" />
						Edit Preferences
					</Link>
				</Button>
			</div>
		</Card>
	)
}

function MatchListHeader({
	selectedCount,
	locked,
	onUnlock,
}: {
	selectedCount: number
	locked: boolean
	onUnlock: () => void
}) {
	return (
		<div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p className="text-sm font-medium">Choose 1-3 agents to invite</p>
				<p className="text-muted-foreground text-xs">
					{selectedCount} of 3 selected. Expand a row for more details before
					sending.
				</p>
			</div>
			<Button
				disabled={locked || selectedCount === 0}
				onClick={() => {
					if (locked) {
						onUnlock()
					}
				}}
			>
				<Send className="mr-2 h-4 w-4" />
				{selectedCount > 0
					? `Send ${selectedCount} Invitation${selectedCount === 1 ? '' : 's'}`
					: 'Send Invitations'}
			</Button>
		</div>
	)
}

function getPreferenceSummaryItems(
	settings: Awaited<ReturnType<typeof getUserSettings>> | undefined,
) {
	const answers = settings?.answers ?? {}
	const questions = [
		...buyerQuestionFlow.questions,
		...buyerMatchingQuestionFlow.questions,
	]
	const questionsById = new Map(
		questions.map((question) => [question.id, question]),
	)
	const labelOverrides: Record<string, string> = {
		'B.6': 'Communication',
		'B.11': 'Involvement',
		'B.12': 'Exclusivity',
		'B.14': 'Negotiation',
	}
	const profileItems = [
		settings?.zipCode ? { label: 'Location', value: settings.zipCode } : null,
		settings?.priceRange
			? { label: 'Budget', value: settings.priceRange }
			: null,
		settings?.propertyType?.length
			? {
					label: 'Home Type',
					value: settings.propertyType.join(', '),
				}
			: null,
	]

	const answerItems = ['B.6', 'B.11', 'B.12', 'B.14']
		.map((id) => {
			const question = questionsById.get(id)
			const answer = answers[id]
			if (!question || answer === undefined || answer === '__skipped__')
				return null
			return {
				label: labelOverrides[id] ?? question.prompt,
				value: getAnswerSummary(question, answer),
			}
		})
		.filter((item): item is { label: string; value: string } => item !== null)

	return [...profileItems, ...answerItems]
		.filter((item): item is { label: string; value: string } => item !== null)
		.slice(0, 6)
}

function CompactMatchRow({
	match,
	locked,
	selected,
	selectionDisabled,
	onToggleSelected,
	onUnlock,
}: {
	match: MatchDetails
	locked: boolean
	selected: boolean
	selectionDisabled: boolean
	onToggleSelected: () => void
	onUnlock: () => void
}) {
	const statusLabel =
		match.status.charAt(0).toUpperCase() + match.status.slice(1)
	const topSpecialties = match.specialties.slice(0, 3)
	const hiddenSpecialties = match.specialties.length - topSpecialties.length

	return (
		<details
			className={cn(
				'group/match',
				selected && 'bg-primary/[0.03] ring-1 ring-inset ring-primary/25',
			)}
		>
			<summary className="hover:bg-muted/50 grid cursor-pointer list-none gap-3 px-4 py-3 transition sm:grid-cols-[7rem_4.25rem_minmax(0,1fr)_auto] sm:items-center [&::-webkit-details-marker]:hidden">
				<Button
					type="button"
					variant={selected ? 'default' : 'outline'}
					size="sm"
					className="w-fit"
					disabled={locked || selectionDisabled}
					onClick={(event) => {
						event.preventDefault()
						event.stopPropagation()
						onToggleSelected()
					}}
				>
					{selected && <Check className="mr-1 h-3 w-3" />}
					{selected ? 'Selected' : 'Select'}
				</Button>

				<div className="flex items-center gap-3 sm:block">
					<div className="bg-background rounded-xl border px-3 py-2 text-center">
						<div className="text-lg leading-none font-semibold">
							{match.fitScore}%
						</div>
						<div className="text-muted-foreground mt-1 text-[10px] tracking-wide uppercase">
							Fit
						</div>
					</div>
				</div>

				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
						<h3
							className={cn(
								'truncate font-semibold',
								locked && 'blur-sm select-none',
							)}
						>
							{match.name}
						</h3>
						<span className="text-muted-foreground rounded-full border px-2 py-0.5 text-[11px] font-medium">
							{statusLabel}
						</span>
					</div>
					<p className="text-muted-foreground mt-0.5 truncate text-sm">
						{match.agency}
					</p>
					<div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
						<span className="inline-flex items-center gap-1">
							<MapPin className="h-3 w-3" />
							{match.location}
						</span>
						{match.experience && (
							<span className="inline-flex items-center gap-1">
								<Award className="h-3 w-3" />
								{match.experience}
							</span>
						)}
					</div>
				</div>

				<div className="flex items-center justify-between gap-3 sm:justify-end">
					<div className="hidden max-w-64 flex-wrap justify-end gap-1.5 md:flex">
						{topSpecialties.map((specialty) => (
							<span
								key={specialty}
								className="bg-secondary rounded-full px-2 py-0.5 text-[11px]"
							>
								{specialty}
							</span>
						))}
						{hiddenSpecialties > 0 && (
							<span className="bg-secondary rounded-full px-2 py-0.5 text-[11px]">
								+{hiddenSpecialties}
							</span>
						)}
					</div>
					<ChevronDown className="text-muted-foreground h-4 w-4 transition group-open/match:rotate-180" />
				</div>
			</summary>

			<div className="bg-muted/20 border-t px-4 py-4">
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
					<div className="space-y-4">
						<p className="text-muted-foreground text-sm leading-relaxed">
							{match.about}
						</p>

						<div className="flex flex-wrap gap-1.5 md:hidden">
							{match.specialties.map((specialty) => (
								<span
									key={specialty}
									className="bg-secondary rounded-full px-2 py-0.5 text-[11px]"
								>
									{specialty}
								</span>
							))}
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							{Object.entries(match.scores).map(([label, score]) => (
								<ScoreLine key={label} label={label} score={score} />
							))}
						</div>
					</div>

					<div className="bg-background space-y-3 rounded-xl border p-3 text-sm">
						{match.stats && (
							<div className="grid grid-cols-3 gap-2 text-center">
								<Stat label="Deals" value={match.stats.transactions} />
								<Stat label="Days" value={match.stats.avgDays} />
								<Stat label="Rating" value={match.stats.satisfaction} />
							</div>
						)}

						{locked ? (
							<Button className="w-full" onClick={onUnlock}>
								<Lock className="mr-2 h-4 w-4" />
								Unlock Matches
							</Button>
						) : (
							<>
								{match.contact && (
									<div className="text-muted-foreground space-y-1 border-t pt-3 text-xs">
										{match.contact.phone && <div>{match.contact.phone}</div>}
										{match.contact.email && <div>{match.contact.email}</div>}
									</div>
								)}
								<Button
									className="w-full"
									variant={selected ? 'default' : 'outline'}
									disabled={selectionDisabled}
									onClick={onToggleSelected}
								>
									{selected
										? 'Remove from invitations'
										: 'Select for invitation'}
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</details>
	)
}

function ScoreLine({ label, score }: { label: string; score: number }) {
	return (
		<div>
			<div className="mb-1 flex items-center justify-between text-xs">
				<span className="text-muted-foreground">{label}</span>
				<span>{score.toFixed(1)}</span>
			</div>
			<div className="bg-border h-1 overflow-hidden rounded-full">
				<div
					className="bg-primary h-full"
					style={{ width: `${(score / 5) * 100}%` }}
				/>
			</div>
		</div>
	)
}

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div>
			<div className="font-semibold">{value}</div>
			<div className="text-muted-foreground text-[10px] tracking-wide uppercase">
				{label}
			</div>
		</div>
	)
}
