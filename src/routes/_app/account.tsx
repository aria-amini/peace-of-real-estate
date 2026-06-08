import {
	clearStoredIntakeDraft,
	getStoredIntakeDraft,
} from '@/lib/intake-draft'
import { redirectUnauthenticatedUsers, isUserPremium } from '@/lib/auth-guards'
import {
	getUserSettings,
	getDefaultSettings,
	saveUserSettings,
	updateWeights,
	updateAnswers,
	updateAgentProfile,
	getAnswerSummary,
	groupQuestionsByCategory,
	type UserSettings,
	type CategoryWeights,
	type QuestionnaireAnswers,
} from '@/lib/user-settings'
import { buyerQuestionFlow, agentQuestionFlow } from '@/lib/questions'
import { CategoryWeightSelector } from '@/components/category-weight-selector'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { categoryWeightOptions } from '@/lib/category-weight-options'

import { createFileRoute, redirect } from '@tanstack/react-router'
import {
	SlidersHorizontal,
	ListChecks,
	MapPin,
	Award,
	FileText,
	Pencil,
	X,
	User,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/account')({
	beforeLoad: async () => {
		const { session } = await redirectUnauthenticatedUsers()
		const premium = await isUserPremium()
		if (!premium) {
			throw redirect({ to: '/upgrade' })
		}
		return { session }
	},
	component: Account,
})

const agentCategoryWeightOptions = categoryWeightOptions.map((cat) => ({
	...cat,
	description:
		cat.id === 'working-style'
			? 'How you prefer to work with clients'
			: cat.id === 'communication'
				? 'Your approach to client updates and interactions'
				: cat.id === 'transparency'
					? 'How you handle fees, process, and expectations'
					: 'The type of client relationships you excel at',
}))

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

