import { Link } from '@tanstack/react-router'
import {
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

import { AgentPreviewCard } from '@/components/match/card'
import { MobileSignupBanner } from '@/components/signup/mobile-signup-banner'
import { SignupForm } from '@/components/signup/signup-form'
import { Card } from '@/components/ui/card'
import {
	createConsumerProfileFromDraft,
	draftToConsumerProfileUpdate,
	loadConsumerDraft,
	type ConsumerDraft,
} from '@/lib/drafts'
import {
	consumerQuestionFlow,
	getAnswerSummary,
	propertyTypeOptions,
	type AnswerValue,
	type Answers,
} from '@/lib/matching/questions'
import type { ConsumerProfile } from '@/lib/matching/profile'
import {
	formatPriceRange,
	parsePriceRange,
} from '@/components/signup/price-range'
import { useIsBelowDesktop } from '@/hooks/use-is-below-desktop'

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

export function draftToPreviewProfile(draft: ConsumerDraft): ConsumerProfile {
	const update = draftToConsumerProfileUpdate(draft)
	const now = new Date()

	return {
		id: 'preview',
		userId: 'preview',
		status: 'draft',
		intent: update.intent ?? 'buying',
		createdAt: now,
		updatedAt: now,
		location: update.location ?? null,
		state: update.state ?? null,
		priceRange: update.priceRange ?? null,
		estimatedHomeValue: null,
		propertyTypes: update.propertyTypes ?? null,
		experienceLevel: update.experienceLevel ?? null,
		preferredContactMethod: update.preferredContactMethod ?? null,
		involvementLevel: update.involvementLevel ?? null,
		representationPreference: update.representationPreference ?? null,
		commissionComfort: update.commissionComfort ?? null,
		matchPriorities: update.matchPriorities ?? null,
		matchDetails: null,
	}
}

export function ConsumerPreview({ profile }: { profile: ConsumerProfile }) {
	const showMobileSignup = useIsBelowDesktop()

	const stateSvgPath = getStateSvgPath(profile.state ?? undefined)
	const summaryItems = getProfileStats(profile)

	const previewMatches = consumerMatches.slice(0, 3)
	const locationLabel = profile.state ?? profile.location
	const experienceLabel = getExperienceLabel(
		profile.experienceLevel ?? undefined,
	).label
	const profileTitle = locationLabel
		? `${experienceLabel} in ${locationLabel}`
		: experienceLabel

	return (
		<div className="min-h-dvh w-full bg-slate-50 lg:bg-slate-50">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.45, ease: 'easeOut' }}
				className="mx-auto grid min-h-dvh w-full max-w-[1440px] lg:grid-cols-[minmax(420px,1fr)_1.4fr]"
			>
				{/* Signup panel */}
				<div className="bg-primary relative order-2 hidden flex-col justify-center px-6 py-10 text-white sm:px-10 lg:sticky lg:top-0 lg:order-1 lg:flex lg:h-dvh lg:px-12 lg:py-16 xl:px-20">
					<div className="mx-auto w-full max-w-md">
						<div className="mb-3 lg:mb-8">
							<Link
								to="/"
								className="mb-8 hidden items-center gap-3 text-lg font-semibold text-white hover:text-white lg:inline-flex"
							>
								<img
									src="/logomark-light.svg"
									alt="Peace of Real Estate"
									className="h-10 w-10"
								/>
								Peace of Real Estate
							</Link>

							<h1 className="font-heading text-xl tracking-tight text-white lg:text-3xl xl:text-4xl">
								Create your profile to{' '}
								<span className="text-accent">unlock</span> your matches
							</h1>
							<p className="mt-1 text-xs leading-relaxed text-white/70 lg:mt-3 lg:text-base">
								Save your personalized consumer profile, view ranked agent
								matches, and connect with agents who fit your style.
							</p>
						</div>

						<SignupForm
							idPrefix="desktop-signup"
							redirect="/consumer/dashboard"
							createProfile={createConsumerProfileFromDraft}
							loadDraft={loadConsumerDraft}
							clearDraft={clearConsumerDraft}
						/>
					</div>
				</div>

				{/* Preview panel */}
				<div className="order-1 flex flex-col px-5 pt-8 pb-[calc(12rem+env(safe-area-inset-bottom))] sm:px-8 lg:order-2 lg:justify-center lg:px-12 lg:py-16 xl:px-20">
					<div className="mx-auto w-full max-w-2xl space-y-6">
						<div>
							<span className="mb-2 inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold tracking-[0.16em] text-amber-900 uppercase">
								Preview
							</span>
							<h2 className="font-heading text-3xl tracking-tight text-slate-950 md:text-4xl">
								Your Profile
							</h2>
							<p className="text-muted-foreground mt-2 max-w-md text-base leading-relaxed">
								Based on your quiz answers.
							</p>
						</div>

						<Card className="gap-0 rounded-2xl border-slate-200 bg-white p-0 shadow-sm">
							<div className="flex items-center gap-4 px-5 pt-5 pb-4">
								<div className="bg-primary/8 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
									{stateSvgPath ? (
										<img
											src={stateSvgPath}
											alt={`${profile.state} state icon`}
											className="h-8 w-8 object-contain opacity-85"
										/>
									) : profile.location ? (
										<MapPin className="h-5 w-5" />
									) : (
										<User className="h-5 w-5" />
									)}
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="font-heading text-xl font-bold tracking-tight text-slate-950">
										{profileTitle}
									</h3>
								</div>
							</div>

							{summaryItems.length > 0 ? (
								<div className="grid grid-cols-1 gap-3 border-t border-slate-100 px-5 pt-4 pb-5 sm:grid-cols-2">
									{summaryItems.map((item) => {
										const Icon = statIcon(item.label)
										return (
											<div key={item.label} className="flex items-start gap-3">
												<div className="text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50">
													<Icon className="h-4 w-4" />
												</div>
												<div className="min-w-0 flex-1">
													<p className="text-muted-foreground text-[10px] font-bold tracking-[0.15em] uppercase">
														{item.label}
													</p>
													<p className="text-sm font-semibold text-slate-950">
														{item.value}
													</p>
												</div>
											</div>
										)
									})}
								</div>
							) : null}
						</Card>

						{previewMatches.length > 0 ? (
							<div className="pt-2">
								<div className="mb-3 px-1">
									<h3 className="font-heading text-lg font-bold tracking-tight text-slate-950">
										Your Top Matches
									</h3>
									<p className="text-muted-foreground mt-0.5 text-sm">
										Create an account to unlock full profiles and connect.
									</p>
								</div>
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
									{previewMatches.map((match) => (
										<AgentPreviewCard key={match.id} match={match} />
									))}
								</div>
							</div>
						) : null}
					</div>
				</div>
			</motion.div>
			{showMobileSignup ? (
				<MobileSignupBanner
					title="Unlock your matches"
					subtitle="Create your profile to view full agent matches."
					ctaLabel="Create account"
					redirect="/consumer/dashboard"
					createProfile={createConsumerProfileFromDraft}
					loadDraft={loadConsumerDraft}
					clearDraft={clearConsumerDraft}
				/>
			) : null}
		</div>
	)
}

