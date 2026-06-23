import { ClockIcon } from '@phosphor-icons/react'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

import { AnimatedStepCard } from '@/components/signup/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { ConsumerDraft } from '@/lib/drafts'
import type { RepresentationSide } from '@/lib/matching/profile.types'
import {
	consumerConfig,
	getIntentIcon,
	getIntentLabel,
	StepHeader,
	timelineOptions,
} from './shared'

export function ConsumerSituation({
	state,
	direction,
	onUpdate,
	onContinue,
}: {
	state: ConsumerDraft
	direction: number
	onUpdate: (patch: Partial<ConsumerDraft>) => void
	onContinue: () => void
}) {
	const [intent, setIntent] = useState<RepresentationSide | ''>(
		state.intent ?? '',
	)
	const [hasDeadline, setHasDeadline] = useState(
		state.timeline ? state.timeline !== 'exploring' : false,
	)
	const deadlineOptions = timelineOptions.filter(
		(option) => option.slug !== 'exploring',
	)
	const [deadlineIndex, setDeadlineIndex] = useState(() => {
		if (!state.timeline || state.timeline === 'exploring') return 0
		const index = deadlineOptions.findIndex(
			(option) => option.slug === state.timeline,
		)
		return Math.max(index, 0)
	})
	const timeline = hasDeadline
		? deadlineOptions[deadlineIndex]!.slug
		: 'exploring'
	const intentComplete = intent.length > 0
	const canContinue = intentComplete

	const handleContinue = () => {
		if (!canContinue || !intent) return
		onUpdate({ intent, timeline })
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey="intro" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={1}
						totalSteps={4}
						title="Situation"
						icon={ClockIcon}
					/>

					<div className="space-y-5">
						<div className="space-y-3">
							<h3 className="font-heading text-base font-semibold tracking-tight">
								Your move
							</h3>

							<div className="grid gap-3 sm:grid-cols-3">
								{consumerConfig.intentOptions.map((option) => {
									const isSelected = intent === option
									const IntentIcon = getIntentIcon(option)
									const label = getIntentLabel(option)

									return (
										<button
											key={option}
											type="button"
											onClick={() => setIntent(option)}
											className={cn(
												'group flex items-center gap-3 rounded-full border px-5 py-3 text-left text-base font-semibold transition',
												isSelected
													? 'border-primary bg-primary text-primary-foreground shadow-sm'
													: 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-background',
											)}
											aria-pressed={isSelected}
										>
											<IntentIcon
												className={cn(
													'h-5 w-5 shrink-0',
													isSelected
														? 'text-primary-foreground'
														: 'text-muted-foreground',
												)}
												weight="duotone"
											/>
											<span className="min-w-0 truncate">{label}</span>
										</button>
									)
								})}
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="font-heading text-base font-semibold tracking-tight">
								Timeline
							</h3>
							<div className="flex flex-wrap gap-4">
								<label className="flex cursor-pointer items-center gap-2">
									<input
										type="radio"
										name="timeline-mode"
										checked={!hasDeadline}
										onChange={() => setHasDeadline(false)}
										className="border-border text-primary focus:ring-ring h-4 w-4"
									/>
									<span className="text-sm font-semibold">Just exploring</span>
								</label>
								<label className="flex cursor-pointer items-center gap-2">
									<input
										type="radio"
										name="timeline-mode"
										checked={hasDeadline}
										onChange={() => setHasDeadline(true)}
										className="border-border text-primary focus:ring-ring h-4 w-4"
									/>
									<span className="text-sm font-semibold">
										I have a deadline
									</span>
								</label>
							</div>

							<div
								className={cn(
									'space-y-3 transition-opacity',
									hasDeadline ? 'opacity-100' : 'hidden',
								)}
							>
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold">
										When do you need to move?
									</span>
									<span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold">
										{deadlineOptions[deadlineIndex]!.label}
									</span>
								</div>
								<div className="space-y-1">
									<Slider
										value={[deadlineIndex]}
										min={0}
										max={deadlineOptions.length - 1}
										step={1}
										onValueChange={([index]) => setDeadlineIndex(index ?? 0)}
										disabled={!hasDeadline}
									/>
									<div className="text-muted-foreground flex justify-between px-1">
										{deadlineOptions.map((option, index) => (
											<span
												key={option.slug}
												className={cn(
													'h-2 w-0.5 rounded-full transition-colors',
													index === deadlineIndex && hasDeadline
														? 'bg-primary'
														: 'bg-muted',
												)}
											/>
										))}
									</div>
								</div>
								<div className="text-muted-foreground flex justify-between text-xs font-medium">
									<span>{deadlineOptions[0]!.label}</span>
									<span>
										{deadlineOptions[deadlineOptions.length - 1]!.label}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div>
						<Button
							onClick={handleContinue}
							disabled={!canContinue}
							size="lg"
							className={cn(
								'w-full gap-2 rounded-4xl px-8 py-6 text-base transition-all duration-300',
								canContinue
									? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg'
									: 'bg-muted text-muted-foreground',
							)}
						>
							Continue
							<ArrowRight className="h-5 w-5" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}
