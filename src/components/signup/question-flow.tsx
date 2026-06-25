import {
	ArrowLeft,
	ArrowRight,
	Globe,
	Lock,
	Mail,
	MessageSquare,
	Phone,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { SelectionCard } from '@/components/signup/selection-card'
import { Textarea } from '@/components/ui/textarea'
import {
	questionOptionEntries,
	type AnswerValue,
	type Question,
} from '@/components/signup/questions'
import { cn } from '@/lib/utils/ui'

type Answers = Record<string, AnswerValue>

type ConsumerQuestionFlowProps = {
	questions: Question[]
	answers: Answers
	currentQuestionIndex: number
	onAnswersChange: (answers: Answers) => void
	onQuestionIndexChange: (index: number) => void
	onComplete: () => void
}

export function ConsumerQuestionFlow({
	questions,
	answers,
	currentQuestionIndex,
	onAnswersChange,
	onQuestionIndexChange,
	onComplete,
}: ConsumerQuestionFlowProps) {
	const [direction, setDirection] = useState(1)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [poppedOption, setPoppedOption] = useState<string | null>(null)
	const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const topRef = useRef<HTMLDivElement>(null)

	const currentQuestion = questions[currentQuestionIndex] ?? questions[0]
	const totalSteps = questions.length
	const currentStepIndex = Math.min(currentQuestionIndex, totalSteps - 1)
	const isLastQuestion = currentStepIndex === totalSteps - 1
	const isFirstQuestion = currentStepIndex === 0
	const currentAnswer = currentQuestion
		? answers[currentQuestion.id]
		: undefined
	const canAdvance = currentAnswer !== undefined && currentAnswer !== null

	useEffect(() => {
		return () => {
			;[autoAdvanceTimer, transitionTimer, completeTimer, popTimer].forEach(
				(ref) => {
					if (ref.current) {
						clearTimeout(ref.current)
						ref.current = null
					}
				},
			)
		}
	}, [])

	const updateAnswers = (updater: (prev: Answers) => Answers) => {
		const next = updater(answers)
		onAnswersChange(next)
	}

	const advance = () => {
		if (currentStepIndex < totalSteps - 1) {
			setDirection(1)
			setIsTransitioning(true)
			if (transitionTimer.current) clearTimeout(transitionTimer.current)
			transitionTimer.current = setTimeout(() => {
				onQuestionIndexChange(currentStepIndex + 1)
				setIsTransitioning(false)
			}, 120)
		}
	}

	const goBack = () => {
		if (currentStepIndex > 0) {
			setDirection(-1)
			onQuestionIndexChange(currentStepIndex - 1)
		}
	}

	const complete = () => {
		setIsTransitioning(true)
		if (completeTimer.current) clearTimeout(completeTimer.current)
		completeTimer.current = setTimeout(() => {
			onComplete()
		}, 100)
	}

	const advanceAfterAnswer = () => {
		if (autoAdvanceTimer.current) {
			clearTimeout(autoAdvanceTimer.current)
		}
		autoAdvanceTimer.current = setTimeout(() => {
			if (isLastQuestion) {
				complete()
			} else {
				advance()
			}
		}, 120)
	}

	const toggleOption = (questionId: string, slug: string) => {
		if (isTransitioning) return

		const question = questions.find((q) => q.id === questionId)
		if (!question) return

		const isMultipleChoice = question.multiple === true
		const previousAnswer = answers[questionId]

		if (!isMultipleChoice) {
			if (previousAnswer === slug) {
				updateAnswers((prev) => {
					const next = { ...prev }
					delete next[questionId]
					return next
				})
				return
			}

			updateAnswers((prev) => ({ ...prev, [questionId]: slug }))
			setPoppedOption(slug)
			if (popTimer.current) clearTimeout(popTimer.current)
			popTimer.current = setTimeout(() => setPoppedOption(null), 100)
			advanceAfterAnswer()
			return
		}

		const existing = Array.isArray(previousAnswer) ? previousAnswer : []
		const isSelected = existing.includes(slug)
		const next = isSelected
			? existing.filter((s) => s !== slug)
			: [...existing, slug]

		updateAnswers((prev) => {
			const updated = { ...prev }
			if (next.length > 0) {
				updated[questionId] = next
			} else {
				delete updated[questionId]
			}
			return updated
		})
	}

	if (!currentQuestion) return null

	return (
		<div className="space-y-6">
			<div ref={topRef} className="scroll-mt-4" />

			<div className="flex items-center justify-end gap-3">
				<button
					type="button"
					onClick={goBack}
					disabled={isFirstQuestion || isTransitioning}
					className="border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-25"
				>
					<ArrowLeft className="h-4 w-4" />
					<span className="sr-only">Previous question</span>
				</button>

				<button
					type="button"
					onClick={isLastQuestion ? complete : advance}
					disabled={!canAdvance || isTransitioning}
					className="border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-25"
				>
					<ArrowRight className="h-4 w-4" />
					<span className="sr-only">
						{isLastQuestion ? 'Finish' : 'Next question'}
					</span>
				</button>
			</div>

			<AnimatePresence mode="wait" custom={direction}>
				<motion.div
					key={currentStepIndex}
					custom={direction}
					initial={{ opacity: 0, x: direction * 24 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: direction * -24 }}
					transition={{ duration: 0.2, ease: 'easeInOut' }}
					className="min-h-[280px] space-y-4"
				>
					<p className="font-medium">{currentQuestion.title}</p>
					<QuestionInput
						question={currentQuestion}
						answer={currentAnswer}
						poppedOption={poppedOption}
						disabled={isTransitioning}
						onToggle={(slug) => toggleOption(currentQuestion.id, slug)}
						onFreeFormChange={(value) =>
							updateAnswers((prev) => ({
								...prev,
								[currentQuestion.id]: value,
							}))
						}
					/>
					{currentQuestion.allowSkip ? (
						<button
							type="button"
							onClick={() =>
								updateAnswers((prev) => ({
									...prev,
									[currentQuestion.id]: null,
								}))
							}
							className="text-muted-foreground hover:text-foreground text-xs underline"
						>
							Skip
						</button>
					) : null}
				</motion.div>
			</AnimatePresence>
		</div>
	)
}

function QuestionInput({
	question,
	answer,
	poppedOption,
	disabled,
	onToggle,
	onFreeFormChange,
}: {
	question: Question
	answer: AnswerValue | undefined
	poppedOption: string | null
	disabled: boolean
	onToggle: (slug: string) => void
	onFreeFormChange: (value: string) => void
}) {
	if (question.freeForm) {
		return (
			<Textarea
				value={typeof answer === 'string' ? answer : ''}
				onChange={(event) => onFreeFormChange(event.target.value)}
				placeholder="Share a few details"
				rows={4}
			/>
		)
	}

	const options = questionOptionEntries(question)
	if (options.length === 0) return null

	const isMultiSelect = question.multiple === true
	const selected = Array.isArray(answer) ? answer : []
	const isInvolvementQuestion = question.title
		.toLowerCase()
		.includes('involvement')

	return (
		<div className="space-y-3">
			{options.map(([slug, label], optionIndex) => {
				const isSelected = isMultiSelect
					? selected.includes(slug)
					: answer === slug
				const isPopped = poppedOption === slug
				const OptionIcon = getOptionIcon(question, label)
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
						<SelectionCard
							title={renderOptionText(label)}
							icon={OptionIcon ?? undefined}
							media={
								involvementLevel ? (
									<motion.span
										animate={isPopped ? { scale: 1.2 } : { scale: 1 }}
										transition={{
											type: 'spring',
											stiffness: 600,
											damping: 12,
										}}
										className="flex h-full w-full items-center justify-center"
									>
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
									</motion.span>
								) : undefined
							}
							selected={isSelected}
							variant="subtle"
							layout="horizontal"
							indicator="none"
							disabled={disabled}
							onClick={() => onToggle(slug)}
							className="w-full"
						/>
					</motion.div>
				)
			})}
		</div>
	)
}

function getOptionIcon(question: Question, label: string) {
	const prompt = question.title.toLowerCase()
	const text = label.toLowerCase()
	if (text.startsWith('text')) return MessageSquare
	if (text.startsWith('call')) return Phone
	if (text.startsWith('email')) return Mail
	if (prompt.includes('documents') && text.startsWith('scheduled')) return Phone
	if (prompt.includes('representation') && text.includes('access')) return Globe
	if (prompt.includes('representation') && text.includes('exclusive'))
		return Lock
	return null
}

function getInvolvementLevel(label: string) {
	const text = label.toLowerCase()
	if (text.includes('very involved')) return 3
	if (text.includes('key details') || text.includes('details only')) return 2
	if (text.includes('hands off')) return 1
	return 1
}

function renderOptionText(label: string) {
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
