import { HouseLineIcon } from '@phosphor-icons/react'
import { Check } from 'lucide-react'
import { useState } from 'react'

import { AnimatedStepCard } from '@/components/signup/shared'
import { PriceInput } from '@/components/signup/price-range'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { ConsumerDraft } from '@/lib/drafts'
import { propertyTypeOptions } from '@/lib/matching/questions'
import {
	DEFAULT_PRICE_RANGE,
	formatPriceCompact,
	formatPriceRange,
	parsePriceRange,
	PRICE_MAX,
	PRICE_MIN,
	PRICE_STEP,
	serializePriceRange,
} from '@/components/signup/price-range-utils'
import { consumerConfig, getPropertyIcon, StepHeader } from './shared'

export function ConsumerHome({
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
	const initialRange = parsePriceRange(state.priceRange)
	const [priceRange, setPriceRange] = useState<{
		min: number
		max: number
	}>(initialRange)
	const [propertyTypes, setPropertyTypes] = useState<string[]>(
		state.propertyTypes ?? [],
	)
	const priceComplete =
		priceRange.min >= PRICE_MIN && priceRange.max <= PRICE_MAX
	const propertyComplete = propertyTypes.length > 0
	const canContinue = priceComplete && propertyComplete

	const handleContinue = () => {
		if (!canContinue) return
		onUpdate({
			priceRange: serializePriceRange(priceRange),
			propertyTypes,
		})
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey="home" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={3}
						totalSteps={4}
						title="Home"
						icon={HouseLineIcon}
					/>

					<div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
						<div className="space-y-3">
							<p className="text-sm font-semibold">Home type</p>
							<div className="flex flex-col gap-2">
								{consumerConfig.propertyOptions.map((option) => {
									const isSelected = propertyTypes.includes(option)
									const PropertyIcon = getPropertyIcon(option)
									return (
										<button
											key={option}
											type="button"
											onClick={() => {
												setPropertyTypes((prev) =>
													prev.includes(option)
														? prev.filter((item) => item !== option)
														: [...prev, option],
												)
											}}
											className={cn(
												'group flex items-center gap-3 rounded-full border px-4 py-3 text-left text-sm font-semibold transition',
												isSelected
													? 'border-primary/55 bg-primary/[0.06] text-foreground shadow-sm'
													: 'border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground hover:shadow-sm',
											)}
											aria-pressed={isSelected}
										>
											<span
												className={cn(
													'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
													isSelected
														? 'border-primary bg-transparent'
														: 'border-muted-foreground/30 bg-muted/30 group-hover:border-primary/50',
												)}
											>
												{isSelected ? (
													<Check className="text-primary h-3 w-3" />
												) : null}
											</span>
											<PropertyIcon
												className="h-5 w-5 shrink-0"
												weight="duotone"
											/>
											{
												propertyTypeOptions[
													option as keyof typeof propertyTypeOptions
												]
											}
										</button>
									)
								})}
							</div>
						</div>

						<div className="space-y-5">
							<div className="flex items-center justify-between gap-3">
								<p className="text-sm font-semibold">
									{state.intent === 'selling'
										? 'Estimated value'
										: 'Target price'}
								</p>
								<span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap">
									{formatPriceRange(priceRange)}
								</span>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<PriceInput
									id="price-min"
									label="Low"
									value={priceRange.min}
									onChange={(nextMin) =>
										setPriceRange((current) => ({
											...current,
											min: Math.min(nextMin, current.max),
										}))
									}
								/>
								<PriceInput
									id="price-max"
									label="High"
									value={priceRange.max}
									onChange={(nextMax) =>
										setPriceRange((current) => ({
											...current,
											max: Math.max(nextMax, current.min),
										}))
									}
								/>
							</div>

							<Slider
								value={[priceRange.min, priceRange.max]}
								min={PRICE_MIN}
								max={PRICE_MAX}
								step={PRICE_STEP}
								onValueChange={([nextMin, nextMax]) => {
									setPriceRange({
										min: nextMin ?? DEFAULT_PRICE_RANGE.min,
										max: nextMax ?? DEFAULT_PRICE_RANGE.max,
									})
								}}
							/>
							<div className="relative h-4">
								{[0, 500_000, 1_000_000, 1_500_000, 2_000_000].map((value) => {
									const percent = (value / PRICE_MAX) * 100
									return (
										<div
											key={value}
											className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-0.5"
											style={{ left: `${percent}%` }}
										>
											<span className="bg-muted-foreground/30 h-1 w-px rounded-full" />
											<span className="text-muted-foreground text-[10px] font-medium">
												{formatPriceCompact(value)}
											</span>
										</div>
									)
								})}
							</div>
						</div>
					</div>

					<div className="border-t pt-4">
						<div className="flex justify-center">
							<Button
								onClick={handleContinue}
								disabled={!canContinue}
								size="lg"
								className={cn(
									'rounded-xl px-8 transition-all duration-300',
									canContinue
										? 'shadow-md hover:shadow-lg'
										: 'bg-muted text-muted-foreground',
								)}
							>
								Continue
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}
