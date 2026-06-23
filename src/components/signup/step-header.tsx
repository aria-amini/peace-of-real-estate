import type { Icon } from '@phosphor-icons/react'

import { cn } from '@/lib/utils/ui'

export function StepHeader({
	stepNumber,
	totalSteps,
	title,
	icon: Icon,
}: {
	stepNumber: number
	totalSteps: number
	title: string
	icon?: Icon
}) {
	return (
		<div className="space-y-1">
			<p className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
				Step {stepNumber} of {totalSteps}
			</p>
			<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
				{Icon ? <Icon className="h-4 w-4" weight="duotone" /> : null}
				{title}
			</p>
		</div>
	)
}

export function StepLabel({
	children,
	complete,
	error,
}: {
	children: React.ReactNode
	complete?: boolean
	error?: boolean
}) {
	return (
		<div
			className={cn(
				'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase leading-none',
				error
					? 'text-destructive'
					: complete
						? 'text-primary'
						: 'text-muted-foreground',
			)}
		>
			{children}
		</div>
	)
}
