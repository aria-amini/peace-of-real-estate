import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from '@tanstack/react-router'
import {
	Banknote,
	Briefcase,
	Clock,
	Home,
	Loader2,
	Mail,
	MapPin,
	Shield,
	Star,
	User,
	Users,
	Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useServerFn } from '@tanstack/react-start'

import { authClient } from '@/lib/auth/client'
import { getCurrentSession } from '@/lib/auth/functions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import { AgentPreviewCard } from '@/components/match-card-variants'
import { createAgentProfileFromDraft } from '@/lib/agent-profile/create-from-draft'
import {
	draftToAgentProfileUpdate,
	loadAgentDraft,
	type AgentDraft,
} from '@/lib/agent-draft-storage'
import { agentQuestionFlow } from '@/lib/matching/questions'
import { loadAgentProfile } from '@/lib/matching/profile.db'
import type { AgentProfile } from '@/lib/matching/profile.types'
import { formatPriceRange, parsePriceRange } from '@/lib/price-range'
import { consumerMatches } from '@/components/consumer-flow-pages'

function draftToPreviewProfile(draft: AgentDraft): AgentProfile {
	const update = draftToAgentProfileUpdate(draft)
	const now = new Date()

	return {
		id: 'preview',
		userId: 'preview',
		status: 'draft',
		createdAt: now,
		updatedAt: now,
		representationSide: update.representationSide ?? null,
		typicalPriceRange: update.typicalPriceRange ?? null,
		bestClientTypes: update.bestClientTypes ?? [],
		notFitFor: update.notFitFor ?? null,
		communicationCadence: update.communicationCadence ?? null,
		quickContactStyle: update.quickContactStyle ?? null,
		updateDeliveryStyle: update.updateDeliveryStyle ?? null,
		responseTime: update.responseTime ?? null,
		transparencyStyle: update.transparencyStyle ?? null,
		clientBoundaryStyle: update.clientBoundaryStyle ?? null,
		negotiationEthic: update.negotiationEthic ?? null,
		dualAgencyStyle: update.dualAgencyStyle ?? null,
		energyStyle: update.energyStyle ?? null,
		teachingStyle: update.teachingStyle ?? null,
		dealStressStyle: update.dealStressStyle ?? null,
		decisionMakingStyle: update.decisionMakingStyle ?? null,
		serviceDepth: update.serviceDepth ?? null,
		involvementLevel: update.involvementLevel ?? null,
		representationPreference: update.representationPreference ?? null,
		matchPriorities: update.matchPriorities ?? [],
		valueProposition: update.valueProposition ?? null,
		idealClientDescription: update.idealClientDescription ?? null,
		whyIStarted: update.whyIStarted ?? null,
		typicalDayInDeal: update.typicalDayInDeal ?? null,
		hardNo: update.hardNo ?? null,
		valueBeyondTransaction: update.valueBeyondTransaction ?? null,
		firstName: update.firstName ?? null,
		lastName: update.lastName ?? null,
		brokerageName: update.brokerageName ?? null,
		email: update.email ?? null,
		phone: update.phone ?? null,
		businessAddress: update.businessAddress ?? null,
		billingAddress: null,
		licenseNumberState: update.licenseNumberState ?? null,
		serviceAreas: update.serviceAreas ?? [],
		yearsLicensed: update.yearsLicensed ?? null,
		averageTransactions: update.averageTransactions ?? null,
		employmentStatus: update.employmentStatus ?? null,
		licenseProof: update.licenseProof ?? null,
		clientFirstTerms: update.clientFirstTerms ?? null,
		deepProfileStatus: 'not_started',
		deepProfileCompletedAt: null,
		usePaxWriter: true,
		licenseAttested: update.licenseAttested ?? false,
		eoInsuranceStatus: update.eoInsuranceStatus ?? null,
		peacePactSigned: update.peacePactSigned ?? false,
		peacePactSignature: update.peacePactSignature ?? null,
		peacePactSignedAt: null,
	}
}

