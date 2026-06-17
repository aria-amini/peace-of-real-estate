import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Lock, User } from 'lucide-react'
import { useAccountSettings } from '@/hooks/use-account-settings'
import { SignupDialog } from '@/components/signup-dialog'
import { createFileRoute } from '@tanstack/react-router'
import type { UserSettings } from '@/lib/matching/settings'

export const Route = createFileRoute('/_app/account/')({
	component: AccountProfile,
})

function AccountProfile() {
	const { data: session } = authClient.useSession()
	const { settings, loading } = useAccountSettings()

	if (loading) {
		return <div className="flex-1" />
	}

	const isAnonymous = !session
	const role = settings?.role ?? 'consumer'
	const sections = getAccountSections(settings)

	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-12 xl:mx-0 xl:ml-[calc((100vw-48rem)/2-var(--sidebar-width))]">
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
					<Card className="rounded-none border bg-transparent p-8 py-8 shadow-none ring-0">
						<div className="mb-6 flex items-center gap-4">
							<div className="border-border bg-secondary flex h-12 w-12 items-center justify-center border">
								<User className="h-6 w-6" />
							</div>
							<div>
								<div className="text-muted-foreground mb-1 text-sm">
									Account
								</div>
								<h1 className="text-2xl">
									{session?.user?.name ?? 'Your account'}
								</h1>
							</div>
						</div>
						<div className="grid gap-4 text-sm sm:grid-cols-2">
							<div>
								<p className="text-muted-foreground mb-1">Email</p>
								<p className="font-medium">{session?.user?.email ?? '—'}</p>
							</div>
							<div>
								<p className="text-muted-foreground mb-1">Role</p>
								<p className="font-medium capitalize">
									{role === 'consumer'
										? (settings?.flowKind ?? 'buyer')
										: 'agent'}
								</p>
							</div>
						</div>
					</Card>

					{sections.map((section) => (
						<Card
							key={section.title}
							className="rounded-none border bg-transparent p-8 py-8 shadow-none ring-0"
						>
							<div className="mb-5">
								<div className="text-muted-foreground text-sm">
									{section.title}
								</div>
							</div>
							<div className="grid gap-4 text-sm sm:grid-cols-2">
								{section.items.map((item) => (
									<div key={item.label}>
										<p className="text-muted-foreground mb-1">{item.label}</p>
										<p className="font-medium">{item.value || 'Not set'}</p>
									</div>
								))}
							</div>
						</Card>
					))}
				</div>

				{isAnonymous && (
					<div className="absolute inset-0 flex items-center justify-center">
						<Card className="mx-6 w-full max-w-md p-6 text-center">
							<Lock className="text-muted-foreground mx-auto mb-4 h-8 w-8" />
							<h2 className="mb-2 text-xl font-semibold">
								Create a profile to continue
							</h2>
							<p className="text-muted-foreground mb-6 text-sm">
								Create a free profile to unlock your profile, save your
								preferences, and connect with matched agents.
							</p>
							<div className="flex flex-col gap-3">
								<SignupDialog>
									<Button className="w-full">Create Profile</Button>
								</SignupDialog>
							</div>
						</Card>
					</div>
				)}
			</div>
		</div>
	)
}

function getAccountSections(settings: UserSettings | null) {
	if (!settings) return []

	if (settings.role === 'agent') {
		const profile = settings.agentProfile
		return [
			{
				title: 'Business Profile',
				items: [
					{ label: 'Brokerage', value: profile?.brokerageName },
					{ label: 'Phone', value: profile?.phone },
					{ label: 'Service Areas', value: profile?.zipCodes },
					{ label: 'Years Licensed', value: profile?.yearsLicensed },
				],
			},
			{
				title: 'Client Fit',
				items: [
					{ label: 'Representation', value: settings.agentRepresentation },
					{ label: 'Best Clients', value: profile?.services.join(', ') },
				],
			},
			{
				title: 'Profile Copy',
				items: [
					{ label: 'Value Proposition', value: profile?.valueProposition },
					{ label: 'Client-first Terms', value: profile?.clientFirstTerms },
				],
			},
		]
	}

	return [
		{
			title: 'Search',
			items: [
				{ label: 'Location', value: settings.zipCode },
				{ label: 'Budget', value: settings.priceRange },
				{ label: 'Property Types', value: settings.propertyType?.join(', ') },
			],
		},
		{
			title: 'Situation',
			items: [
				{ label: 'Intent', value: settings.intent },
				{ label: 'Experience', value: settings.experienceLevel },
			],
		},
	]
}
