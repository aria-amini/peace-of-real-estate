import { createPostHogProxyRequestHandler } from '@aamini/lib/posthog-proxy'
import { createFileRoute } from '@tanstack/react-router'

const proxyRequest = createPostHogProxyRequestHandler({
	publicPathPrefix: '/api/ingest/static/',
	upstreamOrigin: 'https://us-assets.i.posthog.com',
	upstreamPathPrefix: 'static',
})

export const Route = createFileRoute('/api/ingest/static/$')({
	server: {
		handlers: {
			GET: ({ request }) => proxyRequest(request),
			POST: ({ request }) => proxyRequest(request),
			OPTIONS: ({ request }) => proxyRequest(request),
		},
	},
})
