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
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useQuizKeyboard } from '@/hooks/use-quiz-keyboard'
import { useSwipe } from '@/hooks/use-swipe'
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
	completeLabel: _completeLabel,
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
	const [poppedOption, setPoppedOption] = useState<number | null>(null)
	const [direction, setDirection] = useState(1)
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

	const handleNext = () => {
		if (autoAdvanceTimer.current) {
			clearTimeout(autoAdvanceTimer.current)
			autoAdvanceTimer.current = null
		}

		if (currentQuestion < questions.length - 1) {
			setDirection(1)
			setIsTransitioning(true)
			if (transitionTimer.current) {
				clearTimeout(transitionTimer.current)
			}
			transitionTimer.current = setTimeout(() => {
				setCurrentQuestion((prev) => prev + 1)
				setIsTransitioning(false)
			}, 120)
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
		}, 100)
	}

	const handleBack = () => {
		if (currentQuestion > 0) {
			setDirection(-1)
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

	const updateAnswers = useCallback(
		(
			updater: (
				prev: Record<string, AnswerValue>,
			) => Record<string, AnswerValue>,
		) => {
			setAnswers((prev) => {
				const next = updater(prev)
				onAnswersChange?.(next)
				return next
			})
		},
		[onAnswersChange],
	)

	const createSparks = useCallback((clientX: number, clientY: number) => {
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
	}, [])

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
			popTimer.current = setTimeout(() => setPoppedOption(null), 100)

			if (currentQuestion === questions.length - 1) {
				handleComplete()
				return
			}

			if (currentQuestion < questions.length - 1) {
				if (autoAdvanceTimer.current) {
					clearTimeout(autoAdvanceTimer.current)
				}
				setIsTransitioning(true)
				autoAdvanceTimer.current = setTimeout(() => {
					handleNext()
				}, 120)
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
		popTimer.current = setTimeout(() => setPoppedOption(null), 100)

		if (
			currentQuestion < questions.length - 1 &&
			next.length === (question.selection?.maxSelections ?? 1)
		) {
			if (autoAdvanceTimer.current) {
				clearTimeout(autoAdvanceTimer.current)
			}
			setIsTransitioning(true)
			autoAdvanceTimer.current = setTimeout(() => {
				handleNext()
			}, 120)
		}

		if (
			currentQuestion === questions.length - 1 &&
			next.length === (question.selection?.maxSelections ?? 1)
		) {
			handleComplete()
		}
		return
	}

	const isLastQuestion = currentQuestion === questions.length - 1
	const arrivalAnsweredQuestionCount = questions.filter(
		(candidate) => arrivalAnswersRef.current[candidate.id] !== undefined,
	).length
	const canShowContinue =
		!isLastQuestion &&
		(isMultipleChoice || currentQuestion < arrivalAnsweredQuestionCount)

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

	const currentCategory =
		question.category || question.categories?.[0] || 'Other'

	// Keyboard & swipe navigation
	useQuizKeyboard({
		onNext: handleNext,
		onPrev: handleBack,
		onSelect: (index) => {
			if (!isOpenText && question.options) {
				toggleOption(index)
			}
		},
		optionCount: question.options?.length ?? 0,
		isEnabled: !isTransitioning,
	})

	useSwipe({
		onSwipeLeft: handleNext,
		onSwipeRight: handleBack,
		isEnabled: !isTransitioning,
	})

	return (
		<FlowPageShell
			title="Quiz"
			icon={ListChecks}
			roleLabel={roleLabel}
			headerInsideCard={headerInsideCard}
		>
			{/* Category progress */}
			<div className="mb-6 w-full">
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
										<motion.div
											animate={
												isCurrentCategory ? { scale: 1.1 } : { scale: 1 }
											}
											transition={{
												type: 'spring',
												stiffness: 500,
												damping: 15,
											}}
											className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 sm:h-12 sm:w-12 ${
												isCurrentCategory
													? `${meta.color} bg-background ring-2 ${meta.ring} shadow-lg`
													: isCompletedCategory
														? `${meta.color} bg-background ring-1 ${meta.ring} opacity-50`
														: isFutureCategory
															? 'text-muted-foreground/40 bg-muted/30 ring-muted/20 ring-1'
															: `${meta.color} bg-background ring-1 ${meta.ring} opacity-70`
											}`}
										>
											<CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5" />
											{isCompletedCategory ? (
												<div
													className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ${meta.bg} text-white shadow-sm`}
												>
													<Check className="h-2.5 w-2.5" />
												</div>
											) : null}
										</motion.div>
										<span
											className={`text-[10px] font-semibold tracking-wide whitespace-nowrap transition-colors duration-200 sm:text-xs ${
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
														className={`rounded-full transition-all duration-200 ${
															isCurrentQuestion
																? `h-2.5 w-2.5 ${meta.bg} shadow-md`
																: isCurrentCategory && isAnswered
																	? `h-2 w-2 ${meta.bg} opacity-60`
																	: isAnswered
																		? `h-2 w-2 ${meta.bg} opacity-30`
																		: 'bg-muted-foreground/10 h-2 w-2'
														}`}
													/>
												)
											})}
										</div>
									</div>

									{groupIndex < groupedQuestions.length - 1 ? (
										<div
											className={`h-px w-6 transition-colors duration-200 sm:w-10 ${
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
			</div>

			{/* Step counter + Arrow navigation */}
			<div className="mb-4 flex items-center justify-end gap-4">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleBack}
						disabled={currentQuestion === 0 || isTransitioning}
						className="border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-25"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="sr-only">Previous question</span>
					</button>

					<span className="text-muted-foreground text-sm">
						{currentQuestion + 1} of {questions.length}
					</span>

					<button
						type="button"
						onClick={isLastQuestion ? handleComplete : handleNext}
						disabled={
							isTransitioning ||
							(!isLastQuestion && !canShowContinue) ||
							(isLastQuestion && answer === undefined)
						}
						className="border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-25"
					>
						<ArrowRight className="h-4 w-4" />
						<span className="sr-only">Next question</span>
					</button>
				</div>
			</div>

			{/* Question with directional slide */}
			<AnimatePresence mode="wait" custom={direction}>
				<motion.div
					key={currentQuestion}
					custom={direction}
					initial={{ x: direction > 0 ? 60 : -60, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: direction > 0 ? -60 : 60, opacity: 0 }}
					transition={{ duration: 0.15, ease: 'easeOut' }}
				>
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
									<motion.div
										key={option}
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											delay: optionIndex * 0.02,
											duration: 0.12,
										}}
									>
										<Button
											type="button"
											variant="outline"
											onClick={(e) =>
												toggleOption(optionIndex, e.clientX, e.clientY)
											}
											disabled={isTransitioning}
											className={`group h-auto w-full justify-start gap-4 rounded-lg p-4 text-left whitespace-normal transition-all duration-150 ease-out ${
												isSelected
													? 'border-primary bg-primary/5 ring-primary/20 shadow-sm ring-1'
													: 'hover:border-foreground/25 hover:bg-muted/30'
											}`}
										>
											<motion.div
												animate={isPopped ? { scale: 1.2 } : { scale: 1 }}
												transition={{
													type: 'spring',
													stiffness: 600,
													damping: 12,
												}}
												className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150 ${
													isSelected
														? 'border-primary bg-primary text-primary-foreground'
														: 'border-muted-foreground/30'
												}`}
											>
												<Check
													className={`h-3.5 w-3.5 transition-all duration-150 ${
														isSelected
															? 'scale-100 opacity-100'
															: 'scale-0 opacity-0'
													}`}
												/>
											</motion.div>
											<span
												className="text-foreground text-sm leading-relaxed"
												style={{ fontFeatureSettings: '"kern" 1' }}
											>
												{option}
											</span>
										</Button>
									</motion.div>
								)
							})}
						</div>
					)}
				</motion.div>
			</AnimatePresence>

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
