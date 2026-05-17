import {
	createRootRoute,
	createRoute,
	createRouter,
	RouterContextProvider,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expectComponentScreenshot } from '@aamini/config/test/visual-page'
import type { ComponentType, ReactNode } from 'react'
import type { Locator } from 'vite-plus/test/browser'
import type { RenderResult } from 'vitest-browser-react'

function createMockRouter(path: string, component: ComponentType) {
	const rootRoute = createRootRoute()
	const testRoute = createRoute({
		getParentRoute: () => rootRoute,
		path,
		component: () => {
			const Component = component
			return <Component />
		},
	})

	return createRouter({
		routeTree: rootRoute.addChildren([testRoute]),
	})
}

function createWrapper(path: string, component: ComponentType) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	})

	return function MockRouter({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<RouterContextProvider router={createMockRouter(path, component)}>
					{children}
				</RouterContextProvider>
			</QueryClientProvider>
		)
	}
}

export async function expectPageScreenshot({
	component,
	path,
	name,
	waitFor,
	setup,
}: {
	component: ComponentType
	path: string
	name: string
	waitFor: (screen: RenderResult) => Locator
	setup?: () => void
}) {
	await expectComponentScreenshot({
		component,
		name,
		waitFor,
		setup,
		wrapper: createWrapper(path, component),
	})
}
