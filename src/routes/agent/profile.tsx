import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, User, MapPin, FileText, Award } from 'lucide-react'
import { useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import {
	getStoredIntakeDraftForRole,
	saveStoredIntakeDraftForRole,
} from '@/lib/intake-draft'

export const Route = createFileRoute('/agent/profile')({
	component: AgentProfile,
})

function AgentProfile() {
	const [formData, setFormData] = useState(
		() =>
			getStoredIntakeDraftForRole('agent').agentProfile ?? {
				experience: '',
				zipCodes: '',
				services: [] as string[],
			},
	)

	const updateFormData = (
		updater: (prev: typeof formData) => typeof formData,
	) => {
		setFormData((prev) => {
			const next = updater(prev)
			saveStoredIntakeDraftForRole('agent', { agentProfile: next })
			return next
		})
	}

	const toggleService = (service: string) => {
		updateFormData((prev) => ({
			...prev,
			services: prev.services.includes(service)
				? prev.services.filter((s) => s !== service)
				: [...prev.services, service],
		}))
	}

	const services = [
		'Buyer Representation',
		'Seller Representation',
		'Investment Properties',
		'Luxury Homes',
		'First-time Buyers',
		'Relocation',
		'Commercial',
		'Property Management',
	]

	return (
		<FlowPageShell
			backTo="/agent/quiz"
			backLabel="Back to questions"
			title="Create Your Profile"
			subtitle="Step 3 of 4 — Tell us about your experience and services"
			icon={User}
			iconClassName="border-terracotta bg-terracotta-tint text-terracotta"
		>
			{/* Progress */}
			<div className="mb-10">
				<div className="mb-3 flex items-center justify-between text-xs">
					<span className="data-label text-terracotta">Profile Creation</span>
					<span className="data-number text-muted-foreground">75%</span>
				</div>
				<div className="bg-border h-1 overflow-hidden">
					<div
						className="bg-terracotta h-full transition-all duration-500"
						style={{ width: '75%' }}
					/>
				</div>
			</div>

			{/* Form */}
			<div className="space-y-8">
				{/* Experience */}
				<div className="space-y-3">
					<label
						htmlFor="experience"
						className="flex items-center gap-2 text-sm font-medium"
					>
						<Award className="h-4 w-4" />
						Years of Experience
					</label>
					<select
						id="experience"
						value={formData.experience}
						onChange={(e) =>
							updateFormData((prev) => ({
								...prev,
								experience: e.target.value,
							}))
						}
						className="border-border bg-background focus:border-primary w-full border px-4 py-3 text-sm focus:outline-none"
					>
						<option value="">Select experience range...</option>
						<option value="0-2">0-2 years</option>
						<option value="3-5">3-5 years</option>
						<option value="6-10">6-10 years</option>
						<option value="10+">10+ years</option>
					</select>
				</div>

				<div className="hairline" />

				{/* Zip Codes */}
				<div className="space-y-3">
					<label
						htmlFor="zipCodes"
						className="flex items-center gap-2 text-sm font-medium"
					>
						<MapPin className="h-4 w-4" />
						Zip Codes Served
					</label>
					<input
						id="zipCodes"
						type="text"
						placeholder="e.g. 78701, 78702, 78703"
						value={formData.zipCodes}
						onChange={(e) =>
							updateFormData((prev) => ({
								...prev,
								zipCodes: e.target.value,
							}))
						}
						className="border-border bg-background focus:border-primary w-full border px-4 py-3 text-sm focus:outline-none"
					/>
					<p className="text-muted-foreground text-xs">
						Separate multiple zip codes with commas
					</p>
				</div>

				<div className="hairline" />

				{/* Services */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm font-medium">
						<FileText className="h-4 w-4" />
						Services Offered
					</div>
					<div className="flex flex-wrap gap-2">
						{services.map((service) => {
							const isSelected = formData.services.includes(service)
							return (
								<button
									key={service}
									onClick={() => toggleService(service)}
									className={`border px-4 py-2 text-sm transition-all ${
										isSelected
											? 'border-terracotta bg-terracotta text-terracotta-foreground'
											: 'border-border text-muted-foreground hover:border-terracotta hover:text-terracotta'
									}`}
								>
									{service}
								</button>
							)
						})}
					</div>
				</div>
			</div>

			{/* Navigation */}
			<div className="mt-10 flex items-center justify-between">
				<Link
					to="/agent/quiz"
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
				>
					Back
				</Link>
				<Link
					to={'/match-activity' as any}
					className="btn-primary inline-flex items-center gap-2"
				>
					View Match Demo
					<ArrowRight className="h-4 w-4" />
				</Link>
			</div>
		</FlowPageShell>
	)
}
