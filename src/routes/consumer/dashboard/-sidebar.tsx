import { Link, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { isUserPremium } from '@/lib/premium'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PaywallDialog } from '@/components/paywall-dialog'
import { Textarea } from '@/components/ui/textarea'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { SignupDialog } from '@/components/signup-dialog'
import {
	ArrowRightLeft,
	HelpCircle,
	LogOut,
	MessageSquare,
	Search,
	Sparkles,
	Users,
} from 'lucide-react'

type SidebarItem = {
	label: string
	icon: React.ElementType
	href?: string
	external?: string
	onClick?: () => void
	badge?: string
	locked?: boolean
}

export function ConsumerSidebar() {
	const router = useRouterState()
	const currentPath = router.location.pathname
	const { data: session } = authClient.useSession()
	const isAuthenticated = Boolean(session)
	const showPremiumCard = true
	const [showPaywall, setShowPaywall] = useState(false)
	const [showSupport, setShowSupport] = useState(false)
	const { data: premiumStatus } = useQuery({
		queryKey: ['user-premium'],
		queryFn: isUserPremium,
		enabled: isAuthenticated,
	})
	const profileName = session?.user.name?.trim() || 'Your profile'
	const profileEmail = session?.user.email || 'Create a profile to save matches'
	const tierLabel = premiumStatus ? 'Premium' : 'Free'
	const profileImage = session?.user.image
	const profileInitials = getInitials(session?.user.name, session?.user.email)
	const profileGradient = getProfileGradient(
		session?.user.email ?? session?.user.name,
	)

	const isActive = (path: string) =>
		currentPath === path || currentPath.startsWith(`${path}/`)

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.assign('/')
				},
			},
		})
	}

	const agentItems: SidebarItem[] = [
		{ label: 'Matches', icon: Users, href: '/matches' },
		{
			label: 'Introductions',
			icon: ArrowRightLeft,
			href: '/consumer/dashboard/introductions',
		},
		{
			label: 'Search Preferences',
			icon: Search,
			href: '/consumer/dashboard/search-preferences',
		},
	]

	const aiItems: SidebarItem[] = [
		{
			label: 'Practice Negotiating',
			icon: MessageSquare,
			href: '/consumer/dashboard/practice-negotiating',
		},
	]

	const renderItem = (item: SidebarItem) => {
		const Icon = item.icon
		const active = item.href ? isActive(item.href) : false
		const isLocked = !isAuthenticated || item.locked

		return (
			<SidebarMenuItem key={item.label}>
				{isLocked ? (
					<SidebarMenuButton disabled>
						<Icon />
						<span className="truncate">{item.label}</span>
						{item.badge ? (
							<span className="ml-auto shrink-0 text-[10px] font-medium tracking-wider uppercase opacity-60">
								{item.badge}
							</span>
						) : null}
					</SidebarMenuButton>
				) : item.onClick ? (
					<SidebarMenuButton onClick={item.onClick}>
						<Icon />
						<span className="truncate">{item.label}</span>
						{item.badge ? (
							<span className="ml-auto shrink-0 text-[10px] font-medium tracking-wider uppercase opacity-60">
								{item.badge}
							</span>
						) : null}
					</SidebarMenuButton>
				) : item.href ? (
					<SidebarMenuButton asChild isActive={active}>
						<Link to={item.href}>
							<Icon />
							<span className="truncate">{item.label}</span>
							{item.badge ? (
								<span className="ml-auto shrink-0 text-[10px] font-medium tracking-wider uppercase opacity-60">
									{item.badge}
								</span>
							) : null}
						</Link>
					</SidebarMenuButton>
				) : (
					<SidebarMenuButton asChild>
						<a href={item.external} target="_blank" rel="noopener noreferrer">
							<Icon />
							<span className="truncate">{item.label}</span>
							{item.badge ? (
								<span className="ml-auto shrink-0 text-[10px] font-medium tracking-wider uppercase opacity-60">
									{item.badge}
								</span>
							) : null}
						</a>
					</SidebarMenuButton>
				)}
			</SidebarMenuItem>
		)
	}

	return (
		<>
			<Sidebar>
				<SidebarHeader className="px-2 py-2">
					<Link
						to={isAuthenticated ? '/consumer/dashboard' : '/login'}
						className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-12 w-full items-center gap-2 overflow-hidden rounded-lg px-2.5 text-left text-sm transition-colors"
					>
						<div
							className={`flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xs font-semibold text-white ${profileGradient}`}
						>
							{profileImage ? (
								<img
									src={profileImage}
									alt=""
									className="size-full object-cover"
								/>
							) : (
								profileInitials
							)}
						</div>
						<div className="min-w-0 flex-1 leading-tight">
							<div className="flex min-w-0 items-center gap-2">
								<span className="truncate font-medium">{profileName}</span>
								{isAuthenticated ? (
									<span className="bg-muted text-muted-foreground shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium tracking-wide uppercase">
										{tierLabel}
									</span>
								) : null}
							</div>
							<div className="text-muted-foreground truncate text-xs">
								{profileEmail}
							</div>
						</div>
					</Link>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Agents</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>{agentItems.map(renderItem)}</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<SidebarGroup>
						<SidebarGroupLabel>
							AI
							<span className="ml-1.5 rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-sky-700 uppercase dark:bg-sky-950 dark:text-sky-300">
								beta
							</span>
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>{aiItems.map(renderItem)}</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter className="gap-3">
					{showPremiumCard ? (
						<button
							type="button"
							disabled={!isAuthenticated}
							onClick={() => setShowPaywall(true)}
							className="bg-card text-card-foreground hover:border-primary/50 hover:bg-card/95 group mx-2 rounded-xl border-2 p-3 text-left shadow-sm transition hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
						>
							<div className="mb-2 flex items-center gap-2">
								<span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
									<Sparkles className="size-3.5" />
								</span>
								<span className="text-sm font-medium">Upgrade</span>
							</div>
							<p className="text-muted-foreground mb-2 text-xs leading-snug">
								Unlock full agent profiles, saved preferences, and better match
								insights.
							</p>
							<span className="text-primary text-xs font-medium">
								See plans
							</span>
						</button>
					) : null}

					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton onClick={() => setShowSupport(true)}>
								<HelpCircle />
								<span>Support</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						{isAuthenticated ? (
							<SidebarMenuItem>
								<SidebarMenuButton onClick={() => void handleSignOut()}>
									<LogOut />
									<span>Sign out</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						) : null}
					</SidebarMenu>

					{!isAuthenticated ? (
						<div className="flex flex-col gap-2 px-2">
							<SignupDialog>
								<Button className="w-full">Create Profile</Button>
							</SignupDialog>
							<Button asChild variant="outline" className="w-full">
								<Link to="/login">Log in</Link>
							</Button>
						</div>
					) : null}
				</SidebarFooter>
			</Sidebar>
			<PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
			<SupportDialog open={showSupport} onOpenChange={setShowSupport} />
		</>
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

function getProfileGradient(seed?: string | null) {
	const gradients = [
		'bg-gradient-to-br from-emerald-500 to-teal-700',
		'bg-gradient-to-br from-indigo-500 to-violet-700',
		'bg-gradient-to-br from-rose-500 to-orange-600',
		'bg-gradient-to-br from-sky-500 to-blue-700',
		'bg-gradient-to-br from-amber-500 to-pink-600',
	]

	if (!seed) return gradients[0]

	const index = Array.from(seed).reduce(
		(total, char) => total + char.charCodeAt(0),
		0,
	)

	return gradients[index % gradients.length]
}

function SupportDialog({
	open,
	onOpenChange,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const supportEmail = 'hello@peaceofrealestate.com'

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Support</DialogTitle>
					<DialogDescription>
						Contact us directly or send a quick anonymous bug report.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5">
					<div className="bg-muted/30 rounded-2xl border p-4">
						<p className="text-muted-foreground mb-2 text-sm">
							For account questions, match concerns, or anything that needs a
							human reply:
						</p>
						<a
							href={`mailto:${supportEmail}`}
							className="font-medium underline underline-offset-4"
						>
							{supportEmail}
						</a>
					</div>

					<div className="space-y-3">
						<div>
							<h3 className="text-sm font-medium">Anonymous bug report</h3>
							<p className="text-muted-foreground text-sm">
								Share what went wrong. No account details are required.
							</p>
						</div>
						<Input placeholder="Short bug summary" />
						<Textarea
							placeholder="What happened? Include steps to reproduce if you have them."
							className="min-h-32"
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Close</Button>
					</DialogClose>
					<Button asChild>
						<a href={`mailto:${supportEmail}`}>Open email</a>
					</Button>
					<Button type="button" onClick={() => onOpenChange(false)}>
						Submit report
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
