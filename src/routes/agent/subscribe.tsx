import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, CreditCard } from 'lucide-react'

import { FlowPageShell } from '@/components/flow/page-shell'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/agent/subscribe')({
	component: AgentSubscribe,
})

function AgentSubscribe() {
	return (
		<FlowPageShell
			title="Sign Up"
			subtitle="Step 7"
			icon={CreditCard}
			roleLabel="Agent"
			headerInsideCard
		>
			<h2 className="text-center text-3xl">
				Pax has built your match profile.
			</h2>
			<p className="text-muted-foreground mx-auto mt-3 max-w-md text-center text-sm leading-relaxed">
				Subscribe to go live and start receiving pre-matched consumer
				introductions.
			</p>
			<div className="mt-8 text-center text-5xl">$99 / month</div>
			<p className="text-muted-foreground mt-2 text-center text-sm">
				Agent Concierge — keeps your profile active and you visible to matched
				consumers.
			</p>
			<div className="mt-8 space-y-3">
				{[
					'Your profile live in the PRE consumer marketplace',
					'AI-matched consumers sent directly to you',
					'Only pre-qualified intros — no tire-kickers',
					'Pause or cancel anytime',
					'Selection fees: Shared intro $199 · Exclusive intro $399',
					'You can decline any intro at no charge. Fees only apply when you accept.',
				].map((item) => (
					<div key={item} className="flex gap-3 text-sm">
						<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
						{item}
					</div>
				))}
			</div>
			<Button className="mt-10 w-full">Subscribe and Go Live</Button>
		</FlowPageShell>
	)
}
