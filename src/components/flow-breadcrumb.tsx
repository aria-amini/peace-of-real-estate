import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { authClient } from '@/lib/auth-client'
import {
	getStoredConsumerDraftForFlow,
	listenForIntakeDraftUpdates,
} from '@/lib/intake-draft'
import type { ConsumerFlowKind } from '@/lib/user-settings'

const buyerFlow = [
	{ label: 'Basic Information', path: 'intro' },
	{ label: 'Quiz', path: 'quiz' },
	{ label: 'Extra Details', path: 'details' },
	{ label: 'Summary', path: 'summary' },
]

const sellerFlow = [
	{ label: 'Basic Information', path: 'intro' },
	{ label: 'Quiz', path: 'quiz' },
	{ label: 'Extra Details', path: 'details' },
	{ label: 'Summary', path: 'summary' },
]

function getFlowProgress(
	flow: typeof buyerFlow,
	page: string,
	flowKind: ConsumerFlowKind,
	basePath: string,
) {
	if (typeof window === 'undefined') return []

	const currentIndex = flow.findIndex((step) => step.path === page)
	if (currentIndex === -1) return []

	const draft = getStoredConsumerDraftForFlow(flowKind)
	const draftStage = draft.currentStage ?? page
	const draftIndex = flow.findIndex((step) => step.path === draftStage)
	const showUpTo =
		draftIndex === -1 ? currentIndex : Math.min(draftIndex, currentIndex)

	return flow.slice(0, showUpTo + 1).map((step, index) => ({
		label: step.label,
		to: index === showUpTo ? undefined : `${basePath}/${step.path}`,
		isCurrent: index === showUpTo,
	}))
}

function getBreadcrumbItems(pathname: string) {
	if (!pathname.startsWith('/buyer/') && !pathname.startsWith('/seller/')) {
		return []
	}

	if (pathname.startsWith('/buyer/')) {
		return getFlowProgress(
			buyerFlow,
			pathname.replace('/buyer/', ''),
			'buyer',
			'/buyer',
		)
	}

	return getFlowProgress(
		sellerFlow,
		pathname.replace('/seller/', ''),
		'seller',
		'/seller',
	)
}

export function FlowBreadcrumb() {
	const { data: session } = authClient.useSession()
	const router = useRouterState()
	const pathname = router.location.pathname
	const [draftVersion, setDraftVersion] = useState(0)

	useEffect(
		() =>
			listenForIntakeDraftUpdates(() => setDraftVersion((value) => value + 1)),
		[],
	)

	if (session) return null

	void draftVersion
	const items = getBreadcrumbItems(pathname)

	if (items.length <= 1) return null

	return (
		<div className="bg-background/95 w-full border-b px-5 py-2">
			<Breadcrumb>
				<BreadcrumbList>
					{items.map((item, index) => (
						<div key={item.label} className="flex items-center">
							{index > 0 ? <BreadcrumbSeparator /> : null}
							<BreadcrumbItem>
								{item.isCurrent ? (
									<BreadcrumbPage>{item.label}</BreadcrumbPage>
								) : item.to ? (
									<BreadcrumbLink asChild>
										<Link to={item.to}>{item.label}</Link>
									</BreadcrumbLink>
								) : null}
							</BreadcrumbItem>
						</div>
					))}
				</BreadcrumbList>
			</Breadcrumb>
		</div>
	)
}
