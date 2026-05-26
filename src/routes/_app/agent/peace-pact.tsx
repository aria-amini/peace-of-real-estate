import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ScrollText } from 'lucide-react'
import { useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
			subtitle="Agent acknowledgment"
			icon={ScrollText}
		>
			<div className="max-h-80 overflow-y-auto border p-5 text-sm leading-relaxed">
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
			</div>

			<label className="mt-6 flex items-start gap-3 text-sm leading-relaxed">
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
			</label>

			<label
				htmlFor="agent-signature"
				className="mt-6 block space-y-2 text-sm font-medium"
			>
				Agent Signature (type full name)
				<Input
					id="agent-signature"
					value={signature}
					onChange={(event) => setSignature(event.target.value)}
				/>
			</label>
			<p className="text-muted-foreground mt-3 text-xs">
				Date: 5/5/2026. By signing, you confirm you will honor the Peace Pact
				for all client engagements through PRE.
			</p>

			<div className="mt-10 flex justify-end">
				{canSign ? (
					<Button asChild>
						<Link to="/agent/deep-dive">
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
