import '../mocks/browser'

import { queryClient as appQueryClient } from '@/lib/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
	createMemoryHistory,
	createRouter,
	RouterProvider,
} from '@tanstack/react-router'
import { page } from 'vite-plus/test/browser'
import { render, type RenderResult } from 'vitest-browser-react'

import { setMockSession } from '../mocks/browser'
import { expect } from './browser'

type RouteTarget =
	| { path: string; name?: string }
	| { path?: undefined; name: string }

type RouteTestOptions = RouteTarget & {
	viewport?: Viewport
	waitFor?: (screen: RenderResult) => HTMLElement | SVGElement | null
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

const defaultViewport: Viewport = { width: 1280, height: 720 }
const protectedPaths = new Set(['/buyer/results', '/seller/results'])
const screenshotStyleId = 'visual-route-screenshot-styles'

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
	setMockSession(protectedPaths.has(path) ? testSession : null)
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

function applyScreenshotViewportStyles(viewportHeight: number) {
	let style = document.getElementById(
		screenshotStyleId,
	) as HTMLStyleElement | null

	if (!style) {
		style = document.createElement('style')
		style.id = screenshotStyleId
		document.head.appendChild(style)
	}

	style.textContent = `
		.min-h-main-content {
			min-height: calc(${viewportHeight}px - var(--app-header-height));
		}

		.min-h-main-content:last-child {
			min-height: calc(${viewportHeight}px - var(--app-header-height) - var(--app-footer-height));
		}
	`
}

function resizeBrowserFrame(height: number) {
	const frame = window.frameElement as HTMLIFrameElement | null

	if (frame) {
		frame.style.width = `${document.body.offsetWidth}px`
		frame.style.height = `${height}px`
	}
}

function resetScreenshotHarness(viewport: Viewport) {
	document.getElementById(screenshotStyleId)?.remove()

	const frame = window.frameElement as HTMLIFrameElement | null

	if (frame) {
		frame.style.width = `${viewport.width}px`
		frame.style.height = `${viewport.height}px`
	}
}

function getRouteScreenshotHeight(
	container: HTMLElement,
	viewportHeight: number,
) {
	const header = container.querySelector('header')
	const main = container.querySelector('main')
	const footer = container.querySelector('footer')

	if (!main) return Math.max(viewportHeight, container.scrollHeight)

	const headerHeight = header?.getBoundingClientRect().height ?? 0
	const footerHeight = footer?.getBoundingClientRect().height ?? 0
	const minimumMainHeight = Math.max(
		0,
		viewportHeight - headerHeight - footerHeight,
	)
	const mainHeight = Math.max(minimumMainHeight, main.scrollHeight)

	return Math.ceil(headerHeight + mainHeight + footerHeight)
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
	const { routeTree } = await import('@/routeTree.gen')
	localStorage.clear()
	document.body.replaceChildren()

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
	const viewport = options.viewport ?? defaultViewport

	await page.viewport(viewport.width, viewport.height)
	resetScreenshotHarness(viewport)
	const screen = await expectRouteReady(options)
	screen.container.style.width = `${viewport.width}px`
	screen.container.style.height = 'auto'
	screen.container.style.overflow = 'visible'

	await document.fonts.ready
	await waitForImages()
	await waitForLayout()

	let screenshotHeight = getRouteScreenshotHeight(
		screen.container,
		viewport.height,
	)

	if (screenshotHeight > viewport.height) {
		applyScreenshotViewportStyles(viewport.height)
		await waitForLayout()
		screenshotHeight = getRouteScreenshotHeight(
			screen.container,
			viewport.height,
		)
		resizeBrowserFrame(screenshotHeight)
	}

	screen.container.style.height = `${screenshotHeight}px`
	screen.container.style.overflow = 'hidden'

	await expect
		.element(screen.container)
		.toMatchScreenshot(`${getScreenshotName(options)}.png`, {
			screenshotOptions: { animations: 'disabled', scale: 'css' },
		})
}
