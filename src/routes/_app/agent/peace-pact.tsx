import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ScrollText } from 'lucide-react'
import { useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/_app/agent/peace-pact')({
	component: AgentPeacePact,
})

function AgentPeacePact() {
	const [agreed, setAgreed] = useState(false)
	const [signature, setSignature] = useState('')
	const canSign = agreed && signature.trim().length > 2

	return (
		<FlowPageShell
			title="The Peace Pact"
			subtitle="Step 5"
			icon={ScrollText}
			roleLabel="Agent"
			headerInsideCard
		>
			<Card className="max-h-80 overflow-y-auto rounded-none border bg-transparent p-5 py-5 text-sm leading-relaxed shadow-none ring-0">
				<h2 className="mb-4 text-xl">THE PEACE PACT</h2>
				<p>
					This Commitment reinforces ethical, transparent, and consumer-first
					real estate practices consistent with the NAR Code of Ethics,
					particularly Article 1.
				</p>
				<p className="mt-4">
					I commit to protecting and promoting my client's interests with
					loyalty, care, and diligence while treating all parties honestly and
					fairly.
				</p>
				<p className="mt-4">
					I affirm that buyers and sellers retain the right to make their own
					decisions, negotiate compensation freely, and decline any term or
					service that does not align with their goals.
				</p>
				<p className="mt-4">
					I will not steer buyers toward or away from properties based on
					compensation, and I will explain representation, services, and
					compensation options clearly before and during any agency
					relationship.
				</p>
				<p className="mt-4">
					By signing below, I affirm that I understand and agree to uphold the
					Peace Pact in alignment with the NAR Code of Ethics, applicable
					Consumer Guides, and governing real estate laws and regulations.
				</p>
			</Card>

			<Label className="mt-6 flex items-start gap-3 text-sm leading-relaxed">
				<input
					type="checkbox"
					checked={agreed}
					onChange={(event) => setAgreed(event.target.checked)}
					className="mt-1"
				/>
				<span>
					I agree to uphold the Peace Pact in alignment with the NAR Code of
					Ethics and applicable regulations.
				</span>
			</Label>

			<Label
				htmlFor="agent-signature"
				className="mt-6 flex-col items-start gap-2 text-sm font-medium"
			>
				Agent Signature (type full name)
				<Input
					id="agent-signature"
					value={signature}
					onChange={(event) => setSignature(event.target.value)}
				/>
			</Label>
			<p className="text-muted-foreground mt-3 text-xs">
				Date: 5/5/2026. By signing, you confirm you will honor the Peace Pact
				for all client engagements through PRE.
			</p>

			<div className="mt-10 flex justify-end">
				{canSign ? (
					<Button asChild>
						<Link to="/agent/chat">
							Sign & Activate
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				) : (
					<Button disabled>
						Sign & Activate
						<ArrowRight className="h-4 w-4" />
					</Button>
				)}
			</div>
		</FlowPageShell>
	)
}
