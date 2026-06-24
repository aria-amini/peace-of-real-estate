import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
	Crown,
	ExternalLink,
	Lock,
	LogOut,
	Mail,
	Search,
	Shield,
	Trash2,
	User,
} from 'lucide-react'

import { PaywallDialog } from '@/components/auth/paywall-dialog'
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
import { authClient } from '@/lib/auth/client'
import {
	createConsumerProfileFromDraft,
	loadConsumerProfile,
} from '@/lib/matching/profile'
import { type ConsumerDraft } from '@/lib/matching/profile'
import { createLocalStorage } from '@/lib/utils/localstorage'
import { isUserPremium } from '@/lib/premium'
import {
	formatPriceRange,
	parsePriceRange,
} from '@/components/signup/price-range'

export const Route = createFileRoute('/(app)/consumer/dashboard/')({
	component: ConsumerDashboard,
	loader: () => loadConsumerProfile(),
})

const consumerDraftStorage =
	createLocalStorage<ConsumerDraft>('pre-consumer-draft')

function ConsumerDashboard() {
	const consumerProfile = Route.useLoaderData()
	const { data: session } = authClient.useSession()
	const createProfile = useServerFn(createConsumerProfileFromDraft)
	const draftCompletionStarted = useRef(false)
	const [showPaywall, setShowPaywall] = useState(false)
	const { data: premiumStatus } = useQuery({
		queryKey: ['user-premium'],
		queryFn: isUserPremium,
		enabled: Boolean(session),
	})

	useEffect(() => {
		if (!session || draftCompletionStarted.current) {
			return
		}

		const draft = consumerDraftStorage.load()
		if (!draft) {
			return
		}

		draftCompletionStarted.current = true

		async function completeDraft(draft: ConsumerDraft) {
			try {
				await createProfile({ data: draft })
				consumerDraftStorage.clear()
			} catch (error) {
				console.error('Unable to complete consumer profile', error)
				draftCompletionStarted.current = false
			}
		}

		void completeDraft(draft)
	}, [createProfile, session])

	if (consumerProfile === undefined) {
		return <div className="flex-1" />
	}

	const isAnonymous = !session
	const tierLabel = premiumStatus ? 'Premium' : 'Free'
	const initials = getInitials(session?.user.name, session?.user.email)
	const searchSnapshot = [
		{
			label: 'Location',
			value:
				consumerProfile?.city && consumerProfile?.state
					? `${consumerProfile.city}, ${consumerProfile.state}`
					: (consumerProfile?.city ?? consumerProfile?.state),
		},
		{ label: 'Intent', value: consumerProfile?.intent },
		{
			label: 'Budget',
			value: consumerProfile?.priceRange
				? formatPriceRange(parsePriceRange(consumerProfile.priceRange))
				: undefined,
		},
		{
			label: 'Property Types',
			value: consumerProfile?.propertyTypes?.join(', '),
		},
	]

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.assign('/')
				},
			},
		})
	}

	return (
		<div className="mx-auto w-full max-w-4xl px-6 py-10 xl:mx-0 xl:ml-[calc((100vw-56rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Account menu</span>
			</div>

			<div className="relative space-y-6">
				<div
					className={
						isAnonymous ? 'pointer-events-none blur-sm select-none' : undefined
					}
				>
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
								Account
							</p>
							<h1 className="font-heading truncate text-3xl font-semibold tracking-tight">
								{session?.user.name ?? 'Your account'}
							</h1>
							<p className="text-muted-foreground mt-1 truncate text-sm">
								{session?.user.email ?? 'No email on file'}
							</p>
						</div>
					</div>

					<div className="grid gap-5">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="size-4" />
									Account Details
								</CardTitle>
								<CardDescription>
									Your login identity and account-level information.
								</CardDescription>
							</CardHeader>
							<CardContent className="grid gap-4 text-sm sm:grid-cols-2">
								<Detail label="Name" value={session?.user.name} />
								<Detail label="Email" value={session?.user.email} icon={Mail} />
								<Detail label="Tier" value={tierLabel} icon={Crown} />
								<Detail
									label="Login Method"
									value="Google or email"
									icon={Shield}
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Search className="size-4" />
									Search Snapshot
								</CardTitle>
								<CardDescription>
									Readonly summary of the preferences used to tune matches.
								</CardDescription>
							</CardHeader>
							<CardContent className="grid gap-4 text-sm sm:grid-cols-2">
								{searchSnapshot.map((item) => (
									<Detail
										key={item.label}
										label={item.label}
										value={item.value}
									/>
								))}
							</CardContent>
							<CardFooter className="border-t">
								<Button asChild variant="outline" size="sm">
									<Link to="/consumer/dashboard/search-preferences">
										Edit search preferences
										<ExternalLink className="size-3.5" />
									</Link>
								</Button>
							</CardFooter>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Crown className="size-4" />
									Plan
								</CardTitle>
								<CardDescription>
									Your current access level for matches and introductions.
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<div className="text-2xl font-semibold">{tierLabel}</div>
									<p className="text-muted-foreground mt-1 text-sm">
										{premiumStatus
											? 'Premium access is active on this account.'
											: 'Upgrade to unlock full profiles and richer match insights.'}
									</p>
								</div>
								<Button
									variant={premiumStatus ? 'outline' : 'default'}
									onClick={() => setShowPaywall(true)}
								>
									{premiumStatus ? 'View plan' : 'Upgrade'}
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Account Actions</CardTitle>
								<CardDescription>
									Session and account lifecycle controls.
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-3 sm:flex-row">
								<Button variant="outline" onClick={() => void handleSignOut()}>
									<LogOut className="size-4" />
									Sign out
								</Button>
								<Button variant="destructive" disabled>
									<Trash2 className="size-4" />
									Delete account
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>

				{isAnonymous && (
					<div className="absolute inset-0 flex items-center justify-center">
						<Card className="mx-6 w-full max-w-md p-6 text-center">
							<Lock className="text-muted-foreground mx-auto mb-4 h-8 w-8" />
							<h2 className="mb-2 text-xl font-semibold">
								Create a profile to continue
							</h2>
							<p className="text-muted-foreground mb-6 text-sm">
								Create a free profile to manage account details, preferences,
								and matches.
							</p>
							<Button asChild className="w-full">
								<Link to="/consumer/signup" search={{ step: 'intro' }}>
									Create Profile
								</Link>
							</Button>
						</Card>
					</div>
				)}
			</div>

			<PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
		</div>
	)
}

function Detail({
	label,
	value,
	icon: Icon,
}: {
	label: string
	value: string | undefined | null
	icon?: React.ElementType
}) {
	return (
		<div className="rounded-2xl border p-4">
			<p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
				{Icon ? <Icon className="size-3.5" /> : null}
				{label}
			</p>
			<p className="truncate text-sm font-medium">{value || 'Not set'}</p>
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
