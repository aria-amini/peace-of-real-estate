import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ArrowRight, User } from 'lucide-react'
import { useState } from 'react'

import { FlowPageShell } from '@/components/flow/page-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	loadAgentProfile,
	saveAgentProfile,
} from '@/lib/matching/profile.db'
import type { AgentProfileUpdate } from '@/lib/matching/profile.types'
import { withSaveToast } from '@/lib/toast'

export const Route = createFileRoute('/agent/profile')({
	component: AgentProfile,
	loader: () => loadAgentProfile(),
})

const textFields = [
	['firstName', 'First name'],
	['lastName', 'Last name'],
	['brokerageName', 'Brokerage name'],
	['email', 'Email address'],
	['phone', 'Telephone number'],
	['businessAddress', 'Business address'],
	['billingAddress', 'Billing address'],
	['licenseNumberState', 'License number & state'],
	['yearsLicensed', 'Years licensed'],
	['averageTransactions', 'Avg transactions / year (last 3 years)'],
	['licenseProof', 'Proof of current license URL or note'],
] as const

const emptyProfile: AgentProfileUpdate = {
	firstName: '',
	lastName: '',
	brokerageName: '',
	email: '',
	phone: '',
	businessAddress: '',
	billingAddress: '',
	licenseNumberState: '',
	serviceAreas: [],
	yearsLicensed: '',
	averageTransactions: '',
	employmentStatus: '',
	licenseProof: '',
	clientFirstTerms: '',
	valueProposition: '',
	usePaxWriter: true,
}

function AgentProfile() {
	const agentProfile = Route.useLoaderData()
	const saveAgent = useServerFn(saveAgentProfile)
	const navigate = useNavigate()
	const initial = { ...emptyProfile, ...agentProfile }
	const [formData, setFormData] = useState<AgentProfileUpdate>(initial)
	const [serviceAreas, setServiceAreas] = useState(
		(initial.serviceAreas ?? []).join(', '),
	)

	const updateField = (
		field: keyof AgentProfileUpdate,
		value: string | boolean,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	const handleContinue = async () => {
		const parts = serviceAreas
			.split(',')
			.map((area) => area.trim())
			.filter(Boolean)
		const update: AgentProfileUpdate = {
			...formData,
			serviceAreas: parts,
		}
		const ok = await withSaveToast(() => saveAgent({ data: update }))
		if (ok) {
			await navigate({ to: '/agent/compliance' })
		}
	}

	return (
		<FlowPageShell
			title="Your Details"
			subtitle="Step 3 — Registration profile"
			icon={User}
			roleLabel="Agent"
			headerInsideCard
		>
			<p className="text-muted-foreground mb-8 text-sm leading-relaxed">
				Complete your registration. All fields are optional for the prototype.
				License # appears on your profile as a link to your state's verification
				database.
			</p>

			<div className="grid gap-4 sm:grid-cols-2">
				{textFields.map(([field, label]) => (
					<Label
						key={field}
						className="text-muted-foreground flex-col items-start gap-2 text-xs font-medium tracking-[0.14em] uppercase"
					>
						{label}
						<Input
							value={String(formData[field] ?? '')}
							onChange={(event) => updateField(field, event.target.value)}
							className="tracking-normal normal-case"
						/>
					</Label>
				))}
				<Label className="text-muted-foreground flex-col items-start gap-2 text-xs font-medium tracking-[0.14em] uppercase sm:col-span-2">
					Service areas
					<Input
						value={serviceAreas}
						onChange={(event) => setServiceAreas(event.target.value)}
						placeholder="Area 1, Area 2, Area 3"
						className="tracking-normal normal-case"
					/>
				</Label>
			</div>

			<Label className="text-muted-foreground mt-6 flex-col items-start gap-2 text-xs font-medium tracking-[0.14em] uppercase">
				Full or part time
				<select
					value={formData.employmentStatus ?? ''}
					onChange={(event) =>
						updateField('employmentStatus', event.target.value)
					}
					className="w-full tracking-normal normal-case"
				>
					<option value="">Select...</option>
					<option value="Full time">Full time</option>
					<option value="Part time">Part time</option>
				</select>
			</Label>

			<Label
				htmlFor="client-first-terms"
				className="text-muted-foreground mt-6 flex-col items-start gap-2 text-xs font-medium tracking-[0.14em] uppercase"
			>
				What contract terms do you offer that put clients first?
				<Textarea
					id="client-first-terms"
					value={formData.clientFirstTerms ?? ''}
					onChange={(event) =>
						updateField('clientFirstTerms', event.target.value)
					}
					rows={5}
					placeholder="Shorter commitments, easy exit clauses, communication guarantees, or anything else in your agreements."
					className="tracking-normal normal-case"
				/>
			</Label>

			<Card className="mt-6 gap-4 rounded-none border bg-transparent p-5 py-5 shadow-none ring-0">
				<div className="flex items-start gap-3">
					<input
						id="use-pax-writer"
						type="checkbox"
						checked={Boolean(formData.usePaxWriter)}
						onChange={(event) =>
							updateField('usePaxWriter', event.target.checked)
						}
						className="mt-1"
					/>
					<Label htmlFor="use-pax-writer" className="text-sm leading-relaxed">
						Use Pax AI writer for my value proposition. After you complete your
						profile Pax will get to know you through a short conversation and
						write the copy shown on your matched agent card.
					</Label>
				</div>
				<Textarea
					value={formData.valueProposition ?? ''}
					onChange={(event) =>
						updateField('valueProposition', event.target.value)
					}
					rows={5}
					placeholder="Already have one? Paste your value proposition here."
				/>
			</Card>

			<div className="mt-10 flex justify-end">
				<Button onClick={handleContinue}>
					Continue to Compliance Checklist
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>
		</FlowPageShell>
	)
}
