import { ArrowRight } from 'lucide-react'

import { CityZipSelector } from '@/components/signup/city-zip-selector'
import { AnimatedStepCard } from '@/components/signup/shared'
import { StepHeader } from '@/components/signup/step-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/ui'
import type { ConsumerDraft } from '@/lib/drafts'
import { parseCityState } from '@/lib/signup/shared'
import { MapPinIcon } from '@phosphor-icons/react'
import { useState } from 'react'

export function ConsumerLocation({
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
	const rawInitialLocation = state.city ?? state.location ?? ''
	const [committedLocation, setCommittedLocation] = useState(rawInitialLocation)
	const [selectedZipCodes, setSelectedZipCodes] = useState<string[]>(
		state.zipCodes ?? [],
	)
	const [hasTriedContinue, setHasTriedContinue] = useState(false)
	const marketComplete = committedLocation.trim().length >= 2
	const canContinue = marketComplete
	const showMarketError = hasTriedContinue && !marketComplete
	const cityState = parseCityState(committedLocation)

	const handleLocationChange = (location: string, zipCodes: string[]) => {
		setCommittedLocation(location)
		setSelectedZipCodes(zipCodes)
	}

	const handleContinue = () => {
		const finalLocation = committedLocation.trim()
		const finalMarketComplete = finalLocation.length >= 2

		if (!finalMarketComplete) {
			setHasTriedContinue(true)
			return
		}

		const derivedState = cityState?.state
		const location =
			selectedZipCodes.length > 0
				? `${finalLocation} (${selectedZipCodes.join(', ')})`
				: finalLocation

		onUpdate({
			city: finalLocation,
			location,
			...(derivedState ? { state: derivedState } : {}),
			zipCodes: selectedZipCodes,
		})
		onContinue()
	}

	return (
		<AnimatedStepCard stepKey="intent" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={2}
						totalSteps={4}
						title="Location"
						icon={MapPinIcon}
					/>

					<CityZipSelector
						id="consumer-location"
						value={rawInitialLocation}
						onChange={handleLocationChange}
						zipCodes={selectedZipCodes}
						label={
							<span
								className={showMarketError ? 'text-destructive' : undefined}
							>
								City
							</span>
						}
					/>
					{showMarketError ? (
						<p className="text-destructive text-xs">Enter a city.</p>
					) : null}

					<div>
						<Button
							onClick={handleContinue}
							disabled={!canContinue}
							size="lg"
							className={cn(
								'w-full gap-2 rounded-4xl px-8 transition-all duration-300',
								canContinue
									? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg'
									: 'bg-muted text-muted-foreground',
							)}
						>
							Continue
							<ArrowRight className="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}
