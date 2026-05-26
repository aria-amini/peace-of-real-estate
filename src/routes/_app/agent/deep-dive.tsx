import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Bot } from 'lucide-react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_app/agent/deep-dive')({
	component: AgentDeepDive,
})

function AgentDeepDive() {
	return (
		<FlowPageShell
			title="Pax Deep Dive"
			subtitle="Prepare your match profile"
			icon={Bot}
		>
			<h2 className="text-2xl">Pax is ready to get to know your practice.</h2>
			<p className="text-muted-foreground mt-3 text-sm leading-relaxed">
				This short conversation helps Pax refine your match profile and write a
				consumer-facing value proposition if you opted into AI writer support.
			</p>
			<div className="mt-10 flex justify-end">
				<Button asChild>
					<Link to="/agent/chat">
						Start Pax Chat
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>
		</FlowPageShell>
	)
}
