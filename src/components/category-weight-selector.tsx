import type { LucideIcon } from 'lucide-react'

import type { CategoryWeights } from '@/lib/user-settings'

type WeightCategory = {
	id: keyof CategoryWeights
	label: string
	icon: LucideIcon
	color: string
	description: string
}

type CategoryWeightSelectorProps = {
	categories: ReadonlyArray<WeightCategory>
	weights: CategoryWeights
	onChange: (id: keyof CategoryWeights, value: number) => void
}

function getAccentStyle(color: string, weight: number) {
	return {
		filter:
			color === 'ochre'
				? `brightness(${0.72 + weight * 0.035}) saturate(${0.78 + weight * 0.04})`
				: color === 'olive'
					? `brightness(${0.68 + weight * 0.045}) saturate(${0.72 + weight * 0.05})`
					: `brightness(${0.74 + weight * 0.03}) saturate(${0.8 + weight * 0.035})`,
		opacity: 0.76 + weight * 0.035,
	}
}

function getPriorityFrameStyle(color: string, weight: number) {
	const scale = 0.88 + weight * 0.045
	return {
		transform: `scale(${scale})`,
		opacity: 0.45 + weight * 0.1,
		boxShadow:
			weight >= 4
				? `0 0 0 ${1 + (weight - 3) * 0.5}px rgb(from var(--color-${color}) r g b / ${0.12 + weight * 0.03})`
				: 'none',
	}
}

export function CategoryWeightSelector({
	categories,
	weights,
	onChange,
}: CategoryWeightSelectorProps) {
	return (
		<div className="space-y-6">
			{categories.map((category, index) => {
				const Icon = category.icon
				const weight = weights[category.id] ?? 3
				const accentStyle = getAccentStyle(category.color, weight)
				const frameStyle = getPriorityFrameStyle(category.color, weight)

				return (
					<div
						key={category.id}
						style={{ animationDelay: `${(index + 1) * 100}ms` }}
					>
						<div className="mb-3 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div
									className={`border-${category.color}/20 bg-${category.color}/6 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300`}
									style={frameStyle}
								>
									<Icon
										className={`text-${category.color} h-5 w-5 transition-all duration-300`}
										style={accentStyle}
									/>
								</div>
								<div>
									<h3 className="text-sm font-medium">{category.label}</h3>
									<p className="text-muted-foreground text-xs">
										{category.description}
									</p>
								</div>
							</div>
							<span
								className={`data-number text-${category.color} text-sm font-bold`}
								style={accentStyle}
							>
								{weight}
							</span>
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
