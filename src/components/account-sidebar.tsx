import { Link, useRouterState } from '@tanstack/react-router'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
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
	Bug,
	HelpCircle,
	LogOut,
	MessageSquare,
	Settings,
	Sparkles,
	User,
	Users,
} from 'lucide-react'

type SidebarItem = {
	label: string
	icon: React.ElementType
	href?: string
	external?: string
	badge?: string
	locked?: boolean
}

export function AccountSidebar() {
	const router = useRouterState()
	const currentPath = router.location.pathname
	const { data: session } = authClient.useSession()
	const isAuthenticated = Boolean(session)

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.assign('/')
				},
			},
		})
	}

	const isActive = (path: string) => currentPath === path

	const agentItems: SidebarItem[] = [
		{ label: 'Matches', icon: ArrowRightLeft, href: '/matches' },
		{ label: 'Introductions', icon: Users, locked: true },
		{
			label: 'Practice Negotiating',
			icon: MessageSquare,
			locked: true,
			badge: 'beta',
		},
	]

	const accountItems: SidebarItem[] = [
		{ label: 'Profile', icon: User, href: '/account' },
		{ label: 'Preferences', icon: Settings, locked: true },
		{ label: 'Upgrade', icon: Sparkles, href: '/buyer/payment' },
	]

	const helpItems: SidebarItem[] = [
		{
			label: 'Contact Support',
			icon: HelpCircle,
			external: 'mailto:hello@peaceofrealestate.com',
		},
		{
			label: 'Report a Bug',
			icon: Bug,
			external: 'mailto:hello@peaceofrealestate.com?subject=Bug%20report',
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
		<Sidebar>
			<SidebarHeader className="px-4 py-3">
				<Link
					to={isAuthenticated ? '/matches' : '/'}
					className="flex items-center gap-2.5"
				>
					<img
						src="/logomark-theme.svg"
						alt="Peace of Real Estate"
						className="h-7 w-auto shrink-0"
					/>
					<span className="font-heading text-sm font-semibold whitespace-nowrap">
						Peace of Real Estate
					</span>
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
					<SidebarGroupLabel>Account</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>{accountItems.map(renderItem)}</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Help</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>{helpItems.map(renderItem)}</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="gap-2">
				{isAuthenticated ? (
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton onClick={handleSignOut}>
								<LogOut />
								<span>Sign out</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				) : (
					<div className="flex flex-col gap-2 px-2">
						<SignupDialog>
							<Button className="w-full">Create Profile</Button>
						</SignupDialog>
						<Button asChild variant="outline" className="w-full">
							<Link to="/login">Log in</Link>
						</Button>
					</div>
				)}
			</SidebarFooter>
		</Sidebar>
	)
}