function getStateSvgPath(state?: string) {
	if (!state) return undefined
	return `/states/${state}.svg`
}

const answerLabelOverrides: Record<string, string> = {
	preferredContactMethod: 'Communication',
	involvementLevel: 'Involvement',
	representationPreference: 'Exclusivity',
	commissionComfort: 'Negotiation',
}

const experienceLevelPills: Record<
	string,
	{ label: string; className: string }
> = {
	firstTime: {
		label: 'First-time buyer',
		className: 'bg-sky-100 text-sky-950 ring-sky-200/80',
	},
	experienced: {
		label: 'Experienced buyer',
		className: 'bg-indigo-100 text-indigo-950 ring-indigo-200/80',
	},
	veryExperienced: {
		label: 'Expert buyer',
		className: 'bg-emerald-100 text-emerald-950 ring-emerald-200/80',
	},
}

function getProfileStats(profile: ConsumerProfile) {
	const stats: { label: string; value: string }[] = []

	if (profile.priceRange) {
		stats.push({
			label: 'Budget',
			value: formatPriceRange(parsePriceRange(profile.priceRange)),
		})
	}

	if (profile.propertyTypes && profile.propertyTypes.length > 0) {
		stats.push({
			label: 'Home Type',
			value: profile.propertyTypes
				.map(
					(type) =>
						(propertyTypeOptions as Record<string, string>)[type] ?? type,
				)
				.join(', '),
		})
	}

	const answers: Answers = {
		...(profile.preferredContactMethod
			? { preferredContactMethod: profile.preferredContactMethod }
			: {}),
		...(profile.involvementLevel
			? { involvementLevel: profile.involvementLevel }
			: {}),
		...(profile.representationPreference
			? { representationPreference: profile.representationPreference }
			: {}),
		...(profile.commissionComfort
			? { commissionComfort: profile.commissionComfort }
			: {}),
		...(profile.experienceLevel
			? { experienceLevel: profile.experienceLevel }
			: {}),
	}

	for (const [id, value] of Object.entries(answers)) {
		if (value === '__skipped__') continue
		const question = consumerQuestionFlow.questions.find((q) => q.id === id)
		if (!question) continue
		stats.push({
			label: answerLabelOverrides[id] ?? question.title,
			value: getAnswerSummary(question, value as AnswerValue),
		})
	}

	return stats
}

function getExperienceLabel(experienceLevel?: string) {
	if (!experienceLevel) return { label: 'Buyer' }
	return experienceLevelPills[experienceLevel] ?? { label: experienceLevel }
}

import { clearConsumerDraft } from '@/lib/drafts'
import { consumerMatches } from './mock-matches'
