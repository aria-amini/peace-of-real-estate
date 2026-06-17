import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
	ArrowRight,
	Banknote,
	Clock,
	Home,
	MapPin,
	MessageSquare,
	Scale,
	Shield,
	Star,
	Target,
	User,
	Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { SignupDialog } from '@/components/signup-dialog'
import { consumerMatches } from '@/components/consumer-flow-pages'
import { MatchCardModern } from '@/components/match-card-variants'
import {
	buyerMatchingQuestionFlow,
	buyerQuestionFlow,
} from '@/lib/matching/questions'
import { getAnswerSummary } from '@/lib/matching/settings'
import { getStoredConsumerDraftForFlow } from '@/lib/matching/intake-draft'
import { getCurrentSession } from '@/lib/auth/functions'

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
	return Zap
}

export const Route = createFileRoute('/_app/buyer/preview')({
	beforeLoad: async () => {
		const session = await getCurrentSession()
		if (session) {
			throw redirect({ to: '/matches' })
		}

		const draft = getStoredConsumerDraftForFlow('buyer')
		const hasAnswers = Object.keys(draft.answers ?? {}).length > 0
		if (!hasAnswers) {
			throw redirect({ to: '/buyer/intake', search: { step: 'intro' } })
		}
	},
	component: BuyerPreview,
})

