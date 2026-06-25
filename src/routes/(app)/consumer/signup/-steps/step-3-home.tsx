import { HouseLineIcon } from '@phosphor-icons/react'
import { ArrowRight, Banknote, House } from 'lucide-react'
import { useState } from 'react'

import { AnimatedStepCard } from '@/components/signup/shared'
import { StepHeader } from '@/components/signup/step-header'
import { PriceInput } from '@/components/signup/price-range'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/ui'
import type { ConsumerDraft } from '@/lib/matching/profile'
import {
	formatPriceRange,
	parsePriceRange,
	PRICE_MAX,
	PRICE_MIN,
	serializePriceRange,
} from '@/components/signup/price-range'
import { propertyTypeOptions } from '@/components/signup/questions'
import { consumerConfig, getPropertyIcon } from './shared'

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

	const priceLabel =
		state.intent === 'selling' ? 'Estimated value' : 'Target price'

	return (
		<AnimatedStepCard stepKey="home" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-8">
					<StepHeader
						stepNumber={3}
						totalSteps={4}
						title="Home"
						icon={HouseLineIcon}
					/>

					<div className="space-y-8">
						<div className="space-y-4">
							<div className="flex items-start justify-between gap-3">
								<div>
									<h3 className="font-heading flex items-center gap-2 text-base font-semibold tracking-tight">
										<House className="text-muted-foreground h-4 w-4" />
										Home type
									</h3>
									<p className="text-muted-foreground mt-0.5 text-sm">
										Select all that apply.
									</p>
								</div>
								{propertyComplete ? (
									<span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
										{propertyTypes.length} selected
									</span>
								) : null}
							</div>
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
												'group flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center text-sm font-semibold transition',
												isSelected
													? 'border-primary bg-primary text-primary-foreground shadow-sm'
													: 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-background',
											)}
											aria-pressed={isSelected}
										>
											<PropertyIcon
												className={cn(
													'h-6 w-6 shrink-0',
													isSelected
														? 'text-primary-foreground'
														: 'text-muted-foreground',
												)}
												weight="duotone"
											/>
											<span className="min-w-0">
												{
													propertyTypeOptions[
														option as keyof typeof propertyTypeOptions
													]
												}
											</span>
										</button>
									)
								})}
							</div>
						</div>

						<div className="bg-muted/30 border-border/60 rounded-2xl border p-5">
							<div className="mb-4 flex items-center justify-between gap-3">
								<div>
									<h3 className="font-heading flex items-center gap-2 text-base font-semibold tracking-tight">
										<Banknote className="text-muted-foreground h-4 w-4" />
										{priceLabel}
									</h3>
									<p className="text-muted-foreground mt-0.5 text-sm">
										Set your minimum and maximum.
									</p>
								</div>
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
