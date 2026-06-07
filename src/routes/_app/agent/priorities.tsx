import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Briefcase, CheckCircle2, Shield } from 'lucide-react'
import { useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	getStoredIntakeDraftForRole,
	saveStoredIntakeDraftForRole,
} from '@/lib/intake-draft'

export const Route = createFileRoute('/_app/agent/priorities')({
	component: AgentPriorities,
})

function AgentPriorities() {
	const draft = getStoredIntakeDraftForRole('agent')
	const [representation, setRepresentation] = useState(
		draft.agentRepresentation ?? '',
	)

	return (
		<FlowPageShell
			title="Tell Us About Yourself"
			subtitle="Step 1"
			icon={Shield}
			roleLabel="Agent"
			headerInsideCard
		>
			<p className="text-muted-foreground text-sm leading-relaxed">
				Answer questions about your working style, communication preferences,
				and transaction approach. Then we'll verify your license, collect your
				contact details, and capture what makes you stand out to clients.
			</p>

			<div className="mt-8 grid gap-3 sm:grid-cols-2">
				{['Buyer representation', 'Seller representation'].map((option) => (
					<Button
						key={option}
						type="button"
						onClick={() => setRepresentation(option)}
						variant={representation === option ? 'default' : 'outline'}
						className="h-auto justify-start whitespace-normal"
					>
						<Briefcase className="h-4 w-4" />
						{option}
					</Button>
				))}
			</div>

			<Card className="mt-8 rounded-none border bg-transparent p-5 py-5 shadow-none ring-0">
				<h2 className="text-xl">Here's how it works — and what it costs.</h2>
				<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
					PRE connects agents with pre-matched consumers who already fit your
					working style. No cold leads. No bidding wars.
				</p>
				<div className="mt-5 space-y-3">
					{[
						'Step 1 — Build Your Profile',
						'Step 2 — Pax Deep Dive',
						'Step 3 — Get Matched',
						'$99 / month — keeps your profile active',
						'Selection fees: Shared intro $199 · Exclusive intro $399',
					].map((item) => (
						<div key={item} className="flex gap-3 text-sm">
							<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
							<span>{item}</span>
						</div>
					))}
				</div>
			</Card>

			<div className="mt-10 flex justify-end">
				{representation ? (
					<Button asChild>
						<Link
							to="/agent/quiz"
							onClick={() =>
								saveStoredIntakeDraftForRole('agent', {
									agentRepresentation: representation,
								})
							}
						>
							I'm in — build my profile
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				) : (
					<Button disabled>
						I'm in — build my profile
						<ArrowRight className="h-4 w-4" />
					</Button>
				)}
			</div>
			<p className="text-muted-foreground mt-4 text-center text-xs">
				No payment required until you're ready to go live.
			</p>
		</FlowPageShell>
	)
}
