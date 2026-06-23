import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
	ArrowRight,
	BarChart3,
	Briefcase,
	CheckCircle2,
	Clock,
	Crown,
	Edit3,
	ExternalLink,
	Home,
	MessageSquare,
	ShieldCheck,
	Users,
	XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { DASHBOARD_PLACEHOLDER_PIPELINE } from '@/lib/pricing'
import { authClient } from '@/lib/auth/client'
import { loadAgentProfile } from '@/lib/matching/profile'
import {
	agentQuestionFlow,
	questionOptionLabel,
	type Question,
} from '@/lib/matching/questions'
import type { AgentProfile } from '@/lib/matching/profile'
import { isUserPremium } from '@/lib/premium'
import { cn } from '@/lib/utils/ui'

export const Route = createFileRoute('/(app)/agent/dashboard/')({
	component: AgentDashboard,
	loader: () => loadAgentProfile(),
})

const pipelineSteps = [
	{
		label: 'New matches',
		value: DASHBOARD_PLACEHOLDER_PIPELINE.newMatches.toString(),
		icon: Users,
		tone: 'muted' as const,
	},
	{
		label: 'Pending intros',
		value: DASHBOARD_PLACEHOLDER_PIPELINE.pendingIntros.toString(),
		icon: MessageSquare,
		tone: 'primary' as const,
	},
	{
		label: 'Active conversations',
		value: DASHBOARD_PLACEHOLDER_PIPELINE.activeConversations.toString(),
		icon: Home,
		tone: 'muted' as const,
	},
]

const trustBadges = [
	{ label: 'License attested', field: 'licenseAttested', icon: ShieldCheck },
	{ label: 'E\u0026O covered', field: 'eoInsuranceStatus', icon: CheckCircle2 },
	{ label: 'Peace Pact signed', field: 'peacePactSigned', icon: CheckCircle2 },
]

