import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { SlidersHorizontal } from 'lucide-react'
import { CategoryWeightSelector } from '@/components/category-weight-selector'
import { categoryWeightOptions } from '@/lib/category-weight-options'
import { useAccountSettings } from '@/hooks/use-account-settings'
import type { CategoryWeights } from '@/lib/user-settings'

export const Route = createFileRoute('/_app/account/preferences')({
	component: AccountPreferences,
})

const agentCategoryWeightOptions = categoryWeightOptions.map((cat) => ({
	...cat,
	description:
		cat.id === 'working-style'
			? 'How you prefer to work with clients'
			: cat.id === 'communication'
				? 'Your approach to client updates and interactions'
				: cat.id === 'transparency'
					? 'How you handle fees, process, and expectations'
					: 'The type of client relationships you excel at',
}))

function AccountPreferences() {
	const { settings, loading, handleWeightsUpdate } = useAccountSettings()
	const [localWeights, setLocalWeights] = useState<CategoryWeights | null>(null)

	if (loading) {
		return <div className="flex-1" />
	}

	const role = settings?.role ?? 'consumer'
	const isConsumer = role === 'consumer'
	const weights = localWeights ??
		settings?.weights ?? {
			'working-style': 3,
			communication: 3,
			transparency: 3,
			fit: 3,
		}

	const handleSave = () => {
		if (localWeights) {
			void handleWeightsUpdate(localWeights)
		}
	}

	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-12 xl:mx-0 xl:ml-[calc((100vw-48rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Account menu</span>
			</div>
			<div className="space-y-6">
				<Card className="rounded-none border bg-transparent p-8 py-8 shadow-none ring-0">
					<div className="mb-6 flex items-center gap-3">
						<SlidersHorizontal className="text-muted-foreground h-5 w-5" />
						<div>
							<div className="text-muted-foreground text-sm">
								Match Preferences
							</div>
							<p className="text-muted-foreground mt-1 text-sm">
								Category weights determine how matches are ranked
							</p>
						</div>
					</div>

					<CategoryWeightSelector
						categories={
							isConsumer ? categoryWeightOptions : agentCategoryWeightOptions
						}
						weights={weights}
						onChange={(id, value) =>
							setLocalWeights((prev) => ({
								...(prev ?? weights),
								[id]: value,
							}))
						}
					/>
					<div className="mt-8 flex justify-end">
						<Button onClick={handleSave}>Save Changes</Button>
					</div>
				</Card>
			</div>
		</div>
	)
}
