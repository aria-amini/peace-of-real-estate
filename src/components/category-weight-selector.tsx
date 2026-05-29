import type { LucideIcon } from 'lucide-react'

import type { CategoryWeights } from '@/lib/user-settings'

type WeightCategory = {
	id: keyof CategoryWeights
	label: string
	icon: LucideIcon
	description: string
}

type CategoryWeightSelectorProps = {
	categories: ReadonlyArray<WeightCategory>
	weights: CategoryWeights
	onChange: (id: keyof CategoryWeights, value: number) => void
}

export function CategoryWeightSelector({
	categories,
	weights,
	onChange,
}: CategoryWeightSelectorProps) {
	return (
		<div className="space-y-6">
			{categories.map((category) => {
				const Icon = category.icon
				const weight = weights[category.id] ?? 3

				return (
					<div key={category.id}>
						<div className="mb-3 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center">
									<Icon className="h-5 w-5" />
								</div>
								<div>
									<h3 className="text-sm font-medium">{category.label}</h3>
									<p className="text-muted-foreground text-xs">
										{category.description}
									</p>
								</div>
							</div>
							<span className="text-sm">{weight}</span>
						</div>

						<div className="flex items-center gap-3">
							<span className="text-muted-foreground text-xs">Low</span>
							<input
								type="range"
								min={1}
								max={5}
								value={weight}
								onChange={(event) =>
									onChange(category.id, Number(event.target.value))
								}
								className="accent-foreground bg-border h-1 flex-1 cursor-pointer appearance-none"
							/>
							<span className="text-muted-foreground text-xs">High</span>
						</div>
					</div>
				)
			})}
		</div>
	)
}
