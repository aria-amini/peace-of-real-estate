import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAccountSettings } from '@/hooks/use-account-settings'

export const Route = createFileRoute('/agent/chat')({
	component: AgentChat,
})

function AgentChat() {
	const { agentProfile, loading, saveAgent } = useAccountSettings()
	const navigate = useNavigate()
	const [valueProposition, setValueProposition] = useState(
		agentProfile?.valueProposition ?? '',
	)

	if (loading) return null

	const canFinish = valueProposition.trim().length > 0

	const handleFinish = async () => {
		if (!canFinish) return
		const ok = await saveAgent({ valueProposition: valueProposition.trim() })
		if (ok) {
			await navigate({ to: '/agent/subscribe' })
		}
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
				value={valueProposition}
				onChange={(event) => setValueProposition(event.target.value)}
				rows={7}
				placeholder="Example: I help first-time buyers feel calm and informed by setting clear expectations, explaining tradeoffs plainly, and keeping communication steady from search to closing."
				className="mt-8"
			/>
			<div className="mt-10 flex justify-end">
				<Button onClick={handleFinish} disabled={!canFinish}>
					Finish Profile
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>
		</FlowPageShell>
	)
}
