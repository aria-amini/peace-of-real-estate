import { Link } from '@tanstack/react-router'
import {
	ArrowLeft,
	ArrowRight,
	Check,
	ListChecks,
	Sparkles,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { FlowPageShell } from '@/components/flow-page-shell'
import type { CoreQuestion } from '@/lib/questions'

type AnswerValue = number | number[] | string

type QuestionFlowProps = {
	backTo: string
	backLabel: string
	stepLabel: string
	accentClassName: string
	accentTextClassName: string
	accentTintClassName: string
	accentHoverBorderClassName: string
	questions: CoreQuestion[]
	completeTo: string
	completeLabel: string
	initialAnswers?: Record<string, AnswerValue>
	initialQuestionIndex?: number
	onAnswersChange?: (answers: Record<string, AnswerValue>) => void
}

export function QuestionFlow({
	backTo,
	backLabel,
	stepLabel,
	accentClassName,
	accentTextClassName,
	accentTintClassName,
	accentHoverBorderClassName,
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
	const [justSelected, setJustSelected] = useState<number | null>(null)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [wasContinueVisible, setWasContinueVisible] = useState(false)
	const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

	const handleBack = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion((prev) => prev - 1)
		}
	}

	useEffect(() => {
		setJustSelected(null)
	}, [currentQuestion])

	useEffect(() => {
		return () => {
			if (autoAdvanceTimer.current) {
				clearTimeout(autoAdvanceTimer.current)
			}
			if (transitionTimer.current) {
				clearTimeout(transitionTimer.current)
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
				setJustSelected(null)
				return
			}

			updateAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
			setJustSelected(optionIndex)
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
			setJustSelected(null)
			return
		}

		const next = [...existing, optionIndex].slice(
			-(question.selection?.maxSelections ?? 1),
		)

		updateAnswers((prev) => ({ ...prev, [question.id]: next }))
		setJustSelected(optionIndex)

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
			backTo={backTo}
			backLabel={backLabel}
			title="Core Questions"
			subtitle={stepLabel}
			icon={ListChecks}
			iconClassName={`${accentTintClassName} ${accentTextClassName}`}
		>
			<div className="mb-6 w-full">
				<div className="mb-3 flex items-center justify-between text-xs">
					<div className="flex items-center gap-3">
						<span className={`${accentTextClassName} data-label`}>
							Question {currentQuestion + 1} of {questions.length}
						</span>
						{isMultipleChoice ? (
							<span className="text-muted-foreground">
								{selectedCount} of {requiredSelections} selected
							</span>
						) : null}
					</div>
					<span className="data-number text-muted-foreground">
						{Math.round(progress)}%
					</span>
				</div>
				<div className="bg-border h-1 overflow-hidden">
					<div
						className={`${accentClassName} h-full transition-all duration-500`}
						style={{ width: `${progress}%` }}
					/>
				</div>
				<div
					className={`mt-3 flex items-center ${currentQuestion > 0 ? 'justify-between' : 'justify-end'}`}
				>
					{currentQuestion > 0 && (
						<button
							type="button"
							onClick={handleBack}
							className="text-muted-foreground hover:text-foreground hover:bg-secondary -ml-3 inline-flex items-center gap-2 px-3 py-2 text-sm transition-colors disabled:opacity-50"
						>
							<ArrowLeft className="h-4 w-4" />
							Previous Question
						</button>
					)}

					{isLastQuestion ? (
						isComplete ? (
							<Link
								to={completeTo}
								className={`${accentClassName} text-primary-foreground inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all hover:opacity-90`}
							>
								{completeLabel}
								<ArrowRight className="h-4 w-4" />
							</Link>
						) : isMultipleChoice ? (
							<button
								type="button"
								disabled
								className="bg-muted text-muted-foreground inline-flex items-center gap-2 px-4 py-2 text-sm font-medium opacity-70"
							>
								{completeLabel}
								<ArrowRight className="h-4 w-4" />
							</button>
						) : null
					) : showContinueButton ? (
						<button
							type="button"
							onClick={handleNext}
							disabled={!canProceed || isTransitioning}
							className={`${canProceed && !isTransitioning ? `${accentClassName} text-primary-foreground hover:opacity-90` : 'bg-muted text-muted-foreground opacity-70'} inline-flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed`}
						>
							Continue
							<ArrowRight className="h-4 w-4" />
						</button>
					) : null}
				</div>
			</div>

			<div>
				<h2 className="mb-2 font-serif text-xl leading-relaxed font-normal">
					{question.prompt}
				</h2>
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
					<textarea
						value={typeof answer === 'string' ? answer : ''}
						onChange={(e) =>
							updateAnswers((prev) => ({
								...prev,
								[question.id]: e.target.value,
							}))
						}
						placeholder="Share a few details"
						rows={6}
						className="border-border bg-background focus:border-primary w-full border px-4 py-3 text-sm leading-relaxed focus:outline-none"
					/>
				) : (
					<div className="space-y-3">
						{question.options?.map((option, optionIndex) => {
							const isSelected = Array.isArray(answer)
								? answer.includes(optionIndex)
								: answer === optionIndex
							const isFresh = justSelected === optionIndex && isSelected

							return (
								<button
									key={option}
									type="button"
									onClick={() => toggleOption(optionIndex)}
									disabled={isTransitioning}
									className={`flex w-full items-center gap-4 border p-4 text-left transition-all duration-200 disabled:cursor-default disabled:opacity-50 ${
										isSelected
											? `border-current ${accentTextClassName} ${accentTintClassName}`
											: `border-border ${accentHoverBorderClassName} hover:bg-secondary`
									}`}
								>
									<div
										className={`relative flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${
											isSelected
												? `border-current ${accentClassName}`
												: 'border-border'
										}`}
									>
										{isSelected ? (
											<Check className="text-primary-foreground animate-pop-in h-3.5 w-3.5" />
										) : null}
										{isFresh ? (
											<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
												<Sparkles className="text-primary-foreground animate-sparkle h-3 w-3" />
											</div>
										) : null}
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