function AgentDashboard() {
	const agentProfile = Route.useLoaderData()
	const { data: session } = authClient.useSession()
	const { data: premiumStatus } = useQuery({
		queryKey: ['user-premium'],
		queryFn: isUserPremium,
		enabled: Boolean(session),
	})

	const tierLabel = premiumStatus ? 'Premium' : 'Free'
	const fullName = [agentProfile?.firstName, agentProfile?.lastName]
		.filter(Boolean)
		.join(' ')
	const displayName = fullName || session?.user.name || 'Your agent profile'
	const initials = getInitials(displayName, session?.user.email)
	const profileStrength = computeProfileStrength(agentProfile)
	const nextStep = getNextStep(agentProfile, profileStrength)

	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-10 xl:mx-0 xl:ml-[calc((100vw-72rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Agent menu</span>
			</div>

			<div className="mb-8 flex items-center gap-4">
				<div className="bg-primary text-primary-foreground flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-base font-semibold">
					{session?.user.image ? (
						<img
							src={session.user.image}
							alt=""
							className="size-full object-cover"
						/>
					) : (
						initials
					)}
				</div>
				<div className="min-w-0">
					<p className="text-muted-foreground text-sm font-medium">
						Agent Dashboard
					</p>
					<h1 className="font-heading truncate text-3xl font-semibold tracking-tight">
						{displayName}
					</h1>
					<p className="text-muted-foreground mt-1 truncate text-sm">
						{agentProfile?.brokerageName
							? `${agentProfile.brokerageName} · ${agentProfile.serviceAreas[0] ?? 'No service area'}`
							: (session?.user.email ?? 'No email on file')}
					</p>
				</div>
			</div>

			<div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
				<div className="space-y-5">
					<Card>
						<CardHeader className="pb-4">
							<div className="flex items-start justify-between gap-4">
								<div>
									<CardTitle className="flex items-center gap-2">
										<Edit3 className="size-4" />
										Profile Strength
									</CardTitle>
									<CardDescription>
										The richer your profile, the better your matches.
									</CardDescription>
								</div>
								<div className="text-2xl font-semibold">{profileStrength}%</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="bg-muted h-2 overflow-hidden rounded-full">
								<div
									className="bg-primary h-full transition-all"
									style={{ width: `${profileStrength}%` }}
								/>
							</div>
							<div className="flex items-start gap-3 rounded-xl border p-3">
								<div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
									<ArrowRight className="size-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium">{nextStep.label}</p>
									<p className="text-muted-foreground text-sm">
										{nextStep.description}
									</p>
								</div>
								<Button asChild variant="outline" size="sm">
									<Link to={nextStep.href}>
										{nextStep.action}
										<ExternalLink className="size-3.5" />
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BarChart3 className="size-4" />
								Pipeline Snapshot
							</CardTitle>
							<CardDescription>
								Where your introductions stand right now.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-3 sm:grid-cols-3">
							{pipelineSteps.map((step) => (
								<div key={step.label} className="rounded-2xl border p-4">
									<div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium uppercase">
										<step.icon className="size-3.5" />
										{step.label}
									</div>
									<div className="text-2xl font-semibold">{step.value}</div>
								</div>
							))}
						</CardContent>
						<CardFooter className="border-t">
							<Button asChild variant="outline" size="sm">
								<Link to="/agent/dashboard/compliance">
									Review compliance
									<ExternalLink className="size-3.5" />
								</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="size-4" />
								Recent Activity
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="rounded-2xl border border-dashed p-6 text-center">
								<MessageSquare className="text-muted-foreground mx-auto mb-3 size-8" />
								<h3 className="font-medium">No recent activity</h3>
								<p className="text-muted-foreground mt-1 text-sm">
									Introductions and consumer matches will appear here.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-5">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Crown className="size-4" />
								Plan
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<div className="text-2xl font-semibold">{tierLabel}</div>
								<p className="text-muted-foreground text-sm">
									{premiumStatus
										? 'Agent subscription is active.'
										: 'Upgrade for priority placement and richer consumer insights.'}
								</p>
							</div>
							<Button variant="outline" size="sm" className="w-full">
								Manage subscription
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ShieldCheck className="size-4" />
								Trust & Compliance
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{trustBadges.map((badge) => {
								const value = agentProfile?.[badge.field as keyof AgentProfile]
								const isSet = Boolean(value)
								return (
									<div
										key={badge.label}
										className="flex items-center justify-between rounded-xl border px-3 py-2.5"
									>
										<div className="flex items-center gap-2">
											<badge.icon
												className={cn(
													'size-4',
													isSet ? 'text-emerald-600' : 'text-muted-foreground',
												)}
											/>
											<span className="text-sm">{badge.label}</span>
										</div>
										{isSet ? (
											<CheckCircle2 className="size-4 text-emerald-600" />
										) : (
											<XCircle className="text-muted-foreground size-4" />
										)}
									</div>
								)
							})}
						</CardContent>
						<CardFooter className="border-t">
							<Button asChild variant="outline" size="sm" className="w-full">
								<Link to="/agent/dashboard/compliance">
									Review compliance
									<ExternalLink className="size-3.5" />
								</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Briefcase className="size-4" />
								Availability
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<p className="text-sm font-medium">Accept new matches</p>
									<p className="text-muted-foreground text-xs">
										Pause when you are at capacity.
									</p>
								</div>
								<Button variant="outline" size="sm">
									Active
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

function getInitials(name?: string | null, email?: string | null) {
	const source = name?.trim() || email?.split('@')[0] || 'PRE'
	return source
		.split(/\s+|[._-]/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('')
}

function computeProfileStrength(profile: AgentProfile | null) {
	if (!profile) return 0

	const essentialFields = [
		profile.firstName,
		profile.lastName,
		profile.brokerageName,
		profile.email,
		profile.phone,
		profile.licenseNumberState,
		profile.serviceAreas.length > 0,
		profile.typicalPriceRange,
		profile.representationSide,
		profile.bestClientTypes.length > 0,
	]

	const subjectiveFields = [
		profile.communicationCadence,
		profile.responseTime,
		profile.transparencyStyle,
		profile.negotiationEthic,
		profile.energyStyle,
		profile.teachingStyle,
		profile.serviceDepth,
		profile.involvementLevel,
		profile.representationPreference,
	]

	const narrativeFields = [
		profile.valueProposition,
		profile.idealClientDescription,
		profile.whyIStarted,
	]

	const completed =
		essentialFields.filter(Boolean).length +
		subjectiveFields.filter(Boolean).length +
		narrativeFields.filter(Boolean).length

	const total =
		essentialFields.length + subjectiveFields.length + narrativeFields.length
	return Math.round((completed / total) * 100)
}

function getNextStep(
	profile: AgentProfile | null,
	_strength: number,
): { label: string; description: string; href: string; action: string } {
	if (!profile?.firstName || !profile.lastName || !profile.brokerageName) {
		return {
			label: 'Complete your essentials',
			description: 'Add your name, brokerage, and license details.',
			href: '/agent/dashboard/profile',
			action: 'Edit profile',
		}
	}

	if (
		!profile.licenseAttested ||
		!profile.eoInsuranceStatus ||
		!profile.peacePactSigned
	) {
		return {
			label: 'Finish compliance',
			description: 'Attest your license and confirm E\u0026O coverage.',
			href: '/agent/dashboard/compliance',
			action: 'Go to compliance',
		}
	}

	const questions: Question[] = agentQuestionFlow.questions
	const question = questions.find((q) => q.id === 'bestClientTypes')
	const bestClients =
		profile.bestClientTypes
			.map((slug) => (question ? questionOptionLabel(question, slug) : slug))
			.join(', ') || 'Not set'

	return {
		label: 'Review your public profile',
		description: `Best clients: ${bestClients}.`,
		href: '/agent/dashboard/profile',
		action: 'Preview',
	}
}
