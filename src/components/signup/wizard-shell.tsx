import type { Icon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/ui'

type WizardStep = {
	id: string
	label: string
	icon: Icon
	description?: string
}

type WizardShellProps = {
	steps: WizardStep[]
	currentStepId: string
	progress?: ReactNode
	children: ReactNode
	onHomeClick?: () => void
	onStepClick?: (stepId: string) => void
	completedStepIds?: string[]
}

function StepDot({
	isComplete,
	isCurrent,
	index,
}: {
	isComplete: boolean
	isCurrent: boolean
	index: number
}) {
	return (
		<div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center">
			{isCurrent ? (
				<span className="bg-gold/40 absolute h-9 w-9 animate-ping rounded-full" />
			) : null}
			<div
				className={cn(
					'relative flex h-full w-full items-center justify-center rounded-full transition-all duration-300',
					isCurrent
						? 'bg-primary-foreground text-primary shadow-[0_0_8px_2px_rgba(212,175,55,0.55)]'
						: isComplete
							? 'bg-gold text-primary'
							: 'bg-primary-foreground/25 text-primary-foreground',
				)}
			>
				<span className="text-[10px] font-bold">{index + 1}</span>
			</div>
		</div>
	)
}

export function WizardShell({
	steps,
	currentStepId,
	progress,
	children,
	onHomeClick,
	onStepClick,
	completedStepIds,
}: WizardShellProps) {
	const currentIndex = steps.findIndex((step) => step.id === currentStepId)

	const homeContent = (
		<>
			<img src="/logomark-light.svg" alt="" className="h-8 w-auto" />
			<span className="font-heading text-base font-semibold">
				Peace of Real Estate
			</span>
		</>
	)

	return (
		<div className="flex flex-1 flex-col lg:grid lg:grid-cols-[16rem_1fr] xl:grid-cols-[18rem_1fr]">
			<aside className="bg-primary text-primary-foreground hidden flex-col justify-between px-7 py-10 lg:sticky lg:top-0 lg:flex lg:min-h-dvh">
				<div>
					{onHomeClick ? (
						<button
							type="button"
							onClick={onHomeClick}
							className="flex items-center gap-2.5 opacity-90 transition-opacity hover:opacity-100"
						>
							{homeContent}
						</button>
					) : (
						<Link
							to="/"
							className="flex items-center gap-2.5 opacity-90 transition-opacity hover:opacity-100"
						>
							{homeContent}
						</Link>
					)}

					<nav className="mt-10" aria-label="Setup steps">
						<ol>
							{steps.map((step, index) => {
								const isCurrent = index === currentIndex
								const isCompleteByPosition = index < currentIndex
								const isCompleteByData =
									completedStepIds?.includes(step.id) ?? false
								const isComplete =
									(isCompleteByData || isCompleteByPosition) && !isCurrent
								const isUpcoming = !isCurrent && !isComplete
								const isLast = index === steps.length - 1
								const isClickable = onStepClick !== undefined && isComplete

								const stepClassName = cn(
									'grid grid-cols-[auto_1fr] gap-3 rounded-xl px-3 py-3 transition-colors',
									isCurrent && 'bg-white/10',
									isComplete && 'opacity-90',
									isUpcoming && 'opacity-55',
									isClickable && 'hover:bg-white/5',
								)

								const stepContent = (
									<>
										<div className="relative flex flex-col items-center">
											<StepDot
												isComplete={isComplete}
												isCurrent={isCurrent}
												index={index}
											/>
											{!isLast && (
												<div
													className={cn(
														'absolute top-[0.875rem] left-1/2 h-[calc(100%+0.75rem)] w-0.5 -translate-x-1/2',
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
												<step.icon
													className={cn(
														'-mt-0.5 mr-1.5 inline-block h-4 w-4',
														isCurrent
															? 'text-white'
															: 'text-primary-foreground/80',
													)}
													weight="duotone"
												/>
												{step.label}
											</p>
											{step.description ? (
												<p className="text-primary-foreground/60 mt-0.5 text-xs leading-snug">
													{step.description}
												</p>
											) : null}
										</div>
									</>
								)

								return (
									<li key={step.id}>
										{isClickable ? (
											<button
												type="button"
												onClick={() => onStepClick(step.id)}
												className={cn(stepClassName, 'w-full text-left')}
											>
												{stepContent}
											</button>
										) : (
											<div
												className={stepClassName}
												aria-current={isCurrent ? 'step' : undefined}
											>
												{stepContent}
											</div>
										)}
									</li>
								)
							})}
						</ol>
					</nav>
				</div>
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
