import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	clearStoredConsumerDraftForFlow,
	getNextPathForConsumerFlow,
	getStoredIntakeDraft,
	getStoredIntakeDraftForRole,
	saveStoredConsumerDraftForFlow,
} from '@/lib/intake-draft'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Home, Tag, X } from 'lucide-react'

type FlowOption = {
	to: string
	flow: 'buyer' | 'seller'
	label: string
	description: string
	icon: typeof Home
}

const options: FlowOption[] = [
	{
		to: '/buyer',
		flow: 'buyer',
		label: 'Buying',
		description: 'Find an agent for your home search.',
		icon: Home,
	},
	{
		to: '/seller',
		flow: 'seller',
		label: 'Selling',
		description: 'Find an agent for your listing.',
		icon: Tag,
	},
]

export function GetMatchedDialog({ children }: { children: React.ReactNode }) {
	const existingDraft = getStoredIntakeDraft()
	const draft = getStoredIntakeDraftForRole('consumer')
	const zipCodeUpdate = draft.zipCode ? { zipCode: draft.zipCode } : {}
	const savedConsumerDraft =
		existingDraft?.role === 'consumer' && existingDraft.flowKind
			? existingDraft
			: null
	const savedFlowKind = savedConsumerDraft?.flowKind ?? null
	const hasSavedProfile = Boolean(
		savedConsumerDraft &&
		(savedConsumerDraft.lastCompletedStage ||
			savedConsumerDraft.zipCode ||
			savedConsumerDraft.intent ||
			Object.keys(savedConsumerDraft.answers ?? {}).length > 0),
	)
	const savedFlowLabel = savedFlowKind === 'buyer' ? 'buyer' : 'seller'
	const resumeTo =
		savedConsumerDraft && savedFlowKind
			? getNextPathForConsumerFlow(savedFlowKind, savedConsumerDraft)
			: '/buyer/intro'
	const startOverTo = savedFlowKind ? `/${savedFlowKind}/intro` : '/buyer/intro'

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="rounded-lg" showCloseButton={false}>
				<DialogClose asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 rounded-md"
					>
						<X className="size-4" />
						<span className="sr-only">Close</span>
					</Button>
				</DialogClose>
				{hasSavedProfile && savedConsumerDraft && savedFlowKind ? (
					<>
						<DialogHeader>
							<DialogTitle>Continue your {savedFlowLabel} profile?</DialogTitle>
							<DialogDescription>
								You have a saved {savedFlowLabel} profile. Pick up where you
								left off or start over.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter className="gap-2 sm:justify-start">
							<Button asChild>
								<Link to={resumeTo}>
									Resume
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button asChild variant="outline">
								<Link
									to={startOverTo}
									onClick={() => clearStoredConsumerDraftForFlow(savedFlowKind)}
								>
									Start over
								</Link>
							</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>What are you looking to do?</DialogTitle>
							<DialogDescription>
								Choose the path that fits your next move
							</DialogDescription>
						</DialogHeader>
						<div className="grid grid-cols-2 gap-3">
							{options.map((option) => {
								const Icon = option.icon
								return (
									<Button
										key={option.flow}
										asChild
										variant="outline"
										className="group hover:bg-accent h-auto flex-col items-start gap-2 rounded-lg p-4 text-left"
									>
										<Link
											to={option.to}
											onClick={() =>
												saveStoredConsumerDraftForFlow(option.flow, {
													...zipCodeUpdate,
												})
											}
										>
											<div className="flex w-full items-start justify-between">
												<Icon className="text-primary h-5 w-5" />
												<ArrowRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
											</div>
											<div>
												<span className="block text-sm font-medium">
													{option.label}
												</span>
												<span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
													{option.description}
												</span>
											</div>
										</Link>
									</Button>
								)
							})}
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
