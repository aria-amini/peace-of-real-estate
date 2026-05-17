import { Link } from '@tanstack/react-router'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type FlowPageShellProps = {
	backTo: string
	backLabel: string
	title: string
	subtitle: string
	icon: LucideIcon
	iconClassName: string
	children: ReactNode
}

export function FlowPageShell({
	backTo,
	backLabel,
	title,
	subtitle,
	icon: Icon,
	iconClassName,
	children,
}: FlowPageShellProps) {
	const iconBorderClassName = iconClassName.includes('border-')
		? ''
		: 'border-border'

	return (
		<div className="mx-auto w-full max-w-[40rem] px-6 pt-4 pb-16 md:pb-24">
			<nav aria-label="Breadcrumb" className="mb-4">
				<ol className="flex items-center gap-2 text-sm">
					<li>
						<Link
							to={backTo}
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							{backLabel}
						</Link>
					</li>
					<li aria-hidden="true">
						<ChevronRight className="text-muted-foreground h-4 w-4" />
					</li>
					<li className="text-foreground font-medium" aria-current="page">
						{title}
					</li>
				</ol>
			</nav>
			<div className="mt-16 mb-6">
				<div className="flex items-center gap-4">
					<div
						className={`${iconBorderClassName} ${iconClassName} flex h-10 w-10 items-center justify-center border`}
					>
						<Icon className="h-5 w-5" />
					</div>
					<div>
						<div className="data-label mb-1">{subtitle}</div>
						<h1 className="font-serif text-2xl font-normal tracking-tight">
							{title}
						</h1>
					</div>
				</div>
			</div>

			<div className="border-border bg-card card-institutional p-8 md:p-10">
				{children}
			</div>
		</div>
	)
}
