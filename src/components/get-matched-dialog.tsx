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
import { ArrowRight, X } from 'lucide-react'
import { HouseLineIcon, TagIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

type FlowOption = {
	to: string
	flow: 'buyer' | 'seller'
	description: string
	icon: Icon
}

const options: FlowOption[] = [
	{
		to: '/buyer',
		flow: 'buyer',
		description: 'Buy a House',
		icon: HouseLineIcon,
	},
	{
		to: '/seller',
		flow: 'seller',
		description: 'Sell a House',
		icon: TagIcon,
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
						variant="link"
						size="icon-sm"
						className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4"
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
						<DialogFooter className="gap-2 sm:justify-center">
							<Button asChild variant="secondary">
								<Link to={resumeTo}>
									Resume
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button asChild variant="destructive">
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
							<DialogTitle className="text-center">
								What are you looking to do?
							</DialogTitle>
						</DialogHeader>
						<div className="grid grid-cols-2 gap-3">
							{options.map((option) => {
								const OptionIcon = option.icon
								return (
									<Button key={option.flow} asChild variant="default">
										<Link
											to={option.to}
											onClick={() =>
												saveStoredConsumerDraftForFlow(option.flow, {
													...zipCodeUpdate,
												})
											}
										>
											<OptionIcon className="size-6" />
											{option.description}
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