export const Route = createFileRoute('/agent/preview')({
	ssr: false,
	beforeLoad: async () => {
		const session = await getCurrentSession()

		if (session) {
			const profile = await loadAgentProfile()
			if (profile) {
				return { profile }
			}
		}

		const draft = loadAgentDraft()
		if (draft) {
			return { profile: draftToPreviewProfile(draft) }
		}

		throw redirect({ to: '/agent/intake', search: { step: 'welcome' } })
	},
	component: AgentPreviewRoute,
})

function AgentPreviewRoute() {
	const { profile } = Route.useRouteContext()
	const showMobileSignup = useIsBelowDesktop()

	return (
		<div className="min-h-dvh w-full bg-slate-50">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.45, ease: 'easeOut' }}
				className="mx-auto grid min-h-dvh w-full max-w-[1440px] lg:grid-cols-[minmax(420px,1fr)_1.4fr]"
			>
				{/* Signup / activate panel */}
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
								<span className="text-accent">start matching</span> with
								consumers
							</h1>
							<p className="mt-1 text-xs leading-relaxed text-white/70 lg:mt-3 lg:text-base">
								Save your agent profile, appear in consumer matches, and build
								your deep profile over time.
							</p>
						</div>

						<AgentSignupForm idPrefix="desktop-signup" />
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
								Your Agent Profile
							</h2>
							<p className="text-muted-foreground mt-2 max-w-md text-base leading-relaxed">
								Based on your essentials. Consumers will see this when you
								match.
							</p>
						</div>

						<AgentProfileCard profile={profile} />
						<AgentMatchesPreview />
					</div>
				</div>
			</motion.div>
			{showMobileSignup ? <MobileAgentSignupBanner /> : null}
		</div>
	)
}

function useIsBelowDesktop() {
	const [isBelowDesktop, setIsBelowDesktop] = useState(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia('(max-width: 1023px)')
		const update = () => setIsBelowDesktop(mediaQuery.matches)

		update()
		mediaQuery.addEventListener('change', update)
		return () => mediaQuery.removeEventListener('change', update)
	}, [])

	return isBelowDesktop
}

function statIcon(label: string) {
	const normalized = label.toLowerCase()
	if (normalized.includes('price') || normalized.includes('budget'))
		return Banknote
	if (normalized.includes('side') || normalized.includes('clients'))
		return Users
	if (normalized.includes('area') || normalized.includes('location'))
		return MapPin
	if (normalized.includes('license') || normalized.includes('insured'))
		return Shield
	if (normalized.includes('experience') || normalized.includes('years'))
		return Star
	if (normalized.includes('transaction') || normalized.includes('volume'))
		return Home
	if (normalized.includes('contact') || normalized.includes('response'))
		return Clock
	if (normalized.includes('brokerage') || normalized.includes('work'))
		return Briefcase
	return Zap
}

