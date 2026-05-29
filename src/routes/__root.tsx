import { checkBetaAuthClient, checkBetaAuthServer } from '@/lib/beta-auth'
import type { QueryClient } from '@tanstack/react-query'
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	redirect,
} from '@tanstack/react-router'
import { NotFoundComponent } from '@/components/not-found'
import { ServerErrorComponent } from '@/components/server-error'
import appCss from '../styles.css?url'
import { PostHogProvider } from 'posthog-js/react'

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
			{ rel: 'icon', type: 'image/svg+xml', href: '/logomark-theme.svg' },
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
	errorComponent: ServerErrorComponent,
	notFoundComponent: NotFoundComponent,
})

function RootComponent() {
	const analyticsEnabled =
		import.meta.env.MODE === 'production' &&
		import.meta.env.VITE_PUBLIC_POSTHOG_KEY
	const content = <Outlet />

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-dvh min-w-80">
				{analyticsEnabled ? (
					<PostHogProvider
						apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
						options={{
							api_host: '/api/ingest',
							ui_host: 'https://us.posthog.com',
							defaults: '2025-11-30',
							person_profiles: 'always',
							capture_exceptions: true,
						}}
					>
						{content}
					</PostHogProvider>
				) : (
					content
				)}
				<Scripts />
			</body>
		</html>
	)
}
