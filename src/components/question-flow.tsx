import { useNavigate } from '@tanstack/react-router'
import {
	ArrowLeft,
	ArrowRight,
	Globe,
	ListChecks,
	Lock,
	Mail,
	MessageSquare,
	Phone,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { useQuizKeyboard } from '@/hooks/use-quiz-keyboard'
import { useSwipe } from '@/hooks/use-swipe'
import { cn } from '@/lib/utils'
import type { CoreQuestion, QuestionInputType } from '@/lib/matching/questions'

type AnswerValue = number | number[] | string | undefined
const SKIPPED_ANSWER = '__skipped__'
type QuestionFlowMode = 'grouped' | 'single-question'
type QuestionFlowProgressState = {
	currentIndex: number
	total: number
}

type QuestionFlowProps = {
	roleLabel?: string
	questions: CoreQuestion[]
	completeTo: string
	completeLabel: string
	initialAnswers?: Record<string, AnswerValue | number | number[] | string>
	initialQuestionIndex?: number
	onAnswersChange?: (
		answers: Record<string, AnswerValue | number | number[] | string>,
	) => void
	onComplete?: () => void
	headerInsideCard?: boolean
	titleVisibility?: 'visible' | 'sr-only'
	progress?: ReactNode | ((state: QuestionFlowProgressState) => ReactNode)
	mode?: QuestionFlowMode
	title?: string
	subtitle?: string
	wrapper?: 'default' | 'wizard'
}

type QuestionGroup = {
	category: string
	questions: CoreQuestion[]
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
	titleVisibility = 'visible',
	progress,
	mode = 'grouped',
	title = 'Quiz',
	subtitle,
	wrapper = 'default',
}: QuestionFlowProps) {
	const isSingleQuestionMode = mode === 'single-question'
	const groupedQuestions = useMemo(() => {
		const groups: QuestionGroup[] = []
		for (const q of questions) {
			const cat = q.category || q.categories?.[0] || 'Other'
			const existing = groups.find((g) => g.category === cat)
			if (existing) {
				existing.questions.push(q)
			} else {
				groups.push({ category: cat, questions: [q] })
			}
		}
		return groups
	}, [questions])

	const initialGroupIndex = useMemo(() => {
		if (initialQuestionIndex <= 0) return 0
		let count = 0
		for (let i = 0; i < groupedQuestions.length; i++) {
			count += groupedQuestions[i]!.questions.length
			if (count > initialQuestionIndex) return i
		}
		return groupedQuestions.length - 1
	}, [groupedQuestions, initialQuestionIndex])

	const [currentGroupIndex, setCurrentGroupIndex] = useState(
		isSingleQuestionMode ? initialQuestionIndex : initialGroupIndex,
	)
	const [answers, setAnswers] =
		useState<Record<string, AnswerValue | number | number[] | string>>(
			initialAnswers,
		)
	const [isTransitioning, setIsTransitioning] = useState(false)
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
	const [direction, setDirection] = useState(1)
	const sparkIdRef = useRef(0)
	const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const topRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()

	const currentGroup =
		groupedQuestions[currentGroupIndex] ?? groupedQuestions[0]!
	const currentQuestion = questions[currentGroupIndex] ?? questions[0]!
	const currentQuestions = isSingleQuestionMode
		? [currentQuestion]
		: currentGroup.questions
	const currentCategory = isSingleQuestionMode
		? (currentQuestion.category ?? currentQuestion.categories?.[0] ?? 'Other')
		: currentGroup.category
	const totalSteps = isSingleQuestionMode
		? questions.length
		: groupedQuestions.length
	const currentStepIndex = Math.min(currentGroupIndex, totalSteps - 1)
	const updateAnswers = useCallback(
		(
			updater: (
				prev: Record<string, AnswerValue | number | number[] | string>,
			) => Record<string, AnswerValue | number | number[] | string>,
		) => {
			setAnswers((prev) => {
				const next = updater(prev)
				onAnswersChange?.(next)
				return next
			})
		},
		[onAnswersChange],
	)

	const allGroupAnswered = currentQuestions.every(
		(q) => answers[q.id] !== undefined,
	)
	const isLastGroup = currentStepIndex === totalSteps - 1
	const canAdvance = allGroupAnswered

	const handleNext = () => {
		if (autoAdvanceTimer.current) {
			clearTimeout(autoAdvanceTimer.current)
			autoAdvanceTimer.current = null
		}

		if (currentStepIndex < totalSteps - 1) {
			setDirection(1)
			setIsTransitioning(true)
			if (transitionTimer.current) {
				clearTimeout(transitionTimer.current)
			}
			transitionTimer.current = setTimeout(() => {
				setCurrentGroupIndex((prev) => prev + 1)
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
		if (currentStepIndex > 0) {
			setDirection(-1)
			setCurrentGroupIndex((prev) => prev - 1)
		}
	}

	const advanceAfterAnswer = () => {
		if (isLastGroup) {
			handleComplete()
			return
		}

		if (currentStepIndex < totalSteps - 1) {
			if (autoAdvanceTimer.current) {
				clearTimeout(autoAdvanceTimer.current)
			}
			autoAdvanceTimer.current = setTimeout(() => {
				handleNext()
			}, 120)
		}
	}

	const handleSkipQuestion = (questionId: string) => {
		if (isTransitioning) return
		updateAnswers((prev) => ({ ...prev, [questionId]: SKIPPED_ANSWER }))
		advanceAfterAnswer()
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
				prev.filter((spark) => !newSparks.some((next) => next.id === spark.id)),
			)
		}, 600)
	}, [])

	const getInputType = useCallback((q: CoreQuestion): QuestionInputType => {
		if (q.inputType === 'open-text') return 'open-text'
		if (q.inputType === 'slider') return 'slider'
		if (q.inputType === 'segmented') return 'segmented'
		if (q.selection?.type === 'multiple') return 'multi-select'
		if (q.inputType === 'single-select' || !q.inputType) return 'single-select'
		return q.inputType
	}, [])

	const renderQuestionInput = (q: CoreQuestion) => {
		const answer = answers[q.id]
		const inputType = getInputType(q)

		if (inputType === 'open-text') {
			return (
				<Textarea
					value={typeof answer === 'string' ? answer : ''}
					onChange={(e) =>
						updateAnswers((prev) => ({
							...prev,
							[q.id]: e.target.value,
						}))
					}
					placeholder="Share a few details"
					rows={4}
				/>
			)
		}

		if (inputType === 'slider') {
			const options = q.options ?? []
			const currentIndex =
				typeof answer === 'number' ? answer : Math.floor(options.length / 2)
			const currentLabel = options[currentIndex]
			return (
				<div className="space-y-2.5">
					{currentLabel ? (
						<div className="text-foreground text-center text-sm font-semibold">
							{currentLabel}
						</div>
					) : null}
					<Slider
						value={[currentIndex]}
						min={0}
						max={Math.max(options.length - 1, 0)}
						step={1}
						onValueChange={([value]) => {
							updateAnswers((prev) => ({
								...prev,
								[q.id]: value ?? 0,
							}))
						}}
						disabled={isTransitioning}
					/>
					<div className="text-muted-foreground flex justify-between text-[10px]">
						<span>{options[0]}</span>
						<span>{options.at(-1)}</span>
					</div>
				</div>
			)
		}

		const getOptionIcon = useCallback((q: CoreQuestion, option: string) => {
			const prompt = q.prompt.toLowerCase()
			const text = option.toLowerCase()
			if (text.startsWith('text')) return MessageSquare
			if (text.startsWith('call')) return Phone
			if (text.startsWith('email')) return Mail
			if (prompt.includes('documents') && text.startsWith('scheduled'))
				return Phone
			if (prompt.includes('representation') && text.includes('access'))
				return Globe
			if (prompt.includes('representation') && text.includes('exclusive'))
				return Lock
			return null
		}, [])

		const getInvolvementLevel = useCallback((option: string) => {
			const text = option.toLowerCase()
			if (text.includes('very involved')) return 3
			if (text.includes('key details') || text.includes('details only'))
				return 2
			if (text.includes('hands off')) return 1
			return 1
		}, [])

		const options = q.options ?? []
		const isMultiSelect = inputType === 'multi-select'
		const selected = Array.isArray(answer) ? answer : []
		const maxSelections = q.selection?.maxSelections
		const isInvolvementQuestion = q.prompt.toLowerCase().includes('involvement')
		const renderOptionText = (option: string) => {
			const separator = option.indexOf(' - ')
			if (separator === -1) return option

			return (
				<>
					<span>{option.slice(0, separator)}</span>
					<span className="text-muted-foreground font-normal">
						{' '}
						- {option.slice(separator + 3)}
					</span>
				</>
			)
		}

		return (
			<div className="space-y-3">
				{options.map((option, optionIndex) => {
					const isSelected = isMultiSelect
						? selected.includes(optionIndex)
						: answer === optionIndex
					const isPopped = poppedOption === optionIndex
					const atLimit =
						isMultiSelect &&
						!isSelected &&
						maxSelections !== undefined &&
						selected.length >= maxSelections
					const OptionIcon = getOptionIcon(q, option)
					const involvementLevel = isInvolvementQuestion
						? getInvolvementLevel(option)
						: null

					return (
						<motion.div
							key={option}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								delay: optionIndex * 0.04,
								type: 'spring',
								stiffness: 500,
								damping: 25,
							}}
						>
							<Button
								type="button"
								variant="outline"
								onClick={(event) =>
									toggleOption(q.id, optionIndex, event.clientX, event.clientY)
								}
								disabled={atLimit || isTransitioning}
								className={cn(
									'group h-auto w-full justify-start gap-4 rounded-xl border p-5 text-left whitespace-normal transition-all duration-150 ease-out',
									isSelected
										? 'border-primary/60 bg-primary/[0.06] text-foreground shadow-sm'
										: 'border-border bg-card hover:border-primary/50 hover:shadow-sm',
									atLimit && 'opacity-50',
								)}
							>
								<motion.div
									animate={isPopped ? { scale: 1.2 } : { scale: 1 }}
									transition={{
										type: 'spring',
										stiffness: 600,
										damping: 12,
									}}
									className={cn(
										'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-150',
										isSelected
											? 'border-primary/30 bg-primary/10 text-primary'
											: 'border-muted-foreground/20 bg-muted/30 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary',
									)}
								>
									{involvementLevel ? (
										<span className="flex items-end justify-center gap-0.5 pb-1.5">
											{[1, 2, 3].map((bar) => (
												<span
													key={bar}
													className={cn(
														'w-1 rounded-full',
														bar === 1 && 'h-2',
														bar === 2 && 'h-3.5',
														bar === 3 && 'h-5',
														bar <= involvementLevel
															? 'bg-current'
															: 'bg-current/25',
													)}
												/>
											))}
										</span>
									) : OptionIcon ? (
										<OptionIcon className="h-5 w-5" />
									) : (
										<span
											className={cn(
												'h-3 w-3 rounded-full bg-primary transition-all duration-150',
												isSelected
													? 'scale-100 opacity-100'
													: 'scale-0 opacity-0',
											)}
										/>
									)}
								</motion.div>
								<span className="text-base leading-snug font-medium">
									{renderOptionText(option)}
								</span>
							</Button>
						</motion.div>
					)
				})}
			</div>
		)
	}

	const toggleOption = (
		questionId: string,
		optionIndex: number,
		clientX?: number,
		clientY?: number,
	) => {
		if (isTransitioning) return
		if (clientX !== undefined && clientY !== undefined) {
			createSparks(clientX, clientY)
		}

		const targetQuestion = isSingleQuestionMode
			? questions.find((q) => q.id === questionId)
			: currentGroup.questions.find((q) => q.id === questionId)
		if (!targetQuestion) return

		const isMultipleChoice = targetQuestion.selection?.type === 'multiple'
		const currentAnswer = answers[questionId]

		if (!isMultipleChoice) {
			if (currentAnswer === optionIndex) {
				updateAnswers((prev) => {
					const next = { ...prev }
					delete next[questionId]
					return next
				})
				return
			}

			updateAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
			setPoppedOption(optionIndex)
			if (popTimer.current) {
				clearTimeout(popTimer.current)
			}
			popTimer.current = setTimeout(() => setPoppedOption(null), 100)
			advanceAfterAnswer()
			return
		}

		const existing = Array.isArray(currentAnswer) ? currentAnswer : []
		const isSelected = existing.includes(optionIndex)

		if (isSelected) {
			const next = existing.filter((i) => i !== optionIndex)
			updateAnswers((prev) => {
				const updated = { ...prev }
				if (next.length > 0) {
					updated[questionId] = next
				} else {
					delete updated[questionId]
				}
				return updated
			})
			return
		}

		const next = [...existing, optionIndex].slice(
			-(targetQuestion.selection?.maxSelections ?? 1),
		)
		updateAnswers((prev) => ({ ...prev, [questionId]: next }))
		setPoppedOption(optionIndex)
		if (popTimer.current) {
			clearTimeout(popTimer.current)
		}
		popTimer.current = setTimeout(() => setPoppedOption(null), 100)

		const requiredSelections = targetQuestion.selection?.maxSelections ?? 1
		if (next.length === requiredSelections) {
			advanceAfterAnswer()
		}
	}

	useQuizKeyboard({
		onNext: () => {
			if (canAdvance) {
				if (isLastGroup) handleComplete()
				else handleNext()
			}
		},
		onPrev: handleBack,
		onSelect: () => {},
		optionCount: 0,
		isEnabled: !isTransitioning,
	})

	useSwipe({
		onSwipeLeft: () => {
			if (canAdvance && !isLastGroup) handleNext()
		},
		onSwipeRight: handleBack,
		isEnabled: !isTransitioning,
	})

	const progressNode =
		typeof progress === 'function'
			? progress({ currentIndex: currentStepIndex, total: totalSteps })
			: progress

	const flowContent = (
		<>
			<div ref={topRef} className="scroll-mt-4" />
			<div className="mb-6 w-full">
				<div className="space-y-4">
					<div className="flex items-center justify-end gap-3">
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={handleBack}
								disabled={currentGroupIndex === 0 || isTransitioning}
								className="border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-25"
							>
								<ArrowLeft className="h-4 w-4" />
								<span className="sr-only">Previous section</span>
							</button>

							<button
								type="button"
								onClick={isLastGroup ? handleComplete : handleNext}
								disabled={!canAdvance || isTransitioning}
								className="border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-25"
							>
								<ArrowRight className="h-4 w-4" />
								<span className="sr-only">Next section</span>
							</button>
						</div>
					</div>

					{isSingleQuestionMode ? null : (
						<div className="flex w-full gap-1.5">
							{groupedQuestions.map((group, index) => {
								const isCompleted = group.questions.every(
									(q) => answers[q.id] !== undefined,
								)
								const isCurrent = index === currentGroupIndex

								return (
									<div
										key={group.category}
										className={cn(
											'h-1.5 flex-1 rounded-full transition-colors duration-300',
											isCurrent
												? 'bg-primary'
												: isCompleted
													? 'bg-primary/40'
													: 'bg-muted-foreground/15',
										)}
									/>
								)
							})}
						</div>
					)}
				</div>
			</div>

			<AnimatePresence mode="wait" custom={direction}>
				<motion.div
					key={isSingleQuestionMode ? currentQuestion.id : currentCategory}
					custom={direction}
					initial={{ x: direction > 0 ? 60 : -60, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: direction > 0 ? -60 : 60, opacity: 0 }}
					transition={{ duration: 0.15, ease: 'easeOut' }}
					className="space-y-6"
				>
					{currentQuestions.map((q) => {
						const inputType = getInputType(q)
						const isMultipleChoice = inputType === 'multi-select'
						const requiredSelections = q.selection?.maxSelections ?? 1
						const isSkipped = answers[q.id] === SKIPPED_ANSWER

						return (
							<div key={q.id} className="space-y-5">
								<div>
									<h2 className="font-heading text-xl leading-snug font-semibold tracking-tight">
										{q.prompt}
									</h2>
									{q.subtitle ? (
										<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
											{q.subtitle}
										</p>
									) : null}
									{isMultipleChoice ? (
										<p className="text-muted-foreground mt-2 text-sm">
											Select up to {requiredSelections} answers to continue.
										</p>
									) : null}
								</div>

								{renderQuestionInput(q)}

								<div className="flex justify-center pt-1">
									<Button
										type="button"
										variant="secondary"
										onClick={() => handleSkipQuestion(q.id)}
										disabled={isTransitioning}
										className="min-w-28 rounded-xl text-sm font-semibold"
									>
										{isSkipped ? 'Skipped' : 'Skip'}
									</Button>
								</div>
							</div>
						)
					})}
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
						} as CSSProperties
					}
				/>
			))}
		</>
	)

	if (wrapper === 'wizard') {
		return flowContent
	}

	return (
		<FlowPageShell
			title={title}
			{...(subtitle ? { subtitle } : {})}
			icon={ListChecks}
			roleLabel={roleLabel}
			headerInsideCard={headerInsideCard}
			titleVisibility={titleVisibility}
			progress={progressNode}
		>
			{flowContent}
		</FlowPageShell>
	)
}
