import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ArrowLeft, Briefcase, Shield } from 'lucide-react'
import { useState } from 'react'

import { CategoryWeightSelector } from '@/components/category-weight-selector'
import { FlowPageShell } from '@/components/flow-page-shell'
import { categoryWeightOptions } from '@/lib/category-weight-options'
import {
	getStoredIntakeDraftForRole,
	saveStoredIntakeDraftForRole,
} from '@/lib/intake-draft'
import type { CategoryWeights } from '@/lib/user-settings'

export const Route = createFileRoute('/agent/priorities')({
	component: AgentPriorities,
})

const agentCategoryWeightOptions = categoryWeightOptions.map((category) =>
	category.id === 'working-style'
		? { ...category, icon: Briefcase }
		: category.id === 'transparency'
			? { ...category, icon: Shield }
			: category,
)

function AgentPriorities() {
	const [initialDraft] = useState(() => getStoredIntakeDraftForRole('agent'))
	const [weights, setWeights] = useState<CategoryWeights>(
		() => initialDraft.weights,
	)

	const updateWeight = (id: keyof CategoryWeights, value: number) => {
		setWeights((prev) => {
			const next = { ...prev, [id]: value } as CategoryWeights
			saveStoredIntakeDraftForRole('agent', {
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
			title="Agent Onboarding"
			subtitle="Step 1 of 4 — Set your priority weights"
			icon={Shield}
			iconClassName="border-terracotta bg-terracotta-tint text-terracotta"
		>
			<CategoryWeightSelector
				categories={agentCategoryWeightOptions}
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
					to="/agent/quiz"
					className="btn-primary inline-flex items-center gap-2"
				>
					Continue to Questions
					<ArrowRight className="h-4 w-4" />
				</Link>
			</div>
		</FlowPageShell>
	)
}
