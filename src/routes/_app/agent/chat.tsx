import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Bot } from 'lucide-react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/_app/agent/chat')({
	component: AgentChat,
})

function AgentChat() {
	return (
		<FlowPageShell
			title="Pax Agent Chat"
			subtitle="Final profile refinement"
			icon={Bot}
		>
			<div className="border p-5 text-sm leading-relaxed">
				Tell me about the clients who thrive with you, the promises you make,
				and the situations where you create the most peace.
			</div>
			<Textarea rows={6} placeholder="Type your answer..." className="mt-4" />
			<div className="mt-10 flex justify-end">
				<Button asChild>
					<Link to="/agent/subscribe">
						Finish Profile
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>
		</FlowPageShell>
	)
}
