import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, X } from 'lucide-react'
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

function PricingInfo() {
	const [showFeeInfo, setShowFeeInfo] = useState(false)

	return (
		<div className="flex flex-col gap-5">
			<DialogTitle className="text-primary font-heading text-2xl font-bold">
				How this works
			</DialogTitle>
			<DialogDescription className="text-muted-foreground text-sm leading-relaxed">
				Answer everything for free. If you want your verified PRE matches, PRE
				is <span className="font-semibold">$19.99 (one-time)</span>. No
				subscription.
			</DialogDescription>
			<ul className="flex flex-col gap-2.5">
				{[
					'Free fit snapshot',
					'Verified PRE matches',
					'Intro to your top agent(s)',
				].map((item) => (
					<li key={item} className="flex items-center gap-2">
						<CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
						<span className="text-sm font-medium">{item}</span>
					</li>
				))}
			</ul>
			<button
				type="button"
				className="text-muted-foreground cursor-pointer self-start text-xs italic hover:underline"
				onClick={() => setShowFeeInfo(!showFeeInfo)}
			>
				*Why is there a fee?
			</button>
			{showFeeInfo && (
				<div className="text-muted-foreground border-border/50 bg-muted/50 -mt-1 rounded-md border px-3 py-2 text-xs leading-relaxed">
					Covers PRE verification + match rationale
					<br />
					Signals seriousness to agents ("skin in the game")—they respond more
					thoughtfully to verified requests
				</div>
			)}
		</div>
	)
}

export function GetMatchedDialog({ children }: { children: React.ReactNode }) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent showCloseButton={false}>
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
				<PricingInfo />
				<DialogFooter className="flex gap-4 border-t pt-6 sm:flex-col">
					<p className="font-heading text-center text-lg font-semibold">
						Ready to Match?
					</p>
					<div className="grid w-full grid-cols-2 gap-3">
						{options.map((option) => {
							const OptionIcon = option.icon
							return (
								<Button key={option.flow} asChild variant="default">
									<Link to={option.to}>
										<OptionIcon className="size-6" />
										{option.description}
									</Link>
								</Button>
							)
						})}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
