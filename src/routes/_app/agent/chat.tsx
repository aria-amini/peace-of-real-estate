import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
	getStoredIntakeDraftForRole,
	saveStoredIntakeDraftForRole,
} from '@/lib/matching/intake-draft'

export const Route = createFileRoute('/_app/agent/chat')({
	component: AgentChat,
})

function AgentChat() {
	const draft = getStoredIntakeDraftForRole('agent')
	const [description, setDescription] = useState(
		draft.agentProfile?.valueProposition ?? '',
	)
	const canFinish = description.trim().length > 0

	const saveDescription = () => {
		saveStoredIntakeDraftForRole('agent', {
			agentProfile: {
				...draft.agentProfile,
				experience: draft.agentProfile?.experience ?? '',
				zipCodes: draft.agentProfile?.zipCodes ?? '',
				services: draft.agentProfile?.services ?? [],
				valueProposition: description.trim(),
			},
		})
	}

	return (
		<FlowPageShell
			title="Profile Description"
			subtitle="Step 6"
			icon={MessageCircle}
			roleLabel="Agent"
			headerInsideCard
		>
			<div className="space-y-3">
				<h2 className="font-heading text-xl leading-relaxed font-normal">
					Finish your profile with a short client-facing description.
				</h2>
				<p className="text-muted-foreground text-sm leading-relaxed">
					Describe the clients who thrive with you, the promises you make, and
					the situations where your approach creates the most peace.
				</p>
			</div>
			<Textarea
				value={description}
				onChange={(event) => setDescription(event.target.value)}
				rows={7}
				placeholder="Example: I help first-time buyers feel calm and informed by setting clear expectations, explaining tradeoffs plainly, and keeping communication steady from search to closing."
				className="mt-8"
			/>
			<div className="mt-10 flex justify-end">
				{canFinish ? (
					<Button asChild>
						<Link to="/agent/subscribe" onClick={saveDescription}>
							Finish Profile
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				) : (
					<Button disabled>
						Finish Profile
						<ArrowRight className="h-4 w-4" />
					</Button>
				)}
			</div>
		</FlowPageShell>
	)
}
