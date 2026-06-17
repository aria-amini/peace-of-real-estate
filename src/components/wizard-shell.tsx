import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type WizardStep = {
	id: string
	label: string
	description?: string
}

type WizardShellProps = {
	steps: WizardStep[]
	currentStepId: string
	progress?: ReactNode
	children: ReactNode
}

function StepDot({
	isComplete,
	isCurrent,
}: {
	isComplete: boolean
	isCurrent: boolean
}) {
	return (
		<div className="relative z-10 flex h-2.5 w-2.5 shrink-0 items-center justify-center">
			{isCurrent ? (
				<span className="bg-gold/40 absolute h-4 w-4 animate-ping rounded-full" />
			) : null}
			<div
				className={cn(
					'relative h-full w-full rounded-full transition-all duration-300',
					isComplete
						? 'bg-gold'
						: isCurrent
							? 'bg-primary-foreground shadow-[0_0_8px_2px_rgba(212,175,55,0.55)]'
							: 'bg-primary-foreground/25',
				)}
			/>
		</div>
	)
}

export function WizardShell({
	steps,
	currentStepId,
	progress,
	children,
}: WizardShellProps) {
	const currentIndex = steps.findIndex((step) => step.id === currentStepId)

	return (
		<div className="flex flex-1 flex-col lg:grid lg:grid-cols-[16rem_1fr] xl:grid-cols-[18rem_1fr]">
			<aside className="bg-primary text-primary-foreground hidden flex-col justify-between px-7 py-10 lg:sticky lg:top-0 lg:flex lg:min-h-dvh">
				<div>
					<Link
						to="/"
						className="flex items-center gap-2.5 opacity-90 transition-opacity hover:opacity-100"
					>
						<img src="/logomark-theme.svg" alt="" className="h-8 w-auto" />
						<span className="font-heading text-base font-semibold">
							Peace of Real Estate
						</span>
					</Link>

					<nav className="mt-10" aria-label="Setup steps">
						<ol>
							{steps.map((step, index) => {
								const isCurrent = index === currentIndex
								const isComplete = index < currentIndex
								const isUpcoming = index > currentIndex
								const isLast = index === steps.length - 1

								return (
									<li
										key={step.id}
										className={cn(
											'grid grid-cols-[auto_1fr] gap-3 rounded-xl px-3 py-3 transition-colors',
											isCurrent && 'bg-white/10',
											isComplete && 'opacity-90',
											isUpcoming && 'opacity-55',
										)}
									>
										<div className="relative flex flex-col items-center">
											<StepDot isComplete={isComplete} isCurrent={isCurrent} />
											{!isLast && (
												<div
													className={cn(
														'absolute top-[0.3125rem] left-1/2 h-[calc(100%+0.75rem)] w-0.5 -translate-x-1/2',
														isComplete ? 'bg-gold' : 'bg-primary-foreground/40',
													)}
												/>
											)}
										</div>
										<div className="flex min-w-0 flex-col justify-center">
											<p
												className={cn(
													'text-sm font-semibold leading-tight',
													isCurrent
														? 'text-white'
														: 'text-primary-foreground/90',
												)}
											>
												{step.label}
											</p>
											{step.description ? (
												<p className="text-primary-foreground/60 mt-0.5 text-xs leading-snug">
													{step.description}
												</p>
											) : null}
										</div>
									</li>
								)
							})}
						</ol>
					</nav>
				</div>

				<p className="text-primary-foreground/40 text-xs">
					© 2026 Peace of Real Estate. All rights reserved.
				</p>
			</aside>

			{progress ? (
				<div className="bg-card border-b px-4 py-4 lg:hidden">{progress}</div>
			) : null}

			<main className="flex flex-1 flex-col overflow-y-auto">
				<div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12 xl:py-16">
					{children}
				</div>
			</main>
		</div>
	)
}
