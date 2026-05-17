import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { CategoryWeightSelector } from '@/components/category-weight-selector'
import { FlowPageShell } from '@/components/flow-page-shell'
import { categoryWeightOptions } from '@/lib/category-weight-options'
import {
	getStoredIntakeDraftForRole,
	saveStoredIntakeDraftForRole,
} from '@/lib/intake-draft'
import type { CategoryWeights } from '@/lib/user-settings'

export const Route = createFileRoute('/consumer/priorities')({
	component: ConsumerPriorities,
})

function ConsumerPriorities() {
	const [initialDraft] = useState(() => getStoredIntakeDraftForRole('consumer'))
	const [weights, setWeights] = useState<CategoryWeights>(
		() => initialDraft.weights,
	)

	const updateWeight = (id: keyof CategoryWeights, value: number) => {
		setWeights((prev) => {
			const next = { ...prev, [id]: value } as CategoryWeights
			saveStoredIntakeDraftForRole('consumer', {
				weights: next,
				hasCompletedWeights: true,
			})
			return next
		})
	}

	return (
		<FlowPageShell
			backTo="/"
			backLabel="Back to home"
			title="Set Your Priorities"
			subtitle="Step 1 of 4 — Weight what matters most to you"
			icon={SlidersHorizontal}
			iconClassName="border-blue-cyan bg-blue-cyan-tint text-blue-cyan"
		>
			<CategoryWeightSelector
				categories={categoryWeightOptions}
				weights={weights}
				onChange={updateWeight}
			/>

			{/* Navigation */}
			<div className="mt-10 flex items-center justify-between">
				<Link
					to="/"
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</Link>
				<Link
					to="/consumer/quiz"
					className="btn-primary inline-flex items-center gap-2"
				>
					Continue to Questions
					<ArrowRight className="h-4 w-4" />
				</Link>
			</div>
		</FlowPageShell>
	)
}