function getProfileStats(profile: AgentProfile) {
	const stats: { label: string; value: string }[] = []

	if (profile.typicalPriceRange) {
		stats.push({
			label: 'Typical price range',
			value: formatPriceRange(parsePriceRange(profile.typicalPriceRange)),
		})
	}

	if (profile.representationSide) {
		const labels: Record<string, string> = {
			buying: 'Buyer representation',
			selling: 'Seller representation',
			both: 'Buyers & sellers',
		}
		stats.push({
			label: 'Representation',
			value: labels[profile.representationSide] ?? profile.representationSide,
		})
	}

	if (profile.serviceAreas.length > 0) {
		stats.push({
			label: 'Service areas',
			value: profile.serviceAreas.slice(0, 3).join(', '),
		})
	}

	if (profile.bestClientTypes.length > 0) {
		const question = agentQuestionFlow.questions.find(
			(q) => q.id === 'bestClientTypes',
		)
		stats.push({
			label: 'Best clients',
			value: profile.bestClientTypes
				.map((slug) => question?.options[slug] ?? slug)
				.join(', '),
		})
	}

	if (profile.yearsLicensed) {
		const labels: Record<string, string> = {
			'0-2': '0-2 years',
			'3-5': '3-5 years',
			'6-10': '6-10 years',
			'10+': '10+ years',
		}
		stats.push({
			label: 'Experience',
			value: labels[profile.yearsLicensed] ?? profile.yearsLicensed,
		})
	}

	if (profile.averageTransactions) {
		const labels: Record<string, string> = {
			'0-5': '0-5 per year',
			'6-15': '6-15 per year',
			'16-30': '16-30 per year',
			'30+': '30+ per year',
		}
		stats.push({
			label: 'Transaction volume',
			value: labels[profile.averageTransactions] ?? profile.averageTransactions,
		})
	}

	if (profile.eoInsuranceStatus) {
		stats.push({
			label: 'E&O insurance',
			value: profile.eoInsuranceStatus,
		})
	}

	return stats
}

function AgentProfileCard({ profile }: { profile: AgentProfile }) {
	const summaryItems = getProfileStats(profile)
	const fullName = [profile.firstName, profile.lastName]
		.filter(Boolean)
		.join(' ')
	const title = fullName || 'Your Agent Profile'
	const subtitle = profile.brokerageName
		? `${profile.brokerageName}${profile.serviceAreas[0] ? ` · ${profile.serviceAreas[0]}` : ''}`
		: profile.serviceAreas[0]

	return (
		<Card className="gap-0 rounded-2xl border-slate-200 bg-white p-0 shadow-sm">
			<div className="flex items-center gap-4 px-5 pt-5 pb-4">
				<div className="bg-primary/8 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
					<User className="h-5 w-5" />
				</div>
				<div className="min-w-0 flex-1">
					<h3 className="font-heading text-xl font-bold tracking-tight text-slate-950">
						{title}
					</h3>
					{subtitle ? (
						<p className="text-muted-foreground text-sm">{subtitle}</p>
					) : null}
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
	)
}

