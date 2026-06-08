import { useNavigate } from '@tanstack/react-router'
import {
	ArrowLeft,
	ArrowRight,
	Briefcase,
	Check,
	Eye,
	HeartHandshake,
	ListChecks,
	MessageSquare,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { CoreQuestion } from '@/lib/questions'

type AnswerValue = number | number[] | string

type QuestionFlowProps = {
	roleLabel?: string
	accentClassName?: string
	accentTextClassName?: string
	accentTintClassName?: string
	accentHoverBorderClassName?: string
	questions: CoreQuestion[]
	completeTo: string
	completeLabel: string
	initialAnswers?: Record<string, AnswerValue>
	initialQuestionIndex?: number
	onAnswersChange?: (answers: Record<string, AnswerValue>) => void
	onComplete?: () => void
	headerInsideCard?: boolean
}

export function QuestionFlow({
	roleLabel,
	questions,
	completeTo,
	completeLabel,
	initialAnswers = {},
	initialQuestionIndex = 0,
	onAnswersChange,
	onComplete,
	headerInsideCard = false,
}: QuestionFlowProps) {
	const [currentQuestion, setCurrentQuestion] = useState(
		Math.min(Math.max(initialQuestionIndex, 0), questions.length - 1),
	)
	const [answers, setAnswers] =
		useState<Record<string, AnswerValue>>(initialAnswers)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [wasContinueVisible, setWasContinueVisible] = useState(false)
	const [poppedOption, setPoppedOption] = useState<number | null>(null)
	const [sparks, setSparks] = useState<
		{
			id: number
			x: number
			y: number
			color: string
			angle: number
			distance: number
		}[]
	>([])
	const sparkIdRef = useRef(0)
	const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const arrivalAnswersRef = useRef<Record<string, AnswerValue>>(initialAnswers)
	const answersRef = useRef(answers)
	answersRef.current = answers
	const navigate = useNavigate()

	useEffect(() => {
		arrivalAnswersRef.current = { ...answersRef.current }
	}, [currentQuestion])

	const question = questions[currentQuestion]!
	const answer = answers[question.id]

	const isMultipleChoice = question.selection?.type === 'multiple'
	const isOpenText = question.inputType === 'open-text'
	const requiredSelections = question.selection?.maxSelections ?? 1
	const selectedCount = Array.isArray(answer) ? answer.length : 0

	const canProceed = (() => {
		if (isOpenText) {
			return typeof answer === 'string' && answer.trim().length > 0
		}

		if (isMultipleChoice) {
			return selectedCount > 0
		}

		return typeof answer === 'number'
	})()

	const handleNext = () => {
		if (autoAdvanceTimer.current) {
			clearTimeout(autoAdvanceTimer.current)
			autoAdvanceTimer.current = null
		}

		if (currentQuestion < questions.length - 1) {
			setWasContinueVisible(canShowContinue)
			setIsTransitioning(true)
			if (transitionTimer.current) {
				clearTimeout(transitionTimer.current)
			}
			transitionTimer.current = setTimeout(() => {
				setCurrentQuestion((prev) => prev + 1)
				setIsTransitioning(false)
				setWasContinueVisible(false)
			}, 250)
		}
	}

	const handleComplete = () => {
		if (completeTimer.current) {
			clearTimeout(completeTimer.current)
		}

		setIsTransitioning(true)

		completeTimer.current = setTimeout(() => {
			onComplete?.()
			void navigate({ to: completeTo })
		}, 220)
	}

	const handleBack = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion((prev) => prev - 1)
		}
	}

	useEffect(() => {
		return () => {
			if (autoAdvanceTimer.current) {
				clearTimeout(autoAdvanceTimer.current)
			}
			if (transitionTimer.current) {
				clearTimeout(transitionTimer.current)
			}
			if (completeTimer.current) {
				clearTimeout(completeTimer.current)
			}
			if (popTimer.current) {
				clearTimeout(popTimer.current)
			}
		}
	}, [])

	const updateAnswers = (
		updater: (prev: Record<string, AnswerValue>) => Record<string, AnswerValue>,
	) => {
		setAnswers((prev) => {
			const next = updater(prev)
			onAnswersChange?.(next)
			return next
		})
	}

	const createSparks = (clientX: number, clientY: number) => {
		const colors = ['#2E4A6B', '#D4AF37', '#6B8FAE', '#C9A96E', '#8A9EAF']
		const count = 10
		const newSparks = Array.from({ length: count }, (_, i) => {
			const angle = (i / count) * Math.PI * 2
			const distance = 30 + Math.random() * 30
			return {
				id: ++sparkIdRef.current,
				x: clientX,
				y: clientY,
				color: colors[i % colors.length]!,
				angle,
				distance,
			}
		})
		setSparks((prev) => [...prev, ...newSparks])
		setTimeout(() => {
			setSparks((prev) =>
				prev.filter((s) => !newSparks.find((ns) => ns.id === s.id)),
			)
		}, 600)
	}

	const toggleOption = (
		optionIndex: number,
		clientX?: number,
		clientY?: number,
	) => {
		if (isTransitioning) return
		if (clientX !== undefined && clientY !== undefined) {
			createSparks(clientX, clientY)
		}

		if (!isMultipleChoice) {
			if (answer === optionIndex) {
				updateAnswers((prev) => {
					const next = { ...prev }
					delete next[question.id]
					return next
				})
				return
			}

			updateAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
			setPoppedOption(optionIndex)
			if (popTimer.current) {
				clearTimeout(popTimer.current)
			}
			popTimer.current = setTimeout(() => setPoppedOption(null), 220)

			if (currentQuestion === questions.length - 1) {
				handleComplete()
				return
			}

			if (currentQuestion < questions.length - 1) {
				if (autoAdvanceTimer.current) {
					clearTimeout(autoAdvanceTimer.current)
				}
				setWasContinueVisible(canShowContinue)
				setIsTransitioning(true)
				autoAdvanceTimer.current = setTimeout(() => {
					handleNext()
				}, 250)
			}
			return
		}

		const existing = Array.isArray(answer) ? answer : []
		const isSelected = existing.includes(optionIndex)

		if (isSelected) {
			const next = existing.filter((i) => i !== optionIndex)
			updateAnswers((prev) => {
				const updated = { ...prev }
				if (next.length > 0) {
					updated[question.id] = next
				} else {
					delete updated[question.id]
				}
				return updated
			})
			return
		}

		const next = [...existing, optionIndex].slice(
			-(question.selection?.maxSelections ?? 1),
		)

		updateAnswers((prev) => ({ ...prev, [question.id]: next }))
		setPoppedOption(optionIndex)
		if (popTimer.current) {
			clearTimeout(popTimer.current)
		}
		popTimer.current = setTimeout(() => setPoppedOption(null), 220)

		if (
			currentQuestion < questions.length - 1 &&
			next.length === (question.selection?.maxSelections ?? 1)
		) {
			if (autoAdvanceTimer.current) {
				clearTimeout(autoAdvanceTimer.current)
			}
			setWasContinueVisible(canShowContinue)
			setIsTransitioning(true)
			autoAdvanceTimer.current = setTimeout(() => {
				handleNext()
			}, 250)
		}

		if (
			currentQuestion === questions.length - 1 &&
			next.length === (question.selection?.maxSelections ?? 1)
		) {
			handleComplete()
		}
		return
	}

	const isComplete = currentQuestion === questions.length - 1 && canProceed
	const isLastQuestion = currentQuestion === questions.length - 1
	const shouldShowFinalAction =
		isOpenText || arrivalAnswersRef.current[question.id] !== undefined
	const arrivalAnsweredQuestionCount = questions.filter(
		(candidate) => arrivalAnswersRef.current[candidate.id] !== undefined,
	).length
	const canShowContinue =
		!isLastQuestion &&
		(isMultipleChoice || currentQuestion < arrivalAnsweredQuestionCount)

	const showContinueButton =
		canShowContinue && (!isTransitioning || wasContinueVisible)

	const groupedQuestions = questions.reduce(
		(acc, q) => {
			const cat = q.category || q.categories?.[0] || 'Other'
			const existing = acc.find((g) => g.category === cat)
			if (existing) {
				existing.questions.push(q)
			} else {
				acc.push({ category: cat, questions: [q] })
			}
			return acc
		},
		[] as { category: string; questions: CoreQuestion[] }[],
	)

	const categoryMeta: Record<
		string,
		{
			icon: React.ComponentType<{ className?: string }>
			color: string
			bg: string
			ring: string
			label: string
		}
	> = {
		'Working Style': {
			icon: Briefcase,
			color: 'text-blue-500',
			bg: 'bg-blue-500',
			ring: 'ring-blue-500/30',
			label: 'Working Style',
		},
		Communication: {
			icon: MessageSquare,
			color: 'text-amber-500',
			bg: 'bg-amber-500',
			ring: 'ring-amber-500/30',
			label: 'Communication',
		},
		Transparency: {
			icon: Eye,
			color: 'text-emerald-500',
			bg: 'bg-emerald-500',
			ring: 'ring-emerald-500/30',
			label: 'Transparency',
		},
		Fit: {
			icon: HeartHandshake,
			color: 'text-rose-500',
			bg: 'bg-rose-500',
			ring: 'ring-rose-500/30',
			label: 'Fit',
		},
	}

	const answeredCount = questions.filter(
		(q) => answers[q.id] !== undefined,
	).length
	const progressPercent = Math.round((answeredCount / questions.length) * 100)
	const currentCategory =
		question.category || question.categories?.[0] || 'Other'

	return (
		<FlowPageShell
			title="Quiz"
			icon={ListChecks}
			roleLabel={roleLabel}
			headerInsideCard={headerInsideCard}
		>
			<div className="mb-6 w-full">
				<div className="mb-5 flex items-center justify-between text-xs">
					<div className="flex items-center gap-3">
						<span className="font-medium">
							Question {currentQuestion + 1} of {questions.length}
						</span>
						<span className="text-muted-foreground font-medium">
							{progressPercent}%
						</span>
						{isMultipleChoice ? (
							<span className="text-muted-foreground">
								{selectedCount} of {requiredSelections} selected
							</span>
						) : null}
					</div>
				</div>

				<div className="flex items-center justify-center">
					<div className="flex items-center gap-3 sm:gap-5">
						{groupedQuestions.map((group, groupIndex) => {
							const meta = categoryMeta[group.category] ?? {
								icon: Check,
								color: 'text-muted-foreground',
								bg: 'bg-muted-foreground',
								ring: 'ring-muted-foreground/30',
								label: group.category,
							}
							const CategoryIcon = meta.icon
							const isCurrentCategory = group.category === currentCategory
							const isCompletedCategory = group.questions.every(
								(q) => answers[q.id] !== undefined,
							)
							const isFutureCategory =
								groupedQuestions.findIndex(
									(g) => g.category === currentCategory,
								) < groupIndex

							return (
								<div
									key={group.category}
									className="flex items-center gap-3 sm:gap-5"
								>
									<div className="flex flex-col items-center gap-2">
										<div
											className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 sm:h-12 sm:w-12 ${
												isCurrentCategory
													? `${meta.color} bg-background ring-2 ${meta.ring} scale-110 shadow-lg`
													: isCompletedCategory
														? `${meta.color} bg-background ring-1 ${meta.ring} opacity-80`
														: isFutureCategory
															? 'text-muted-foreground/40 bg-muted/30 ring-muted/20 ring-1'
															: `${meta.color} bg-background ring-1 ${meta.ring} opacity-60`
											} ${isCurrentCategory ? 'animate-category-pulse' : ''}`}
										>
											<CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5" />
											{isCompletedCategory && !isCurrentCategory ? (
												<div
													className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ${meta.bg} text-white shadow-sm`}
												>
													<Check className="h-2.5 w-2.5" />
												</div>
											) : null}
										</div>
										<span
											className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 sm:text-xs ${
												isCurrentCategory
													? 'text-foreground'
													: isCompletedCategory
														? meta.color
														: 'text-muted-foreground/40'
											}`}
										>
											{meta.label}
										</span>

										<div className="flex items-center gap-1.5 pt-1">
											{group.questions.map((q) => {
												const isAnswered = answers[q.id] !== undefined
												const isCurrentQuestion =
													questions[currentQuestion]?.id === q.id
												return (
													<div
														key={q.id}
														className={`rounded-full transition-all duration-500 ${
															isCurrentQuestion
																? `h-2.5 w-2.5 ${meta.bg} shadow-md`
																: isCurrentCategory && isAnswered
																	? `h-2 w-2 ${meta.bg} opacity-60`
																	: isAnswered
																		? 'bg-muted-foreground/30 h-2 w-2'
																		: 'bg-muted-foreground/10 h-2 w-2'
														} ${
															isCurrentQuestion && !isAnswered
																? 'animate-light-pulse ring-2 ring-offset-1 ' +
																	meta.ring
																: ''
														} ${
															isCurrentQuestion && isAnswered
																? 'animate-light-pop'
																: ''
														}`}
													/>
												)
											})}
										</div>
									</div>

									{groupIndex < groupedQuestions.length - 1 ? (
										<div
											className={`h-px w-6 transition-colors duration-500 sm:w-10 ${
												isCompletedCategory && !isFutureCategory
													? meta.bg
													: 'bg-muted-foreground/15'
											}`}
										/>
									) : null}
								</div>
							)
						})}
					</div>
				</div>

				<div
					className={`mt-4 flex items-center ${currentQuestion > 0 ? 'justify-between' : 'justify-end'}`}
				>
					{currentQuestion > 0 && (
						<Button type="button" onClick={handleBack} variant="ghost">
							<ArrowLeft className="h-4 w-4" />
							Previous Question
						</Button>
					)}

					{isLastQuestion ? (
						shouldShowFinalAction ? (
							isComplete ? (
								<Button
									type="button"
									onClick={handleComplete}
									disabled={isTransitioning}
								>
									{completeLabel}
									<ArrowRight className="h-4 w-4" />
								</Button>
							) : isMultipleChoice || isOpenText ? (
								<Button type="button" disabled>
									{completeLabel}
									<ArrowRight className="h-4 w-4" />
								</Button>
							) : null
						) : null
					) : showContinueButton ? (
						<Button
							type="button"
							onClick={handleNext}
							disabled={!canProceed || isTransitioning}
						>
							Continue
							<ArrowRight className="h-4 w-4" />
						</Button>
					) : null}
				</div>
			</div>

			<div>
				<h2 className="mb-2 text-xl">{question.prompt}</h2>
				{isMultipleChoice ? (
					<p className="text-muted-foreground mb-3 text-sm">
						Select up to {requiredSelections} answers to continue.
					</p>
				) : null}
				{question.categoryNote ? (
					<p className="text-muted-foreground mb-8 text-sm">
						{question.categoryNote}
					</p>
				) : !isMultipleChoice ? (
					<div className="mb-8" />
				) : null}

				{isOpenText ? (
					<Textarea
						value={typeof answer === 'string' ? answer : ''}
						onChange={(e) =>
							updateAnswers((prev) => ({
								...prev,
								[question.id]: e.target.value,
							}))
						}
						placeholder="Share a few details"
						rows={6}
					/>
				) : (
					<div className="space-y-3">
						{question.options?.map((option, optionIndex) => {
							const isSelected = Array.isArray(answer)
								? answer.includes(optionIndex)
								: answer === optionIndex
							const isPopped = poppedOption === optionIndex
							return (
								<Button
									key={option}
									type="button"
									variant="outline"
									onClick={(e) =>
										toggleOption(optionIndex, e.clientX, e.clientY)
									}
									disabled={isTransitioning}
									className="group h-auto w-full justify-start gap-4 rounded-lg p-4 text-left whitespace-normal transition-transform duration-200 ease-out"
								>
									<div
										className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-all duration-200 ease-out ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'} ${isPopped ? 'scale-125' : ''}`}
									>
										<Check
											className={`h-3.5 w-3.5 transition-all duration-200 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
										/>
									</div>
									<span className="text-foreground text-sm leading-relaxed">
										{option}
									</span>
								</Button>
							)
						})}
					</div>
				)}
			</div>
			{sparks.map((spark) => (
				<div
					key={spark.id}
					className="pointer-events-none fixed z-50 h-1.5 w-1.5 rounded-full"
					style={
						{
							left: spark.x,
							top: spark.y,
							backgroundColor: spark.color,
							'--spark-x': `${Math.cos(spark.angle) * spark.distance}px`,
							'--spark-y': `${Math.sin(spark.angle) * spark.distance}px`,
							animation: 'spark-burst 0.5s ease-out forwards',
						} as React.CSSProperties
					}
				/>
			))}
		</FlowPageShell>
	)
}
