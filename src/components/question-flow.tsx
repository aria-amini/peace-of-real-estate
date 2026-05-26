import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, ListChecks } from 'lucide-react'
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
}

export function QuestionFlow({
	roleLabel,
	questions,
	completeTo,
	completeLabel,
	initialAnswers = {},
	initialQuestionIndex = 0,
	onAnswersChange,
}: QuestionFlowProps) {
	const [currentQuestion, setCurrentQuestion] = useState(
		Math.min(Math.max(initialQuestionIndex, 0), questions.length - 1),
	)
	const [answers, setAnswers] =
		useState<Record<string, AnswerValue>>(initialAnswers)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [wasContinueVisible, setWasContinueVisible] = useState(false)
	const [poppedOption, setPoppedOption] = useState<number | null>(null)
	const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const navigate = useNavigate()

	const question = questions[currentQuestion]!
	const progress = ((currentQuestion + 1) / questions.length) * 100
	const answer = answers[question.id]

	const isMultipleChoice = question.selection?.type === 'multiple'
	const isOpenText = question.inputType === 'open-text'
	const requiredSelections = question.selection?.maxSelections ?? 1
	const selectedCount = Array.isArray(answer) ? answer.length : 0
	const answeredQuestionCount = questions.filter(
		(candidate) => answers[candidate.id] !== undefined,
	).length

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

	const toggleOption = (optionIndex: number) => {
		if (isTransitioning) return

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
	const canShowContinue =
		!isLastQuestion &&
		(isMultipleChoice || currentQuestion < answeredQuestionCount)

	const showContinueButton =
		canShowContinue && (!isTransitioning || wasContinueVisible)

	return (
		<FlowPageShell
			title="Quiz"
			subtitle="Step 2"
			icon={ListChecks}
			roleLabel={roleLabel}
		>
			<div className="mb-6 w-full">
				<div className="mb-3 flex items-center justify-between text-xs">
					<div className="flex items-center gap-3">
						<span>
							Question {currentQuestion + 1} of {questions.length}
						</span>
						{isMultipleChoice ? (
							<span className="text-muted-foreground">
								{selectedCount} of {requiredSelections} selected
							</span>
						) : null}
					</div>
					<span className="text-muted-foreground">{Math.round(progress)}%</span>
				</div>
				<div className="bg-border h-1 overflow-hidden">
					<div
						className="bg-primary h-full"
						style={{ width: `${progress}%` }}
					/>
				</div>
				<div
					className={`mt-3 flex items-center ${currentQuestion > 0 ? 'justify-between' : 'justify-end'}`}
				>
					{currentQuestion > 0 && (
						<Button type="button" onClick={handleBack} variant="ghost">
							<ArrowLeft className="h-4 w-4" />
							Previous Question
						</Button>
					)}

					{isLastQuestion ? (
						isComplete ? (
							<Button asChild>
								<Link to={completeTo}>
									{completeLabel}
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						) : isMultipleChoice ? (
							<Button type="button" disabled>
								{completeLabel}
								<ArrowRight className="h-4 w-4" />
							</Button>
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
								<button
									key={option}
									type="button"
									onClick={() => toggleOption(optionIndex)}
									disabled={isTransitioning}
									className="group flex w-full items-center gap-4 border p-4 text-left transition-transform duration-200 ease-out disabled:opacity-50"
								>
									<div
										className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-all duration-200 ease-out ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} ${isPopped ? 'scale-125' : ''}`}
									>
										<Check className="h-3.5 w-3.5" />
									</div>
									<span className="text-foreground text-sm leading-relaxed">
										{option}
									</span>
								</button>
							)
						})}
					</div>
				)}
			</div>
		</FlowPageShell>
	)
}
