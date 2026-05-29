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
			<div className="flex items-center gap-4">
				<div className="flex h-10 w-10 items-center justify-center">
					<Icon className="h-5 w-5" />
				</div>
				<div>
					{subtitle ? (
						<div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
							{subtitle}
							{roleLabel ? (
								<span className="bg-foreground text-background inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
									{roleLabel}
								</span>
							) : null}
						</div>
					) : roleLabel ? (
						<div className="mb-1">
							<span className="bg-foreground text-background inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
								{roleLabel}
							</span>
						</div>
					) : null}
					<h1 className="text-2xl">{title}</h1>
				</div>
			</div>
		</div>
	)

	return (
		<div className="mx-auto w-full max-w-[40rem] px-6 pt-8 pb-16 md:pt-12 md:pb-24">
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
