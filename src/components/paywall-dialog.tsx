import { useState } from 'react'
import {
	CheckCircle2,
	CreditCard,
	ArrowRightLeft,
	Star,
	Users,
	MessageCircle,
	Zap,
	User,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { upgradeToPremium } from '@/lib/auth-guards'

export function PaywallDialog({
	open,
	onOpenChange,
	onUpgrade,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	onUpgrade?: () => void
}) {
	const [isProcessing, setIsProcessing] = useState(false)
	const [isComplete, setIsComplete] = useState(false)

	const handleUpgrade = async () => {
		setIsProcessing(true)
		try {
			await upgradeToPremium()
			setIsComplete(true)
			onUpgrade?.()
		} catch {
			setIsProcessing(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl">
				{isComplete ? (
					<div className="space-y-8 text-center">
						<div className="flex justify-center">
							<div className="flex h-20 w-20 items-center justify-center border-2 border-green-500">
								<CheckCircle2 className="h-10 w-10 text-green-600" />
							</div>
						</div>
						<div>
							<DialogHeader>
								<DialogTitle className="text-2xl">You are all set.</DialogTitle>
							</DialogHeader>
							<p className="text-muted-foreground mt-3 text-sm leading-relaxed">
								Your premium access is now active. View your matches and manage
								your profile anytime.
							</p>
						</div>
						<div className="flex flex-col gap-3">
							<Button
								onClick={() => onOpenChange(false)}
								size="lg"
								className="w-full"
							>
								<ArrowRightLeft className="h-4 w-4" />
								View Match Activity
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-8">
						{/* Pricing Header */}
						<Card className="rounded-none border bg-transparent p-6 py-6 text-center shadow-none ring-0">
							<div className="text-muted-foreground mb-2 text-sm tracking-wider uppercase">
								Unlock Matches
							</div>
							<h2 className="text-xl font-semibold">
								Meet the agent who actually fits you.
							</h2>
							<div className="mt-6 text-5xl font-bold">$19.99</div>
							<p className="text-muted-foreground mt-2 text-sm">
								One-time fee · No subscription · 100% refundable if no match
							</p>
						</Card>

						{/* Feature List */}
						<div className="space-y-4">
							<h3 className="text-sm font-medium tracking-wider uppercase">
								What you get
							</h3>
							<div className="space-y-3">
								{[
									{
										icon: ArrowRightLeft,
										text: 'Full match activity dashboard with live introductions',
									},
									{
										icon: Star,
										text: 'Detailed compatibility scores and fit breakdowns',
									},
									{
										icon: Users,
										text: 'View full agent profiles, experience, and specialties',
									},
									{
										icon: MessageCircle,
										text: 'Accept introductions and message matched agents',
									},
									{
										icon: Zap,
										text: 'Update your profile and preferences anytime',
									},
									{
										icon: User,
										text: 'Personalized account dashboard with match history',
									},
								].map((feature) => (
									<div key={feature.text} className="flex gap-3 text-sm">
										<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
										<feature.icon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
										{feature.text}
									</div>
								))}
							</div>
						</div>

						{/* Payment Button */}
						<div className="space-y-4">
							<Button
								onClick={() => void handleUpgrade()}
								disabled={isProcessing}
								className="w-full"
								size="lg"
							>
								{isProcessing ? (
									<span className="flex items-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
										Processing...
									</span>
								) : (
									<span className="flex items-center gap-2">
										<CreditCard className="h-4 w-4" />
										Unlock Premium — $19.99
									</span>
								)}
							</Button>
							<p className="text-muted-foreground text-center text-xs">
								This is a demo payment. No real charges will be made.
							</p>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
