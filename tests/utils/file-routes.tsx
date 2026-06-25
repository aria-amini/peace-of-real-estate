import '../__mocks__/browser'

import { queryClient as appQueryClient } from '@/lib/utils/query'
import { expect } from '@tests/__fixtures__/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
	createMemoryHistory,
	createRouter,
	RouterProvider,
} from '@tanstack/react-router'
import { page } from 'vite-plus/test/browser'
import { render, type RenderResult } from 'vitest-browser-react'

import { setMockSession } from '../__mocks__/browser'

type RouteTarget =
	| { path: string; name?: string }
	| { path?: undefined; name: string }

type RouteTestOptions = RouteTarget & {
	waitFor?: (screen: RenderResult) => HTMLElement | SVGElement | null
	prepare?: (screen: RenderResult) => Promise<void> | void
	setup?: () => Promise<void> | void
	screenshotTarget?: (screen: RenderResult) => HTMLElement | SVGElement
}

type RenderedFileRoute = {
	router: unknown
	screen: RenderResult
	queryClient: QueryClient
}

type Viewport = {
	width: number
	height: number
}

const desktopViewport: Viewport = { width: 1440, height: 900 }
const protectedPathPrefixes = ['/agent/dashboard', '/consumer/dashboard']

const testSession = {
	user: {
		id: 'test-user',
		name: 'Test User',
		email: 'test@example.com',
	},
	session: { id: 'test-session' },
}

function resolveRoutePath({ path, name }: RouteTestOptions) {
	if (path) return path
	if (name) return `/${name}`
	throw new Error('Expected either path or name for route test')
}

function getScreenshotName(options: RouteTestOptions) {
	const screenshotName =
		options.name ??
		resolveRoutePath(options).replace(/^\//, '').replaceAll('/', '-')
	return screenshotName || 'home'
}

function setRouteSession(path: string) {
	const needsSession = protectedPathPrefixes.some((prefix) =>
		path.startsWith(prefix),
	)
	setMockSession(needsSession ? testSession : null)
}

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

function resetScreenshotHarness(viewport: Viewport) {
	const frame = window.frameElement as HTMLIFrameElement | null

	if (frame) {
		frame.style.width = `${viewport.width}px`
		frame.style.height = `${viewport.height}px`
	}
}
function createTestQueryClient() {
	appQueryClient.clear()
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	})
}

function createRenderContainer() {
	const container = document.body.appendChild(document.createElement('div'))
	container.style.width = '100vw'
	container.style.minHeight = '100vh'
	return container
}

export async function renderWithFileRoutes(
	options: RouteTestOptions,
): Promise<RenderedFileRoute> {
	const path = resolveRoutePath(options)
	const queryClient = createTestQueryClient()
	const history = createMemoryHistory({ initialEntries: [path] })

	setRouteSession(path)
	localStorage.clear()
	document.body.replaceChildren()
	await options.setup?.()
	const { routeTree } = await import('@/routeTree.gen')

	const router = createRouter({
		routeTree,
		history,
		scrollRestoration: false,
		defaultPreloadStaleTime: 0,
		context: { queryClient },
		Wrap: ({ children }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		),
	})

	await router.load()

	const container = createRenderContainer()
	const screen = await render(<RouterProvider router={router} />, { container })

	return { router, screen, queryClient }
}

export async function expectRouteReady(options: RouteTestOptions) {
	const { screen } = await renderWithFileRoutes(options)
	await expect
		.element(options.waitFor?.(screen) ?? screen.container)
		.toBeVisible()
	return screen
}

export async function expectRouteScreenshot(options: RouteTestOptions) {
	const viewport = desktopViewport

	await page.viewport(viewport.width, viewport.height)
	resetScreenshotHarness(viewport)
	const screen = await expectRouteReady(options)
	screen.container.style.width = `${viewport.width}px`
	screen.container.style.height = `${viewport.height}px`
	screen.container.style.overflow = 'hidden'
	await options.prepare?.(screen)

	await document.fonts.ready
	await waitForImages()
	await waitForLayout()

	const screenshotTarget =
		options.screenshotTarget?.(screen) ?? screen.container

	await expect
		.element(screenshotTarget)
		.toMatchScreenshot(`${getScreenshotName(options)}.png`, {
			screenshotOptions: {
				animations: 'disabled',
				scale: 'css',
				caret: 'hide',
			},
		})
}
