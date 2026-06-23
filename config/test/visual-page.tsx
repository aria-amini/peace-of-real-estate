import { createElement, type ComponentType } from 'react'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'

import { expect } from './browser'

async function waitForImages() {
	await Promise.all(
		Array.from(document.images, (image) => {
			if (image.complete) return Promise.resolve()
			return image.decode().catch(() => undefined)
		}),
	)
}

type ScreenshotOptions = {
	component: ComponentType
	name: string
	waitFor: (
		screen: Awaited<ReturnType<typeof render>>,
	) => HTMLElement | SVGElement | null
	prepare?: (screen: Awaited<ReturnType<typeof render>>) => void | Promise<void>
	setup?: () => void | Promise<void>
	target?: (screen: Awaited<ReturnType<typeof render>>) => HTMLElement
	fullPage?: boolean
	viewport?: { width: number; height: number }
}

export async function expectComponentScreenshot({
	component,
	name,
	waitFor,
	prepare,
	setup,
	target = (screen) => screen.container,
	fullPage = true,
	viewport = { width: 1280, height: 720 },
}: ScreenshotOptions) {
	localStorage.clear()
	document.body.replaceChildren()
	await setup?.()
	await page.viewport(viewport.width, viewport.height)

	const container = document.body.appendChild(document.createElement('div'))
	container.style.width = '100vw'
	container.style.minHeight = '100vh'

	const screen = await render(createElement(component), { container })
	await prepare?.(screen)
	await expect.element(waitFor(screen)).toBeVisible()
	await document.fonts.ready
	await waitForImages()

	if (fullPage) {
		const frame = window.frameElement as HTMLIFrameElement | null
		if (frame) {
			frame.style.width = `${document.body.scrollWidth}px`
			frame.style.height = `${document.body.scrollHeight}px`
		}
	}

	await expect.element(target(screen)).toMatchScreenshot(`${name}.png`, {
		screenshotOptions: { scale: 'css' },
	})
}
