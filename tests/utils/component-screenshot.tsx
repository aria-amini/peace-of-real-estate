import '@tests/__mocks__/browser'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
	Outlet,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
	type RouteComponent,
} from '@tanstack/react-router'
import { expect } from '@config/test/browser'
import { page } from 'vite-plus/test/browser'
import { render, type RenderResult } from 'vitest-browser-react'

type ComponentScreenshotOptions = {
	component: React.ComponentType
	name: string
	setup?: () => Promise<void> | void
	prepare?: (screen: RenderResult) => Promise<void> | void
	waitFor?: (screen: RenderResult) => HTMLElement | SVGElement | null
	screenshotTarget?: (screen: RenderResult) => HTMLElement | SVGElement
	viewport?: { width: number; height: number }
}

const defaultViewport = { width: 1440, height: 900 }

async function waitForImages() {
	await Promise.all(
		Array.from(document.images, (image) => {
			if (image.complete) return Promise.resolve()
			return Promise.race([
				image.decode().catch(() => undefined),
				new Promise((resolve) => setTimeout(resolve, 1000)),
			])
		}),
	)
}

async function waitForLayout() {
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

function resetScreenshotHarness(viewport: { width: number; height: number }) {
	const frame = window.frameElement as HTMLIFrameElement | null

	if (frame) {
		frame.style.width = `${viewport.width}px`
		frame.style.height = `${viewport.height}px`
	}
}

export async function expectComponentScreenshot(
	options: ComponentScreenshotOptions,
) {
	const viewport = options.viewport ?? defaultViewport

	await page.viewport(viewport.width, viewport.height)
	resetScreenshotHarness(viewport)

	localStorage.clear()
	document.body.replaceChildren()
	await options.setup?.()

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	})

	const rootRoute = createRootRoute({ component: () => <Outlet /> })
	const indexRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: '/',
		component: () => null,
	})
	const Component = options.component
	const componentRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: '/consumer/signup',
		component: Component as RouteComponent,
	})

	const routeTree = rootRoute.addChildren([indexRoute, componentRoute])
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({
			initialEntries: ['/consumer/signup?step=intro'],
		}),
		context: { queryClient },
		scrollRestoration: false,
		defaultPreloadStaleTime: 0,
	})

	await router.load()

	const container = document.body.appendChild(document.createElement('div'))
	container.style.width = '100vw'
	container.style.minHeight = '100vh'

	const screen = await render(
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>,
		{ container },
	)

	screen.container.style.width = `${viewport.width}px`
	screen.container.style.height = `${viewport.height}px`
	screen.container.style.overflow = 'hidden'

	await options.prepare?.(screen)

	const target =
		options.waitFor?.(screen) ??
		options.screenshotTarget?.(screen) ??
		screen.container
	await expect.element(target).toBeVisible()

	await document.fonts.ready
	await waitForImages()
	await waitForLayout()

	await expect.element(target).toMatchScreenshot(`${options.name}.png`, {
		screenshotOptions: { animations: 'disabled', scale: 'css' },
	})
}
