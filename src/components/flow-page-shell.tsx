import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'

type FlowPageShellProps = {
	title: string
	subtitle?: string
	icon: LucideIcon
	iconClassName?: string
	children: ReactNode
	card?: boolean
	headerInsideCard?: boolean
	roleLabel?: string | undefined
}

export function FlowPageShell({
	title,
	subtitle,
	icon: Icon,
	children,
	card = true,
	headerInsideCard = false,
	roleLabel,
}: FlowPageShellProps) {
	const header = (
		<div className={headerInsideCard ? 'mb-8' : 'mb-10'}>
			<div className="flex items-start gap-3">
				<div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
					<Icon className="text-muted-foreground h-4 w-4" />
				</div>
				<div className="flex flex-col gap-1">
					{roleLabel ? (
						<span className="bg-foreground text-background inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
							{roleLabel}
						</span>
					) : null}
					<h1 className="text-xl font-semibold tracking-tight">{title}</h1>
					{subtitle ? (
						<p className="text-muted-foreground text-sm">{subtitle}</p>
					) : null}
				</div>
			</div>
		</div>
	)

	return (
		<div className="mx-auto w-full max-w-[40rem] px-3 pt-8 pb-16 sm:px-6 md:pt-12 md:pb-24">
			{headerInsideCard ? null : header}

			{card ? (
				<Card>
					<CardContent>
						{headerInsideCard ? header : null}
						{children}
					</CardContent>
				</Card>
			) : (
				children
			)}
		</div>
	)
}
