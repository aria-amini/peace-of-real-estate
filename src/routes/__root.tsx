/// <reference types="vite-plus/client" />
import { authClient } from '@/lib/auth-client'
import { checkBetaAuthClient, checkBetaAuthServer } from '@/lib/beta-auth'
import type { QueryClient } from '@tanstack/react-query'
import {
	HeadContent,
	Link,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	redirect,
	useRouterState,
} from '@tanstack/react-router'
import { NotFoundComponent } from '@/components/not-found'
import posthog from 'posthog-js'
import { ArrowRightLeft, User, LogOut, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import appCss from '../styles.css?url'
if (
	import.meta.env.MODE === 'production' &&
	import.meta.env.VITE_PUBLIC_POSTHOG_KEY
) {
	posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
		api_host: '/api/ingest',
		ui_host: 'https://us.posthog.com',
		defaults: '2025-11-30',
		person_profiles: 'always',
	})
}

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient
}>()({
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ title: 'Peace of Real Estate' },
		],
		links: [
			{ rel: 'stylesheet', href: appCss },
			{ rel: 'icon', type: 'image/svg+xml', href: '/logomark-fullColor.svg' },
		],
	}),
	beforeLoad: async ({ location }) => {
		if (import.meta.env.DEV) return

		const isAuthenticated =
			typeof document !== 'undefined'
				? checkBetaAuthClient()
				: await checkBetaAuthServer()

		if (!isAuthenticated && location.pathname !== '/beta') {
			throw redirect({ to: '/beta' })
		}

		if (isAuthenticated && location.pathname === '/beta') {
			throw redirect({ to: '/' })
		}
	},
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
})

function UserDropdown({
	userInitials,
	currentPath,
}: {
	userInitials: string | null
	currentPath: string
}) {
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
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="hover:bg-secondary flex items-center gap-2 px-3 py-1.5 transition-colors"
				aria-label="Open account menu"
			>
				<span className="border-border text-foreground flex h-9 w-9 items-center justify-center border text-sm font-semibold">
					{userInitials ? userInitials : <User className="h-5 w-5" />}
				</span>
				<ChevronDown
					className={`text-muted-foreground h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
				/>
			</button>

			{isOpen && (
				<div className="border-border bg-background absolute right-0 z-50 mt-1 w-56 border shadow-lg">
					<div className="py-1">
						<Link
							to="/account"
							className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${currentPath === '/account' ? 'text-foreground bg-secondary' : 'text-foreground hover:bg-secondary'}`}
							onClick={() => setIsOpen(false)}
						>
							<User className="h-4 w-4" />
							My profile
						</Link>
						<Link
							to="/match-activity"
							className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${currentPath === '/match-activity' ? 'text-foreground bg-secondary' : 'text-foreground hover:bg-secondary'}`}
							onClick={() => setIsOpen(false)}
						>
							<ArrowRightLeft className="h-4 w-4" />
							My matches
						</Link>
						<div className="bg-border mx-4 my-1 h-px" />
						<button
							type="button"
							onClick={() => {
								setIsOpen(false)
								void handleSignOut()
							}}
							className="text-foreground hover:bg-secondary flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
						>
							<LogOut className="h-4 w-4" />
							Sign out
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

function RootComponent() {
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

	const isBetaPage = currentPath === '/beta'

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="bg-background text-foreground min-w-80 antialiased">
				<div className="flex min-h-dvh flex-col">
					{/* Navigation — Institutional (hidden on beta gate) */}
					{!isBetaPage && (
						<header className="border-border bg-background sticky top-0 z-50 border-b">
							<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
								<Link
									to={session ? '/match-activity' : '/'}
									className="flex items-center gap-3"
								>
									<img
										src="/favicon.svg"
										alt="Peace of Real Estate"
										className="h-7 w-7 shrink-0"
									/>
									<span className="font-serif text-base tracking-tight">
										Peace of Real Estate
									</span>
								</Link>

								<div className="flex items-center gap-1">
									{session ? (
										<UserDropdown
											userInitials={userInitials}
											currentPath={currentPath}
										/>
									) : (
										<Link
											to="/login"
											search={{ redirect: currentPath }}
											className="hover:bg-secondary inline-flex items-center gap-2 px-3 py-1.5 transition-colors"
											aria-label="Sign in or create account"
										>
											<span>Sign in</span>
											<span className="border-border text-foreground flex h-8 w-8 items-center justify-center border text-sm font-semibold">
												<User className="h-4 w-4" />
											</span>
										</Link>
									)}
								</div>
							</div>
						</header>
					)}

					{/* Main content */}
					<main className="flex flex-1 flex-col items-center">
						<Outlet />
					</main>

					{/* Footer — Institutional (hidden on beta gate) */}
					{!isBetaPage && (
						<footer className="border-border bg-background border-t">
							<div className="mx-auto max-w-7xl px-6 py-8">
								<div className="flex flex-col items-center justify-center gap-4">
									<p className="text-muted-foreground text-xs">
										© 2026 Peace of Real Estate. All rights reserved.
									</p>
								</div>
							</div>
						</footer>
					)}
				</div>
				<Scripts />
			</body>
		</html>
	)
}
