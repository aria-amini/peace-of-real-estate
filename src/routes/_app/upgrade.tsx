import { useState } from 'react'
import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import {
	ArrowRightLeft,
	CheckCircle2,
	CreditCard,
	User,
	Zap,
	Shield,
	Star,
	MessageCircle,
	Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	redirectUnauthenticatedUsers,
	isUserPremium,
	upgradeToPremium,
} from '@/lib/auth-guards'
import { FlowPageShell } from '@/components/flow-page-shell'

export const Route = createFileRoute('/_app/upgrade')({
	beforeLoad: async () => {
		const session = await redirectUnauthenticatedUsers()
		const premium = await isUserPremium()
		if (premium) {
			throw redirect({ to: '/match-activity' })
		}
		return session
	},
	component: UpgradePage,
})

function UpgradePage() {
	const [isProcessing, setIsProcessing] = useState(false)
	const [isComplete, setIsComplete] = useState(false)

	const handleUpgrade = async () => {
		setIsProcessing(true)
		try {
			await upgradeToPremium()
			setIsComplete(true)
		} catch {
			setIsProcessing(false)
		}
	}

	if (isComplete) {
		return (
			<FlowPageShell
				title="Welcome to Premium"
				icon={CheckCircle2}
				card={false}
			>
				<div className="mx-auto max-w-md space-y-8 text-center">
					<div className="flex justify-center">
						<div className="flex h-20 w-20 items-center justify-center border-2 border-green-500">
							<CheckCircle2 className="h-10 w-10 text-green-600" />
						</div>
					</div>
					<div>
						<h2 className="text-3xl">You are all set.</h2>
						<p className="text-muted-foreground mt-3 text-sm leading-relaxed">
							Your premium access is now active. View your matches and manage
							your profile anytime.
						</p>
					</div>
					<div className="flex flex-col gap-3">
						<Button asChild size="lg" className="w-full">
							<Link to="/match-activity">
								<ArrowRightLeft className="h-4 w-4" />
								View Match Activity
							</Link>
						</Button>
						<Button asChild variant="secondary" className="w-full">
							<Link to="/account">
								<User className="h-4 w-4" />
								Go to Profile
							</Link>
						</Button>
					</div>
				</div>
			</FlowPageShell>
		)
	}

	return (
		<FlowPageShell title="Unlock Premium Access" icon={CreditCard} card={false}>
			<div className="mx-auto max-w-xl space-y-10">
				{/* Pricing Header */}
				<div className="border p-8 text-center">
					<div className="text-muted-foreground mb-2 text-sm tracking-wider uppercase">
						Unlock Matches
					</div>
					<h2 className="text-2xl font-semibold">
						Meet the agent who actually fits you.
					</h2>
					<div className="mt-6 text-5xl font-bold">$19.99</div>
					<p className="text-muted-foreground mt-2 text-sm">
						One-time fee · No subscription · 100% refundable if no match
					</p>
				</div>

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
								icon: Shield,
								text: 'Peace Pact verified — transparent, no hidden fees',
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
		</FlowPageShell>
	)
}
