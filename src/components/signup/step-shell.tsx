import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'

type FlowPageShellProps = {
	title: string
	subtitle?: string | undefined
	icon: LucideIcon
	children: ReactNode
	headerInsideCard?: boolean
	roleLabel?: string | undefined
}

export function FlowPageShell({
	title,
	subtitle,
	icon: Icon,
	children,
	headerInsideCard = false,
	roleLabel,
}: FlowPageShellProps) {
	const header = (
		<div className={headerInsideCard ? 'mb-6 space-y-5' : 'mb-8 space-y-5'}>
			<div className="flex items-start gap-3.5">
				<div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
					<Icon className="text-primary h-5 w-5" />
				</div>
				<div className="min-w-0 flex-1 pt-0.5">
					{roleLabel ? (
						<span className="bg-primary text-primary-foreground mb-1 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
							{roleLabel}
						</span>
					) : null}
					<h1 className="font-heading text-xl font-semibold tracking-tight text-balance">
						{title}
					</h1>
					{subtitle ? (
						<p className="text-muted-foreground mt-1 text-sm leading-relaxed">
							{subtitle}
						</p>
					) : null}
				</div>
			</div>
		</div>
	)

	return (
		<div className="mx-auto w-full max-w-[40rem] px-3 pt-4 pb-10 sm:px-6 md:pt-8 md:pb-16">
			{headerInsideCard ? null : header}

			<Card size="sm">
				<CardContent>
					{headerInsideCard ? header : null}
					{children}
				</CardContent>
			</Card>
		</div>
	)
}
