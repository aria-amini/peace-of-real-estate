import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	getStoredIntakeDraftForRole,
	saveStoredConsumerDraftForFlow,
} from '@/lib/intake-draft'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Home, Tag, type LucideIcon } from 'lucide-react'

type FlowOption = {
	to: string
	flow: 'buyer' | 'seller'
	label: string
	description: string
	icon: LucideIcon
}

const options: FlowOption[] = [
	{
		to: '/buyer/intro',
		flow: 'buyer',
		label: 'Buying',
		description: 'Find an agent for your home search.',
		icon: Home,
	},
	{
		to: '/seller/intro',
		flow: 'seller',
		label: 'Selling',
		description: 'Find an agent for your listing.',
		icon: Tag,
	},
]

function FlowCard({
	option,
	zipCodeUpdate,
}: {
	option: FlowOption
	zipCodeUpdate: { zipCode?: string }
}) {
	const Icon = option.icon
	return (
		<Button
			asChild
			variant="outline"
			className="hover:border-primary/40 hover:bg-accent/30 h-auto min-h-[8rem] flex-col items-start justify-between gap-4 rounded-xl p-6 text-left transition-colors"
		>
			<Link
				to={option.to}
				onClick={() =>
					saveStoredConsumerDraftForFlow(option.flow, {
						...zipCodeUpdate,
						intent: '',
					})
				}
			>
				<span>
					<Icon className="text-primary mb-3 h-5 w-5" />
					<span className="block text-lg tracking-[-0.03em]">
						{option.label}
					</span>
					<span className="text-muted-foreground mt-1 block text-sm">
						{option.description}
					</span>
				</span>
				<ArrowRight className="text-muted-foreground group-hover/button:text-foreground absolute top-6 right-6 h-4 w-4" />
			</Link>
		</Button>
	)
}

export function GetMatchedDialog({ children }: { children: React.ReactNode }) {
	const draft = getStoredIntakeDraftForRole('consumer')
	const zipCodeUpdate = draft.zipCode ? { zipCode: draft.zipCode } : {}

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>What are you looking to do?</DialogTitle>
					<DialogDescription>
						Choose the path that fits your next move
					</DialogDescription>
				</DialogHeader>
				<div className="grid w-full gap-4 sm:grid-cols-2">
					{options.map((option) => (
						<FlowCard
							key={option.flow}
							option={option}
							zipCodeUpdate={zipCodeUpdate}
						/>
					))}
				</div>
			</DialogContent>
		</Dialog>
	)
}
