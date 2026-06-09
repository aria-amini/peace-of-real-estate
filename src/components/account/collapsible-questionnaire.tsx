import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	getAnswerSummary,
	groupQuestionsByCategory,
	type QuestionnaireAnswers,
} from '@/lib/user-settings'
import type { CoreQuestion } from '@/lib/questions'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Modal } from './modal'

export function CollapsibleQuestionnaire({
	questions,
	answers,
	onSave,
}: {
	questions: CoreQuestion[]
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
