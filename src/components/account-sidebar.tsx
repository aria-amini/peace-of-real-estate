import { Link, useRouterState } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
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
import {
	ArrowRightLeft,
	User,
	SlidersHorizontal,
	ListChecks,
	CreditCard,
	LogOut,
} from 'lucide-react'

export function AccountSidebar() {
	const router = useRouterState()
	const currentPath = router.location.pathname

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

	return (
		<Sidebar>
			<SidebarHeader className="px-4 py-3">
				<Link to="/matches" className="flex items-center gap-2.5">
					<img
						src="/logomark-theme.svg"
						alt="Peace of Real Estate"
						className="h-7 w-auto shrink-0"
					/>
					<span className="font-heading text-sm font-semibold whitespace-nowrap">
						Peace of Real-Estate
					</span>
				</Link>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>App</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={isActive('/matches')}>
									<Link to="/matches">
										<ArrowRightLeft />
										<span>Matches</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Account</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={isActive('/account')}>
									<Link to="/account">
										<User />
										<span>Profile</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={isActive('/account/preferences')}
								>
									<Link to="/account/preferences">
										<SlidersHorizontal />
										<span>Preferences</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={isActive('/account/questionnaire')}
								>
									<Link to="/account/questionnaire">
										<ListChecks />
										<span>Questionnaire</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Plan</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={isActive('/upgrade')}>
									<Link to="/upgrade">
										<CreditCard />
										<span>Subscription</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={handleSignOut}>
							<LogOut />
							<span>Sign out</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