function Account() {
	const { session } = Route.useRouteContext()
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [loading, setLoading] = useState(true)
	const [activeModal, setActiveModal] = useState<
		'weights' | 'answers' | 'agent-profile' | null
	>(null)
	const [, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
		'idle',
	)
	const [, setSaveErrorMessage] = useState<string | null>(null)

	const showSaveToast = useCallback(
		(status: 'saved' | 'error', message?: string) => {
			if (status === 'saved') {
				toast.success('Changes saved successfully')
			} else {
				toast.error(message ?? 'Error saving. Try again.')
			}
		},
		[],
	)

	// Load settings on mount
	useEffect(() => {
		void (async () => {
			const draft = getStoredIntakeDraft()

			try {
				if (draft) {
					await saveUserSettings(draft)
					clearStoredIntakeDraft()
				}

				const storedSettings = await getUserSettings()
				setSettings(storedSettings ?? draft ?? getDefaultSettings())
			} catch {
				setSettings(draft ?? getDefaultSettings())
			} finally {
				setLoading(false)
			}
		})()
	}, [])

	const handleWeightsUpdate = useCallback(
		async (weights: CategoryWeights) => {
			setSaveStatus('saving')
			setSaveErrorMessage(null)
			try {
				await updateWeights(weights)
				setSettings((prev) => (prev ? { ...prev, weights } : prev))
				showSaveToast('saved')
				setSaveStatus('idle')
			} catch {
				showSaveToast('error')
				setSaveStatus('idle')
			}
		},
		[showSaveToast],
	)

	const handleAnswersUpdate = useCallback(
		async (answers: QuestionnaireAnswers) => {
			setSaveStatus('saving')
			setSaveErrorMessage(null)
			try {
				await updateAnswers(answers)
				setSettings((prev) => (prev ? { ...prev, answers } : prev))
				showSaveToast('saved')
				setSaveStatus('idle')
				return true
			} catch {
				showSaveToast('error', 'Save failed. Please try again.')
				setSaveStatus('idle')
				return false
			}
		},
		[showSaveToast],
	)

	const handleAgentProfileUpdate = useCallback(
		async (profile: {
			experience: string
			zipCodes: string
			services: string[]
		}) => {
			setSaveStatus('saving')
			setSaveErrorMessage(null)
			try {
				await updateAgentProfile(profile)
				setSettings((prev) =>
					prev ? { ...prev, agentProfile: profile } : prev,
				)
				showSaveToast('saved')
				setSaveStatus('idle')
			} catch {
				showSaveToast('error')
				setSaveStatus('idle')
			}
		},
		[showSaveToast],
	)

	if (loading) {
		return <div className="flex-1" />
	}

	const role = settings?.role ?? 'consumer'
	const weights = settings?.weights ?? {
		'working-style': 3,
		communication: 3,
		transparency: 3,
		fit: 3,
	}
	const answers = settings?.answers ?? {}
	const agentProfile = settings?.agentProfile ?? {
		experience: '',
		zipCodes: '',
		services: [],
	}

	const isConsumer = role === 'consumer'
	const questions = isConsumer
		? buyerQuestionFlow.questions
		: agentQuestionFlow.questions

	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-12 xl:mx-0 xl:ml-[calc((100vw-48rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Account menu</span>
			</div>
			<div className="space-y-6">
				{/* Combined Profile Bar */}
				<Card className="rounded-none border bg-transparent p-8 py-8 shadow-none ring-0">
					<div className="mb-6 flex items-center gap-4">
						<div className="border-border bg-secondary flex h-12 w-12 items-center justify-center border">
							<User className="h-6 w-6" />
						</div>
						<div>
							<div className="text-muted-foreground mb-1 text-sm">Account</div>
							<h1 className="text-2xl">
								{session.user.name ?? 'Your account'}
							</h1>
						</div>
					</div>
					<div className="grid gap-4 text-sm sm:grid-cols-2">
						<div>
							<p className="text-muted-foreground mb-1">Email</p>
							<p className="font-medium">{session.user.email}</p>
						</div>
						<div>
							<p className="text-muted-foreground mb-1">Role</p>
							<p className="font-medium capitalize">{role}</p>
						</div>
					</div>

					{/* Agent Details */}
					{!isConsumer && (
						<div className="border-border mt-6 border-t pt-6">
							<div className="grid gap-4 text-sm sm:grid-cols-2">
								<div>
									<p className="text-muted-foreground mb-1">
										<Award className="mr-1 inline h-3.5 w-3.5" />
										Experience
									</p>
									<p className="font-medium">
										{agentProfile.experience || 'Not set'}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1">
										<MapPin className="mr-1 inline h-3.5 w-3.5" />
										Zip Codes Served
									</p>
									<p className="font-medium">
										{agentProfile.zipCodes || 'Not set'}
									</p>
								</div>
							</div>
							<div className="mt-4">
								<p className="text-muted-foreground mb-2 text-sm">
									<FileText className="mr-1 inline h-3.5 w-3.5" />
									Services
								</p>
								<div className="flex flex-wrap gap-2">
									{agentProfile.services.length > 0 ? (
										agentProfile.services.map((s) => (
											<span key={s} className="border px-3 py-1 text-xs">
												{s}
											</span>
										))
									) : (
										<span className="text-muted-foreground text-xs">
											No services selected
										</span>
									)}
								</div>
							</div>
						</div>
					)}
				</Card>

				{/* Match Preferences Card */}
				<Card className="rounded-none border bg-transparent p-8 py-8 shadow-none ring-0">
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<SlidersHorizontal className="text-muted-foreground h-5 w-5" />
							<div>
								<div className="text-muted-foreground text-sm">
									Match Preferences
								</div>
								<p className="text-muted-foreground mt-1 text-sm">
									Category weights determine how matches are ranked
								</p>
							</div>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setActiveModal('weights')}
							className="text-muted-foreground hover:text-foreground gap-1"
						>
							<Pencil className="h-3.5 w-3.5" />
							Edit
						</Button>
					</div>

					<div className="space-y-4">
						{(isConsumer
							? categoryWeightOptions
							: agentCategoryWeightOptions
						).map((cat) => {
							const weight = weights[cat.id] ?? 3
							const Icon = cat.icon
							return (
								<div
									key={cat.id}
									className="flex items-center justify-between border-b border-dashed pb-4 last:border-0 last:pb-0"
								>
									<div className="flex items-center gap-3">
										<Icon className="h-5 w-5" />
										<div>
											<p className="text-sm font-medium">{cat.label}</p>
											<p className="text-muted-foreground text-xs">
												{cat.description}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<div className="bg-border h-1.5 w-24 overflow-hidden">
											<div
												className="bg-primary h-full"
												style={{
													width: `${(weight / 5) * 100}%`,
												}}
											/>
										</div>
										<span className="text-sm">{weight}</span>
									</div>
								</div>
							)
						})}
					</div>
				</Card>

				{/* Questionnaire Card */}
				<Card className="rounded-none border bg-transparent p-8 py-8 shadow-none ring-0">
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<ListChecks className="text-muted-foreground h-5 w-5" />
							<div>
								<div className="text-muted-foreground text-sm">
									Questionnaire
								</div>
								<p className="text-muted-foreground mt-1 text-sm">
									Review and update your responses
								</p>
							</div>
						</div>
					</div>

					<CollapsibleQuestionnaire
						questions={questions}
						answers={answers}
						onSave={handleAnswersUpdate}
					/>
				</Card>
			</div>

			{/* Edit Weights Modal */}
			{activeModal === 'weights' && (
				<EditWeightsModal
					weights={weights}
					isConsumer={isConsumer}
					onSave={handleWeightsUpdate}
					onClose={() => setActiveModal(null)}
				/>
			)}

			{/* Edit Agent Profile Modal */}
			{activeModal === 'agent-profile' && (
				<EditAgentProfileModal
					profile={agentProfile}
					onSave={handleAgentProfileUpdate}
					onClose={() => setActiveModal(null)}
				/>
			)}
		</div>
	)
}

/* ───────────────────────────────────────────────
	 Edit Weights Modal
	 ─────────────────────────────────────────────── */

function EditWeightsModal({
	weights,
	isConsumer,
	onSave,
	onClose,
}: {
	weights: CategoryWeights
	isConsumer: boolean
	onSave: (weights: CategoryWeights) => void
	onClose: () => void
}) {
	const [localWeights, setLocalWeights] = useState(weights)

	const handleSave = () => {
		onSave(localWeights)
		onClose()
	}

	return (
		<Modal onClose={onClose} title="Edit Match Preferences">
			<CategoryWeightSelector
				categories={
					isConsumer ? categoryWeightOptions : agentCategoryWeightOptions
				}
				weights={localWeights}
				onChange={(id, value) =>
					setLocalWeights((prev) => ({ ...prev, [id]: value }))
				}
			/>
			<div className="mt-8 flex items-center justify-end gap-3">
				<Button type="button" onClick={onClose} variant="secondary">
					Cancel
				</Button>
				<Button type="button" onClick={handleSave}>
					Save Changes
				</Button>
			</div>
		</Modal>
	)
}

/* ───────────────────────────────────────────────
	 Collapsible Questionnaire Editor
	 ─────────────────────────────────────────────── */

function CollapsibleQuestionnaire({
	questions,
	answers,
	onSave,
}: {
	questions: typeof buyerQuestionFlow.questions
	answers: QuestionnaireAnswers
	onSave: (answers: QuestionnaireAnswers) => Promise<boolean>
}) {
	const [openCategory, setOpenCategory] = useState<string | null>(null)
	const [openId, setOpenId] = useState<string | null>(null)
	const [localAnswers, setLocalAnswers] = useState(answers)
	const [pendingChange, setPendingChange] = useState<{
		questionId: string
		value: number | number[]
	} | null>(null)
	const [isConfirmingChange, setIsConfirmingChange] = useState(false)
	const [confirmError, setConfirmError] = useState<string | null>(null)

	const grouped = groupQuestionsByCategory(questions)
	useEffect(() => {
		setLocalAnswers(answers)
	}, [answers])

	const handleSelect = (qId: string, value: number | number[]) => {
		setPendingChange({ questionId: qId, value })
		setConfirmError(null)
	}

	const handleConfirmChange = async () => {
		if (!pendingChange) {
			return
		}

		setIsConfirmingChange(true)
		setConfirmError(null)

		const updated = {
			...localAnswers,
			[pendingChange.questionId]: pendingChange.value,
		}

		const didSave = await onSave(updated)

		if (didSave) {
			setLocalAnswers(updated)
			setPendingChange(null)
		} else {
			setConfirmError('Save failed. Please try again.')
		}

		setIsConfirmingChange(false)
	}

	return (
		<>
			<div className="space-y-6">
				{Object.entries(grouped).map(([category, qs]) => {
					const answeredQs = qs.filter((q) => localAnswers[q.id] !== undefined)
					if (answeredQs.length === 0) return null

					const isCategoryOpen = openCategory === category

					return (
						<Card
							key={category}
							className="border-border w-full gap-0 overflow-hidden rounded-lg border py-0 shadow-none ring-0"
						>
							<Button
								type="button"
								variant="ghost"
								onClick={() => {
									setOpenCategory(isCategoryOpen ? null : category)
									setOpenId(null)
								}}
								className="h-auto w-full justify-between rounded-none px-4 py-3 text-left text-sm"
							>
								<span>{category}</span>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground bg-secondary rounded-full px-2 py-0.5 text-xs font-normal">
										{answeredQs.length}
									</span>
									{isCategoryOpen ? (
										<ChevronUp className="text-muted-foreground h-4 w-4 shrink-0" />
									) : (
										<ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
									)}
								</div>
							</Button>

							{isCategoryOpen && (
								<div className="border-t px-4 py-3">
									{answeredQs.map((q) => {
										const isOpen = openId === q.id
										const currentValue = localAnswers[q.id]

										return (
											<div
												key={q.id}
												className="border-border w-full overflow-hidden border-b last:border-b-0"
											>
												<Button
													type="button"
													variant="ghost"
													onClick={() => setOpenId(isOpen ? null : q.id)}
													className="hover:bg-secondary/50 h-auto w-full justify-between rounded-none px-4 py-3 text-left whitespace-normal"
												>
													<div className="min-w-0 flex-1">
														<p className="text-muted-foreground text-xs">
															{q.prompt}
														</p>
														<p className="mt-0.5 text-sm font-medium">
															{getAnswerSummary(q, currentValue!)}
														</p>
													</div>
													{isOpen ? (
														<ChevronUp className="text-muted-foreground ml-2 h-4 w-4 shrink-0" />
													) : (
														<ChevronDown className="text-muted-foreground ml-2 h-4 w-4 shrink-0" />
													)}
												</Button>

												{isOpen && (
													<div className="bg-secondary/20 w-full border-t px-4 py-4">
														<div className="space-y-2">
															{q.options?.map((optLabel, optIdx) => {
																return (
																	<Button
																		key={optIdx}
																		type="button"
																		variant="ghost"
																		onClick={() => {
																			if (q.selection?.type === 'multiple') {
																				const arr = Array.isArray(currentValue)
																					? [...currentValue]
																					: []
																				if (arr.includes(optIdx)) {
																					arr.splice(arr.indexOf(optIdx), 1)
																				} else {
																					arr.push(optIdx)
																				}
																				handleSelect(q.id, arr)
																			} else {
																				handleSelect(q.id, optIdx)
																			}
																		}}
																		className="h-auto w-full justify-start rounded-none px-4 py-3 text-left text-sm whitespace-normal"
																	>
																		{optLabel}
																	</Button>
																)
															})}
														</div>
													</div>
												)}
											</div>
										)
									})}
								</div>
							)}
						</Card>
					)
				})}
			</div>

			{pendingChange && (
				<Modal
					onClose={() => {
						if (isConfirmingChange) {
							return
						}
						setPendingChange(null)
						setConfirmError(null)
					}}
					title="Apply answer change?"
					subtitle="This answer will update after save succeeds."
				>
					<div className="space-y-4">
						<p className="text-muted-foreground text-sm">
							Are you sure you want to apply this questionnaire change?
						</p>
						{confirmError && (
							<p className="text-destructive text-sm">{confirmError}</p>
						)}
					</div>
					<div className="mt-8 flex items-center justify-end gap-3">
						<Button
							type="button"
							onClick={() => {
								setPendingChange(null)
								setConfirmError(null)
							}}
							disabled={isConfirmingChange}
							variant="secondary"
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={() => void handleConfirmChange()}
							disabled={isConfirmingChange}
						>
							{isConfirmingChange ? 'Saving...' : 'Apply Change'}
						</Button>
					</div>
				</Modal>
			)}
		</>
	)
}

/* ───────────────────────────────────────────────
	 Edit Agent Profile Modal
	 ─────────────────────────────────────────────── */

function EditAgentProfileModal({
	profile,
	onSave,
	onClose,
}: {
	profile: {
		experience: string
		zipCodes: string
		services: string[]
	}
	onSave: (profile: {
		experience: string
		zipCodes: string
		services: string[]
	}) => void
	onClose: () => void
}) {
	const [formData, setFormData] = useState(profile)

	const toggleService = (service: string) => {
		setFormData((prev) => ({
			...prev,
			services: prev.services.includes(service)
				? prev.services.filter((s) => s !== service)
				: [...prev.services, service],
		}))
	}

	const handleSave = () => {
		onSave(formData)
		onClose()
	}

	return (
		<Modal onClose={onClose} title="Edit Agent Profile">
			<div className="space-y-8">
				<div className="space-y-3">
					<Label
						htmlFor="experience"
						className="flex items-center gap-2 text-sm font-medium"
					>
						<Award className="h-4 w-4" />
						Years of Experience
					</Label>
					<select
						id="experience"
						value={formData.experience}
						onChange={(e) =>
							setFormData((prev) => ({
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

				<div className="space-y-3">
					<Label
						htmlFor="zipCodes"
						className="flex items-center gap-2 text-sm font-medium"
					>
						<MapPin className="h-4 w-4" />
						Zip Codes Served
					</Label>
					<Input
						id="zipCodes"
						type="text"
						placeholder="e.g. 78701, 78702, 78703"
						value={formData.zipCodes}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								zipCodes: e.target.value,
							}))
						}
					/>
					<p className="text-muted-foreground text-xs">
						Separate multiple zip codes with commas
					</p>
				</div>

				<div className="hairline" />

				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm font-medium">
						<FileText className="h-4 w-4" />
						Services Offered
					</div>
					<div className="flex flex-wrap gap-2">
						{services.map((service) => {
							const isSelected = formData.services.includes(service)
							return (
								<Button
									key={service}
									type="button"
									onClick={() => toggleService(service)}
									variant={isSelected ? 'default' : 'outline'}
									size="sm"
								>
									{service}
								</Button>
							)
						})}
					</div>
				</div>
			</div>
			<div className="mt-8 flex items-center justify-end gap-3">
				<Button type="button" onClick={onClose} variant="secondary">
					Cancel
				</Button>
				<Button type="button" onClick={handleSave}>
					Save Changes
				</Button>
			</div>
		</Modal>
	)
}

/* ───────────────────────────────────────────────
	 Account Dropdown Menu
	 ─────────────────────────────────────────────── */

/* ───────────────────────────────────────────────
	 Reusable Modal Component
	 ─────────────────────────────────────────────── */

function Modal({
	children,
	onClose,
	title,
	subtitle,
	large = false,
}: {
	children: React.ReactNode
	onClose: () => void
	title: string
	subtitle?: string
	large?: boolean
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 backdrop-blur-sm">
			<Card
				className={`bg-card border-border relative w-full border shadow-2xl ${
					large ? 'max-w-3xl' : 'max-w-xl'
				}`}
			>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					onClick={onClose}
					className="text-muted-foreground hover:text-foreground absolute top-4 right-4"
					aria-label="Close"
				>
					<X className="h-5 w-5" />
				</Button>
				<div className="p-8">
					<div className="mb-6">
						<h2 className="text-xl">{title}</h2>
						{subtitle && (
							<p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
						)}
					</div>
					{children}
				</div>
			</Card>
		</div>
	)
}
