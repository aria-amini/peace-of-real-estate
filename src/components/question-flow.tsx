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
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useQuizKeyboard } from '@/hooks/use-quiz-keyboard'
import { useSwipe } from '@/hooks/use-swipe'
import {
	questionOptionEntries,
	type AnswerValue,
	type Question,
} from '@/lib/matching/questions'
import { cn } from '@/lib/utils'

type Answers = Record<string, AnswerValue>

const SKIPPED_ANSWER = '__skipped__'

type QuestionFlowMode = 'grouped' | 'single-question'

type QuestionFlowProgressState = {
	currentIndex: number
	total: number
}

type QuestionFlowProps = {
	roleLabel?: string
	questions: Question[]
	completeTo: string
	completeLabel: string
	answers: Answers
	currentQuestionIndex?: number
	onAnswersChange?: (answers: Answers) => void
	onComplete?: () => void
	onQuestionIndexChange?: (index: number) => void
	navigateOnComplete?: boolean
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
	questions: Question[]
}

type QuizUiState = {
	currentGroupIndex: number
	isTransitioning: boolean
	direction: number
	poppedOption: string | null
}

export function QuestionFlow({
	roleLabel,
	questions,
	completeTo,
	completeLabel: _completeLabel,
	answers,
	currentQuestionIndex: controlledIndex,
	onAnswersChange,
	onComplete,
	onQuestionIndexChange,
	navigateOnComplete = true,
	headerInsideCard = false,
	titleVisibility = 'visible',
	progress,
	mode = 'grouped',
	title = 'Quiz',
	subtitle,
	wrapper = 'default',
}: QuestionFlowProps) {
	const isSingleQuestionMode = mode === 'single-question'
	const groupedQuestions = questions.reduce<QuestionGroup[]>(
		(groups, question) => {
			const category = 'Questions'
			const existing = groups.find((group) => group.category === category)
			if (existing) {
				existing.questions.push(question)
			} else {
				groups.push({ category, questions: [question] })
			}
			return groups
		},
		[],
	)

	const initialGroupIndex = (() => {
		const initialQuestionIndex = controlledIndex ?? 0
		if (initialQuestionIndex <= 0) return 0
		let count = 0
		for (let i = 0; i < groupedQuestions.length; i++) {
			count += groupedQuestions[i]!.questions.length
			if (count > initialQuestionIndex) return i
		}
		return groupedQuestions.length - 1
	})()

	const [internalGroupIndex, setInternalGroupIndex] = useState(
		isSingleQuestionMode ? (controlledIndex ?? 0) : initialGroupIndex,
	)
	const currentGroupIndex = controlledIndex ?? internalGroupIndex
	const setCurrentGroupIndex = onQuestionIndexChange
		? (next: number | ((prev: number) => number)) =>
				onQuestionIndexChange(
					typeof next === 'function'
						? (next as (prev: number) => number)(currentGroupIndex)
						: next,
				)
		: setInternalGroupIndex

	const [ui, setUi] = useState<QuizUiState>({
		currentGroupIndex,
		isTransitioning: false,
		direction: 1,
		poppedOption: null,
	})

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
		? 'Questions'
		: currentGroup.category
	const totalSteps = isSingleQuestionMode
		? questions.length
		: groupedQuestions.length
	const currentStepIndex = Math.min(currentGroupIndex, totalSteps - 1)

	const updateAnswers = (updater: (prev: Answers) => Answers) => {
		const next = updater(answers)
		onAnswersChange?.(next)
	}

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
			setUi((prev) => ({ ...prev, direction: 1, isTransitioning: true }))
			if (transitionTimer.current) {
				clearTimeout(transitionTimer.current)
			}
			transitionTimer.current = setTimeout(() => {
				setCurrentGroupIndex((prev) => prev + 1)
				setUi((prev) => ({ ...prev, isTransitioning: false }))
			}, 120)
		}
	}

	const handleComplete = () => {
		if (completeTimer.current) {
			clearTimeout(completeTimer.current)
		}

		setUi((prev) => ({ ...prev, isTransitioning: true }))

		completeTimer.current = setTimeout(() => {
			onComplete?.()
			if (navigateOnComplete) {
				void navigate({ to: completeTo })
			}
		}, 100)
	}

	const handleBack = () => {
		if (currentStepIndex > 0) {
			setUi((prev) => ({ ...prev, direction: -1 }))
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
		if (ui.isTransitioning) return
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

	const renderQuestionInput = (q: Question) => {
		const answer = answers[q.id]

		if (q.freeForm) {
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

		const options = questionOptionEntries(q)
		if (options.length === 0) {
			return null
		}

		const getOptionIcon = (question: Question, label: string) => {
			const prompt = question.title.toLowerCase()
			const text = label.toLowerCase()
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
		}

		const getInvolvementLevel = (label: string) => {
			const text = label.toLowerCase()
			if (text.includes('very involved')) return 3
			if (text.includes('key details') || text.includes('details only'))
				return 2
			if (text.includes('hands off')) return 1
			return 1
		}

		const isMultiSelect = q.multiple === true
		const selected = Array.isArray(answer) ? answer : []
		const isInvolvementQuestion = q.title.toLowerCase().includes('involvement')

		const renderOptionText = (label: string) => {
			const separator = label.indexOf(' - ')
			if (separator === -1) return label

			return (
				<>
					<span>{label.slice(0, separator)}</span>
					<span className="text-muted-foreground font-normal">
						{' '}
						- {label.slice(separator + 3)}
					</span>
				</>
			)
		}

		return (
			<div className="space-y-3">
				{options.map(([slug, label], optionIndex) => {
					const isSelected = isMultiSelect
						? selected.includes(slug)
						: answer === slug
					const isPopped = ui.poppedOption === slug
					const atLimit = false
					const OptionIcon = getOptionIcon(q, label)
					const involvementLevel = isInvolvementQuestion
						? getInvolvementLevel(label)
						: null

					return (
						<motion.div
							key={slug}
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
								onClick={() => toggleOption(q.id, slug)}
								disabled={atLimit || ui.isTransitioning}
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
									{renderOptionText(label)}
								</span>
							</Button>
						</motion.div>
					)
				})}
			</div>
		)
	}

	const toggleOption = (questionId: string, slug: string) => {
		if (ui.isTransitioning) return

		const targetQuestion = isSingleQuestionMode
			? questions.find((q) => q.id === questionId)
			: currentGroup.questions.find((q) => q.id === questionId)
		if (!targetQuestion) return

		const isMultipleChoice = targetQuestion.multiple === true
		const currentAnswer = answers[questionId]

		if (!isMultipleChoice) {
			if (currentAnswer === slug) {
				updateAnswers((prev) => {
					const next = { ...prev }
					delete next[questionId]
					return next
				})
				return
			}

			updateAnswers((prev) => ({ ...prev, [questionId]: slug }))
			setUi((prev) => ({ ...prev, poppedOption: slug }))
			if (popTimer.current) {
				clearTimeout(popTimer.current)
			}
			popTimer.current = setTimeout(() => {
				setUi((prev) => ({ ...prev, poppedOption: null }))
			}, 100)
			advanceAfterAnswer()
			return
		}

		const existing = Array.isArray(currentAnswer) ? currentAnswer : []
		const isSelected = existing.includes(slug)

		if (isSelected) {
			const next = existing.filter((s) => s !== slug)
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

		const next = [...existing, slug]
		updateAnswers((prev) => ({ ...prev, [questionId]: next }))
		setUi((prev) => ({ ...prev, poppedOption: slug }))
		if (popTimer.current) {
			clearTimeout(popTimer.current)
		}
		popTimer.current = setTimeout(() => {
			setUi((prev) => ({ ...prev, poppedOption: null }))
		}, 100)
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
		isEnabled: !ui.isTransitioning,
	})

	useSwipe({
		onSwipeLeft: () => {
			if (canAdvance && !isLastGroup) handleNext()
		},
		onSwipeRight: handleBack,
		isEnabled: !ui.isTransitioning,
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
								disabled={currentGroupIndex === 0 || ui.isTransitioning}
								className="border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-25"
							>
								<ArrowLeft className="h-4 w-4" />
								<span className="sr-only">Previous section</span>
							</button>

							<button
								type="button"
								onClick={isLastGroup ? handleComplete : handleNext}
								disabled={!canAdvance || ui.isTransitioning}
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
								const isActive = index === currentStepIndex
								return (
									<button
										key={group.category + index}
										type="button"
										onClick={() => {
											if (index < currentStepIndex || isCompleted) {
												setUi((prev) => ({
													...prev,
													direction: index < currentStepIndex ? -1 : 1,
												}))
												setCurrentGroupIndex(index)
											}
										}}
										disabled={index > currentStepIndex && !isCompleted}
										className={cn(
											'h-1.5 flex-1 rounded-full transition-colors',
											isCompleted || isActive ? 'bg-primary' : 'bg-muted',
										)}
										aria-label={`${group.category} ${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}`}
									/>
								)
							})}
						</div>
					)}

					<div className="space-y-2">
						<h3
							className={cn(
								'text-xl font-semibold tracking-tight',
								titleVisibility === 'sr-only' && 'sr-only',
							)}
						>
							{isSingleQuestionMode
								? questions[currentGroupIndex]?.title
								: currentCategory}
						</h3>
						{isSingleQuestionMode ? null : (
							<p className="text-muted-foreground text-sm">
								Answer a few questions to help us understand your
								{roleLabel ? ` ${roleLabel} ` : ' '}
								preferences.
							</p>
						)}
					</div>

					<AnimatePresence mode="wait" custom={ui.direction}>
						<motion.div
							key={currentGroupIndex}
							custom={ui.direction}
							initial={{ opacity: 0, x: ui.direction * 24 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: ui.direction * -24 }}
							transition={{
								duration: 0.2,
								ease: 'easeInOut',
							}}
							className="space-y-5"
						>
							{currentQuestions.map((q) => (
								<div key={q.id} className="space-y-3">
									<p className="font-medium">{q.title}</p>
									{renderQuestionInput(q)}
									{q.allowSkip && (
										<button
											type="button"
											onClick={() => handleSkipQuestion(q.id)}
											className="text-muted-foreground hover:text-foreground text-xs underline"
										>
											Skip
										</button>
									)}
								</div>
							))}
						</motion.div>
					</AnimatePresence>

					<div className="relative h-6" />
				</div>
			</div>
		</>
	)

	return (
		<>
			{wrapper === 'wizard' ? (
				flowContent
			) : (
				<FlowPageShell
					title={title}
					subtitle={subtitle}
					icon={ListChecks}
					headerInsideCard={headerInsideCard}
					progress={progressNode}
				>
					{flowContent}
				</FlowPageShell>
			)}
		</>
	)
}
