import { createFileRoute, redirect } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
	Banknote,
	Clock,
	Home,
	Loader2,
	Lock,
	Mail,
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
import { toast } from 'sonner'

import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			/>
		</svg>
	)
}

export const Route = createFileRoute('/buyer/preview')({
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
	component: BuyerPreviewRoute,
})

function BuyerPreviewRoute() {
	return (
		<div className="bg-primary min-h-dvh">
			<BuyerPreview />
		</div>
	)
}

function BuyerPreview() {
	const { data: session } = authClient.useSession()
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
		<div className="min-h-dvh w-full lg:bg-slate-50">
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: 'easeOut' }}
				className="mx-auto grid min-h-dvh w-full max-w-[1440px] lg:grid-cols-[minmax(420px,1fr)_1.4fr]"
			>
				{/* Signup panel */}
				<div className="bg-primary relative order-2 flex flex-col justify-center px-6 py-10 text-white sm:px-10 lg:sticky lg:top-0 lg:order-1 lg:h-dvh lg:px-12 lg:py-16 xl:px-20">
					<div className="mx-auto w-full max-w-md">
						<div className="mb-8">
							<Link
								to="/"
								className="mb-8 inline-flex items-center gap-3 text-lg font-semibold text-white hover:text-white"
							>
								<img
									src="/logomark-light.svg"
									alt="Peace of Real Estate"
									className="h-10 w-10"
								/>
								Peace of Real Estate
							</Link>

							<h1 className="font-heading text-3xl tracking-tight text-white md:text-4xl">
								Create your profile to{' '}
								<span className="text-accent">unlock</span> your matches
							</h1>
							<p className="mt-3 text-base leading-relaxed text-white/70">
								Save your personalized buyer profile, view ranked agent matches,
								and connect with agents who fit your style.
							</p>
						</div>

						<SignupForm />

						<p className="mt-6 text-center text-xs text-white/60">
							Already have an account?{' '}
							<Link
								to="/login"
								search={{ redirect: '/buyer/complete-profile' }}
								className="hover:text-accent font-medium text-white underline underline-offset-4"
							>
								Log in
							</Link>
						</p>
					</div>
				</div>

				{/* Preview panel */}
				<div className="order-1 flex flex-col justify-center px-5 py-10 sm:px-8 lg:order-2 lg:px-12 lg:py-16 xl:px-20">
					<div className="mx-auto w-full max-w-2xl space-y-6">
						<div>
							<span className="text-primary mb-2 inline-block text-xs font-bold tracking-[0.16em] uppercase">
								Preview
							</span>
							<h2 className="font-heading text-3xl tracking-tight text-slate-950 md:text-4xl">
								Your Buyer Profile
							</h2>
							<p className="text-muted-foreground mt-2 max-w-md text-base leading-relaxed">
								Based on your quiz answers.
							</p>
						</div>

						<Card className="gap-0 rounded-3xl border-slate-200 bg-white p-0 shadow-sm">
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
											{statusLabel ? <span aria-hidden="true">/</span> : null}
											<span>Profile built from your answers</span>
										</p>
									</div>
								</div>
							</div>

							{summaryItems.length > 0 ? (
								<div className="grid grid-cols-1 gap-4 px-5 pt-3 pb-5 sm:grid-cols-2">
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

						{previewMatch ? (
							<div className="pt-2">
								<div className="mb-3 px-1">
									<h3 className="font-heading text-lg font-bold tracking-tight text-slate-950">
										Your Top Match
									</h3>
								</div>
								<MatchCardModern match={previewMatch} locked />
							</div>
						) : null}
					</div>
				</div>
			</motion.div>
		</div>
	)
}

function SignupForm() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const [googleAvailable, setGoogleAvailable] = useState(true)

	const redirect = '/buyer/complete-profile'
	const callbackURL =
		typeof window !== 'undefined'
			? new URL(redirect, window.location.origin).toString()
			: redirect

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true)
		try {
			const { data, error } = await authClient.signIn.social({
				provider: 'google',
				callbackURL,
			})
			if (error) throw error
			window.location.assign(data?.url ?? redirect)
		} catch (error) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				error.code === 'PROVIDER_NOT_FOUND'
			) {
				setGoogleAvailable(false)
				toast.error(
					'Google login is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.development.',
				)
			} else {
				toast.error('Google sign-in failed. Try again.')
			}
			console.error('Google sign-in failed', error)
			setIsGoogleLoading(false)
		}
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (isSubmitting) return
		setIsSubmitting(true)

		try {
			const { error } = await authClient.signUp.email({
				name: name.trim(),
				email: email.trim(),
				password,
				callbackURL,
			})
			if (error) throw error
			window.location.assign(redirect)
		} catch (error) {
			const message =
				error && typeof error === 'object' && 'message' in error
					? String(error.message)
					: 'Unable to create account. Try again.'
			toast.error(message)
			console.error('Sign-up failed', error)
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-5">
			<form className="space-y-4" onSubmit={handleSubmit}>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="name" className="text-white/80">
							Full name
						</FieldLabel>
						<div className="relative">
							<User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
							<Input
								id="name"
								placeholder="Jordan Lee"
								value={name}
								onChange={(event) => setName(event.target.value)}
								disabled={isSubmitting || isGoogleLoading}
								required
								className="h-11 rounded-xl border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40"
							/>
						</div>
					</Field>
					<Field>
						<FieldLabel htmlFor="email" className="text-white/80">
							Email address
						</FieldLabel>
						<div className="relative">
							<Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								disabled={isSubmitting || isGoogleLoading}
								autoComplete="email"
								required
								className="h-11 rounded-xl border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40"
							/>
						</div>
					</Field>
					<Field>
						<FieldLabel htmlFor="password" className="text-white/80">
							Password
						</FieldLabel>
						<div className="relative">
							<Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
							<Input
								id="password"
								type="password"
								placeholder="Choose a password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								disabled={isSubmitting || isGoogleLoading}
								autoComplete="new-password"
								required
								className="h-11 rounded-xl border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40"
							/>
						</div>
					</Field>
					<Button
						type="submit"
						disabled={isSubmitting || isGoogleLoading}
						className="bg-accent text-accent-foreground hover:bg-accent/90 h-11 w-full rounded-xl font-semibold"
					>
						{isSubmitting ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : null}
						Create my account
					</Button>
				</FieldGroup>
			</form>

			{googleAvailable ? (
				<>
					<div className="relative py-1 text-center text-xs text-white/40">
						<span className="relative z-10 px-3 text-white/50">or</span>
						<div className="absolute top-1/2 left-0 h-px w-full bg-white/20" />
					</div>

					<Button
						type="button"
						onClick={handleGoogleSignIn}
						disabled={isGoogleLoading || isSubmitting}
						variant="outline"
						className="h-11 w-full rounded-xl border-white bg-white font-medium text-slate-950 hover:bg-slate-100 hover:text-slate-950"
					>
						{isGoogleLoading ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<GoogleIcon className="mr-2 h-5 w-5" />
						)}
						Continue with Google
					</Button>
				</>
			) : null}

			<p className="text-center text-xs text-white/50">
				By creating an account, you agree to our{' '}
				<a
					href="/terms"
					className="text-white/80 underline underline-offset-2 hover:text-white"
				>
					Terms of Service
				</a>{' '}
				and{' '}
				<a
					href="/privacy"
					className="text-white/80 underline underline-offset-2 hover:text-white"
				>
					Privacy Policy
				</a>
				.
			</p>
		</div>
	)
}
