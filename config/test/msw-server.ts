import { setupServer, type SetupServer } from 'msw/node'

import handlers from '@test/handlers'

let server: SetupServer | undefined

type OnCleanup = (cleanup: () => void | Promise<void>) => void

export async function getMswServer(): Promise<SetupServer> {
	if (!server) {
		server = setupServer(...handlers)
	}

	return server
}

export async function startMswServer(onCleanup: OnCleanup) {
	const server = await getMswServer()
	server.listen({ onUnhandledRequest: 'bypass' })
	onCleanup(() => server.close())

	return server
}

export type { SetupServer }
