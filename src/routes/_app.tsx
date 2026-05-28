import { FlowBreadcrumb } from '@/components/flow-breadcrumb'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import {
	createFileRoute,
	Link,
	Outlet,
	useRouterState,
} from '@tanstack/react-router'
import { ArrowRightLeft, ChevronDown, LogOut, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/_app')({
	component: AppShell,
})

function AppShell() {
	const { data: session } = authClient.useSession()
	const router = useRouterState()
	const currentPath = router.location.pathname
	const userInitials = session?.user.name
		? session.user.name
				.split(/\s+/)
				.filter(Boolean)
				.slice(0, 2)
				.map((part) => part[0]?.toUpperCase() ?? '')
				.join('')
		: null

	return (
		<div className="flex min-h-dvh flex-col">
			<header className="bg-background sticky top-0 z-50 h-(--app-header-height) border-b">
				<div className="mx-auto flex h-full w-full items-center justify-between px-5">
					<Link
						to={session ? '/match-activity' : '/'}
						className="flex items-center gap-2"
					>
						<img
							src="/logomark-fullColor.svg"
							alt="Peace of Real Estate"
							className="h-8 w-auto shrink-0"
						/>
						<span className="text-sm font-medium whitespace-nowrap">
							Peace of Real-Estate
						</span>
					</Link>

					<div className="flex items-center gap-1">
						{session ? (
							<UserDropdown userInitials={userInitials} />
						) : (
							<Link
								to="/login"
								search={{ redirect: currentPath }}
								className="hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 inline-flex h-9 items-center justify-center gap-1 rounded-4xl px-4 text-sm font-medium whitespace-nowrap transition-colors"
							>
								Sign in
								<User className="h-4 w-4" />
							</Link>
						)}
					</div>
				</div>
			</header>
			<FlowBreadcrumb />
			<main className="flex w-full flex-1 flex-col items-center overflow-x-hidden">
				<Outlet />
			</main>
			<footer className="h-(--app-footer-height) w-full border-t">
				<div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center gap-2 px-6 md:flex-row md:justify-between md:gap-3 md:px-10">
					<p className="text-muted-foreground text-xs">
						&copy; 2026 Peace of Real Estate. All rights reserved.
					</p>
					<div className="flex gap-6">
						<Link to="/agent" className="text-muted-foreground text-xs">
							Agent Login
						</Link>
						<Link to="/" className="text-muted-foreground text-xs">
							Privacy
						</Link>
						<Link to="/" className="text-muted-foreground text-xs">
							Terms
						</Link>
					</div>
				</div>
			</footer>
		</div>
	)
}

function UserDropdown({ userInitials }: { userInitials: string | null }) {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

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
		<div ref={dropdownRef} className="relative">
			<Button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				variant="ghost"
				aria-label="Open account menu"
			>
				<span className="flex h-9 w-9 items-center justify-center border text-sm">
					{userInitials ? userInitials : <User className="h-5 w-5" />}
				</span>
				<ChevronDown
					className={`text-muted-foreground h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
				/>
			</Button>

			{isOpen && (
				<div className="absolute right-0 z-50 mt-1 w-56 border">
					<div className="py-1">
						<Link
							to="/account"
							className="flex items-center gap-3 px-4 py-2.5 text-sm"
							onClick={() => setIsOpen(false)}
						>
							<User className="h-4 w-4" />
							My profile
						</Link>
						<Link
							to="/match-activity"
							className="flex items-center gap-3 px-4 py-2.5 text-sm"
							onClick={() => setIsOpen(false)}
						>
							<ArrowRightLeft className="h-4 w-4" />
							My matches
						</Link>
						<div className="mx-4 my-1 h-px border-t" />
						<Button
							type="button"
							variant="ghost"
							onClick={() => {
								setIsOpen(false)
								void handleSignOut()
							}}
							className="h-auto w-full justify-start rounded-none px-4 py-2.5 text-sm"
						>
							<LogOut className="h-4 w-4" />
							Sign out
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
