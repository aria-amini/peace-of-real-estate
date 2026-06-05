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
import {
	getSignupFlowKindFromPath,
	signupFlowSteps,
	type SignupFlowStep,
} from '@/lib/signup-flow'

function getFlowProgress(
	flow: SignupFlowStep[],
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
	const flowKind = getSignupFlowKindFromPath(pathname)

	if (!flowKind || !pathname.startsWith(`/${flowKind}/`)) {
		return []
	}

	return getFlowProgress(
		signupFlowSteps[flowKind],
		pathname.replace(`/${flowKind}/`, ''),
		`/${flowKind}`,
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
