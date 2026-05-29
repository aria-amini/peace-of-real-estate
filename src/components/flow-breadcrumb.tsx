import { Link, useRouterState } from '@tanstack/react-router'

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { authClient } from '@/lib/auth-client'

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
	basePath: string,
) {
	const currentIndex = flow.findIndex((step) => step.path === page)
	if (currentIndex === -1) return []

	return flow.slice(0, currentIndex + 1).map((step, index) => ({
		label: step.label,
		to: index === currentIndex ? undefined : `${basePath}/${step.path}`,
		isCurrent: index === currentIndex,
	}))
}

function getBreadcrumbItems(pathname: string) {
	if (!pathname.startsWith('/buyer/') && !pathname.startsWith('/seller/')) {
		return []
	}

	if (pathname.startsWith('/buyer/')) {
		return getFlowProgress(buyerFlow, pathname.replace('/buyer/', ''), '/buyer')
	}

	return getFlowProgress(
		sellerFlow,
		pathname.replace('/seller/', ''),
		'/seller',
	)
}

export function FlowBreadcrumb() {
	const { data: session } = authClient.useSession()
	const router = useRouterState()
	const pathname = router.location.pathname

	if (session) return null

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
