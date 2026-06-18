import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const Route = createFileRoute('/agent/compliance')({
	component: AgentCompliance,
})

function AgentCompliance() {
	const [attested, setAttested] = useState(false)
	const [insurance, setInsurance] = useState('')
	const canContinue = attested && insurance.length > 0

	return (
		<FlowPageShell
			title="Compliance Checklist"
			subtitle="Step 4"
			icon={ShieldCheck}
			roleLabel="Agent"
			headerInsideCard
		>
			<Label className="flex items-start gap-3 border p-5 text-sm leading-relaxed">
				<input
					type="checkbox"
					checked={attested}
					onChange={(event) => setAttested(event.target.checked)}
					className="mt-1"
				/>
				<span>
					I confirm that my real estate license is currently active and in good
					standing in all states where I am licensed, that there are no pending
					or active disciplinary actions, complaints, or investigations, and
					that I have not previously had a real estate license suspended,
					revoked, or subject to formal disciplinary action.
				</span>
			</Label>

			<div className="mt-8">
				<div className="mb-3 text-sm font-medium">
					Errors and Omissions (E&O) Insurance
				</div>
				<RadioGroup value={insurance} onValueChange={setInsurance}>
					{[
						'Yes, I carry my own E&O policy',
						'Yes, I am covered through my brokerage',
						'No',
					].map((option) => (
						<Label
							key={option}
							className="flex items-center gap-3 border p-4 text-sm"
						>
							<RadioGroupItem value={option} />
							{option}
						</Label>
					))}
				</RadioGroup>
			</div>

			<div className="mt-10 flex justify-end">
				{canContinue ? (
					<Button asChild>
						<Link to="/agent/peace-pact">
							Complete Registration
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				) : (
					<Button disabled>
						Complete Registration
						<ArrowRight className="h-4 w-4" />
					</Button>
				)}
			</div>
		</FlowPageShell>
	)
}