function BuyerPreview() {
	const { data: session } = authClient.useSession()
	const [signupOpen, setSignupOpen] = useState(false)
	const draft = useMemo(() => getStoredConsumerDraftForFlow('buyer'), [])
	const stateSvgPath = useMemo(() => {
		if (!draft.state) return null
		const fileName = stateNames[draft.state]
		if (!fileName) return null
		return `/states/${fileName}.svg`
	}, [draft.state])
	const allQuestions = useMemo(
		() => [
			...buyerQuestionFlow.questions,
			...buyerMatchingQuestionFlow.questions,
		],
		[],
	)
	const questionsById = useMemo(
		() => new Map(allQuestions.map((q) => [q.id, q])),
		[allQuestions],
	)
	const summaryItems = useMemo(() => {
		const answers = draft.answers ?? {}
		const hiddenPreviewQuestionIds = new Set([
			'B.1',
			'B.3',
			'B.4',
			'B.8',
			'B.9',
		])
		const labelOverrides: Record<string, string> = {
			'B.6': 'Communication',
			'B.11': 'Involvement',
			'B.12': 'Exclusivity',
			'B.14': 'Negotiation',
		}
		const propertyTypeMap: Record<string, string> = {
			'Single-Family': 'Single family home',
			'Condo/Townhome': 'Condo or townhome',
			'Multi-family': 'Multi-family home',
			Land: 'Land',
		}

		const profileStats = [
			draft.priceRange ? { label: 'Budget', value: draft.priceRange } : null,
			draft.propertyType?.length
				? {
						label: 'Home Type',
						value: draft.propertyType
							.map((type) => propertyTypeMap[type] ?? type)
							.join(', '),
					}
				: null,
		].filter((item): item is { label: string; value: string } => item !== null)

		const preferenceStats = Object.entries(answers)
			.filter(
				([id, value]) =>
					value !== '__skipped__' && !hiddenPreviewQuestionIds.has(id),
			)
			.map(([id, value]) => {
				const question = questionsById.get(id)
				if (!question) return null
				return {
					label: labelOverrides[id] ?? question.prompt,
					value: getAnswerSummary(
						question,
						value as number | number[] | string,
					),
				}
			})
			.filter((item): item is { label: string; value: string } => item !== null)

		return [...profileStats, ...preferenceStats]
	}, [draft.answers, draft.priceRange, draft.propertyType, questionsById])

	const buyerLevelPill = useMemo(() => {
		if (!draft.experienceLevel) return null

		const levels: Record<string, { label: string; className: string }> = {
			'First-time client': {
				label: 'First-time buyer',
				className: 'bg-sky-100 text-sky-950 ring-sky-200/80',
			},
			"I've done this before": {
				label: 'Experienced buyer',
				className: 'bg-indigo-100 text-indigo-950 ring-indigo-200/80',
			},
			"I'm very experienced": {
				label: 'Expert buyer',
				className: 'bg-emerald-100 text-emerald-950 ring-emerald-200/80',
			},
		}

		return (
			levels[draft.experienceLevel] ?? {
				label: draft.experienceLevel,
				className: 'bg-white/14 text-white ring-white/20',
			}
		)
	}, [draft.experienceLevel])

	const previewMatch = consumerMatches[0]
	const primaryItems = summaryItems.slice(0, 2)
	const preferenceItems = summaryItems.slice(2)
	const locationLabel = draft.state ?? draft.zipCode
	const experienceLabel = buyerLevelPill?.label ?? 'Buyer'
	const profileTitle = locationLabel
		? `${experienceLabel} in ${locationLabel}`
		: experienceLabel
	const statusLabel = draft.intent === 'Buy' ? 'Buying' : draft.intent

	if (session) {
		return null
	}

	return (
		<div className="min-h-dvh w-full bg-slate-100">
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: 'easeOut' }}
			>
				<section className="px-5 pt-8 pb-8">
					<div className="mx-auto w-full max-w-xl">
						<div className="mb-6 flex items-center gap-2 md:hidden">
							<SidebarTrigger />
							<span className="text-sm font-medium">Menu</span>
						</div>

						<div className="rounded-3xl border border-slate-200 bg-white px-4 py-7 shadow-sm sm:px-6">
							<div className="text-center">
								<h1 className="font-heading text-3xl tracking-tight text-slate-950 md:text-4xl">
									Your Buyer Profile Is Ready
								</h1>
								<p className="text-muted-foreground mx-auto mt-3 max-w-md text-base leading-relaxed">
									Create a free account to see your ranked matches.
								</p>
							</div>

							<div className="mt-6 space-y-4">
								<Card className="gap-0 rounded-none border-x-0 border-y border-slate-200/80 bg-slate-50/50 p-0 shadow-none">
									<div className="px-5 pt-5 pb-3">
										<div className="flex items-center gap-4">
											<div className="bg-primary/8 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
												{stateSvgPath ? (
													<img
														src={stateSvgPath}
														alt={`${draft.state} state icon`}
														className="h-8 w-8 object-contain opacity-85"
													/>
												) : draft.zipCode ? (
													<MapPin className="h-5 w-5" />
												) : (
													<User className="h-5 w-5" />
												)}
											</div>
											<div className="min-w-0 flex-1">
												<h3 className="font-heading text-xl font-bold tracking-tight text-slate-950">
													{profileTitle}
												</h3>
												<p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
													{statusLabel ? <span>{statusLabel}</span> : null}
													{statusLabel ? (
														<span aria-hidden="true">/</span>
													) : null}
													<span>Profile built from your answers</span>
												</p>
											</div>
										</div>
									</div>

									{summaryItems.length > 0 ? (
										<div className="space-y-5 px-5 pt-3 pb-5">
											{primaryItems.length > 0 ? (
												<div>
													<p className="text-muted-foreground mb-3 text-[10px] font-bold tracking-[0.18em] uppercase">
														Key Details
													</p>
													<div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
														{primaryItems.map((item) => {
															const Icon = statIcon(item.label)
															return (
																<div key={item.label} className="min-w-0">
																	<div className="text-primary mb-1.5 flex items-center gap-2">
																		<Icon className="h-4 w-4" />
																		<p className="text-muted-foreground text-[10px] font-bold tracking-[0.16em] uppercase">
																			{item.label}
																		</p>
																	</div>
																	<p className="text-lg font-bold tracking-tight text-slate-950">
																		{item.value}
																	</p>
																</div>
															)
														})}
													</div>
												</div>
											) : null}

											{preferenceItems.length > 0 ? (
												<div>
													<p className="text-muted-foreground mb-3 text-[10px] font-bold tracking-[0.18em] uppercase">
														Working Preferences
													</p>
													<div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
														{preferenceItems.map((item) => {
															const Icon = statIcon(item.label)
															return (
																<div
																	key={item.label}
																	className="flex min-w-0 items-start gap-3"
																>
																	<div className="text-primary mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50">
																		<Icon className="h-3.5 w-3.5" />
																	</div>
																	<div className="min-w-0 flex-1">
																		<p className="text-muted-foreground text-[9px] font-bold tracking-[0.15em] uppercase">
																			{item.label}
																		</p>
																		<p className="truncate text-sm font-semibold text-slate-950">
																			{item.value}
																		</p>
																	</div>
																</div>
															)
														})}
													</div>
												</div>
											) : null}
										</div>
									) : null}
								</Card>

								<div className="flex justify-center">
									<Button
										size="lg"
										className="h-12 rounded-xl px-8 text-base shadow-md transition-shadow hover:shadow-lg"
										onClick={() => setSignupOpen(true)}
									>
										Create free profile
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				</section>

				{previewMatch ? (
					<section className="bg-slate-100 px-5 pt-6 pb-10">
						<div className="mx-auto mb-4 max-w-xl px-1">
							<div className="flex items-center justify-center gap-2">
								<h2 className="font-heading text-lg font-bold tracking-tight">
									Your Top Match
								</h2>
								<span className="bg-primary/10 text-primary ring-primary/20 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] uppercase ring-1">
									Preview
								</span>
							</div>
						</div>
						<MatchCardModern match={previewMatch} locked />
					</section>
				) : null}
			</motion.div>

			<SignupDialog open={signupOpen} onOpenChange={setSignupOpen} />
		</div>
	)
}