function AgentMatchesPreview() {
	const previewMatches = consumerMatches.slice(0, 3)

	return (
		<div className="pt-2">
			<div className="mb-3 px-1">
				<h3 className="font-heading text-lg font-bold tracking-tight text-slate-950">
					Your consumer matches will look like this
				</h3>
				<p className="text-muted-foreground mt-0.5 text-sm">
					Create your account to start appearing in consumer matches.
				</p>
			</div>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{previewMatches.map((match) => (
					<AgentPreviewCard key={match.id} match={match} />
				))}
			</div>
		</div>
	)
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

function AgentSignupForm({ idPrefix = 'signup' }: { idPrefix?: string }) {
	const navigate = useNavigate()
	const createProfile = useServerFn(createAgentProfileFromDraft)
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const [googleAvailable, setGoogleAvailable] = useState(true)

	const redirect = '/account'
	const callbackURL = new URL(redirect, window.location.origin).toString()
	const nameId = `${idPrefix}-name`
	const emailId = `${idPrefix}-email`
	const passwordId = `${idPrefix}-password`

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
			})
			if (error) throw error

			const draft = loadAgentDraft()
			if (draft) {
				await createProfile({ data: draft })
			}

			void navigate({ to: '/account' })
		} catch (error) {
			console.error('Signup failed', error)
			toast.error(
				typeof error === 'object' && error && 'message' in error
					? String(error.message)
					: 'Signup failed. Try again.',
			)
			setIsSubmitting(false)
		}
	}

	return (
		<form className="space-y-3 lg:space-y-4" onSubmit={handleSubmit}>
			<div className="space-y-3">
				<div>
					<Label
						htmlFor={nameId}
						className="text-xs font-semibold tracking-wide text-white/70 uppercase"
					>
						Full name
					</Label>
					<Input
						id={nameId}
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="Jane Doe"
						required
						className="mt-1.5 h-12 rounded-xl border-white/20 bg-white/10 px-4 text-white placeholder:text-white/40 focus:border-white focus:ring-white"
					/>
				</div>
				<div>
					<Label
						htmlFor={emailId}
						className="text-xs font-semibold tracking-wide text-white/70 uppercase"
					>
						Email
					</Label>
					<Input
						id={emailId}
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						placeholder="jane@example.com"
						required
						className="mt-1.5 h-12 rounded-xl border-white/20 bg-white/10 px-4 text-white placeholder:text-white/40 focus:border-white focus:ring-white"
					/>
				</div>
				<div>
					<Label
						htmlFor={passwordId}
						className="text-xs font-semibold tracking-wide text-white/70 uppercase"
					>
						Password
					</Label>
					<Input
						id={passwordId}
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						placeholder="Create a password"
						required
						minLength={8}
						className="mt-1.5 h-12 rounded-xl border-white/20 bg-white/10 px-4 text-white placeholder:text-white/40 focus:border-white focus:ring-white"
					/>
				</div>
			</div>

			<Button
				type="submit"
				disabled={isSubmitting}
				className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 w-full rounded-xl text-base font-semibold"
			>
				{isSubmitting ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<Mail className="mr-2 h-4 w-4" />
				)}
				Activate profile
			</Button>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-white/20" />
				</div>
				<div className="relative flex justify-center text-xs">
					<span className="bg-primary px-2 text-white/60">or</span>
				</div>
			</div>

			<Button
				type="button"
				onClick={handleGoogleSignIn}
				disabled={isGoogleLoading || !googleAvailable}
				variant="outline"
				className="h-12 w-full rounded-xl border-white bg-white px-4 text-base font-semibold text-slate-950 hover:bg-slate-100 hover:text-slate-950"
				aria-label="Continue with Google"
			>
				{isGoogleLoading ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<GoogleIcon className="mr-2 h-5 w-5" />
				)}
				Continue with Google
			</Button>
		</form>
	)
}

function MobileAgentSignupBanner() {
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const redirect = '/account'
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

	return (
		<Sheet>
			<div className="bg-primary fixed inset-x-0 bottom-0 z-30 rounded-t-3xl px-4 pt-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] text-white shadow-2xl shadow-slate-950/30 lg:hidden">
				<div className="mx-auto w-full max-w-md space-y-3">
					<div>
						<h2 className="font-heading text-xl leading-tight font-bold text-white">
							Activate your profile
						</h2>
						<p className="mt-1 text-sm leading-snug text-white/70">
							Create your account to start matching with consumers.
						</p>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<SheetTrigger asChild>
							<Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-11 rounded-xl px-4 text-sm font-semibold">
								Create account
							</Button>
						</SheetTrigger>
						<Button
							type="button"
							onClick={handleGoogleSignIn}
							disabled={isGoogleLoading}
							variant="outline"
							className="h-11 rounded-xl border-white bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-100 hover:text-slate-950"
							aria-label="Continue with Google"
						>
							{isGoogleLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<GoogleIcon className="mr-2 h-5 w-5" />
							)}
							Google
						</Button>
					</div>
				</div>
			</div>

			<SheetContent
				side="bottom"
				className="bg-primary max-h-[92dvh] overflow-y-auto rounded-t-3xl border-white/10 px-4 pt-5 pb-[calc(1rem+env(safe-area-inset-bottom))] text-white lg:hidden"
			>
				<SheetHeader className="px-0 pt-0 pb-4 text-left">
					<SheetTitle className="font-heading pr-10 text-2xl tracking-tight text-white">
						Create your profile
					</SheetTitle>
					<SheetDescription className="text-white/70">
						Save your agent profile and start matching with consumers.
					</SheetDescription>
				</SheetHeader>
				<AgentSignupForm idPrefix="mobile-signup" />
			</SheetContent>
		</Sheet>
	)
}
