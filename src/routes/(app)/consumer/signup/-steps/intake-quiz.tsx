import { UserIcon } from '@phosphor-icons/react'
import { useState } from 'react'

import {
	AnimatedStepCard,
	StepProgressHeader,
} from '@/components/signup/shared'
import { QuestionFlow } from '@/components/signup/question-flow'
import { Card, CardContent } from '@/components/ui/card'
import type { ConsumerDraft } from '@/lib/drafts'
import { StepHeader } from '@/components/signup/step-header'
import {
	consumerQuestionFlow,
	questionOptionLabel,
	type AnswerValue,
	type Question,
} from '@/lib/matching/questions'
import type { ConsumerProfileUpdate } from '@/lib/matching/profile'

export function ConsumerQuiz({
	state,
	direction,
	onUpdate,
	onComplete,
}: {
	state: ConsumerDraft
	direction: number
	onUpdate: (patch: Partial<ConsumerDraft>) => void
	onComplete: () => void
}) {
	const answers = extractAnswers(state)
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() =>
		getNextUnansweredQuestionIndex(consumerQuestionFlow.questions, answers),
	)

	return (
		<AnimatedStepCard stepKey="quiz" direction={direction}>
			<Card size="sm" className="shadow-sm">
				<CardContent className="space-y-6">
					<StepHeader
						stepNumber={4}
						totalSteps={4}
						title="Preferences"
						icon={UserIcon}
					/>
					<StepProgressHeader
						stepNumber={4}
						totalSteps={4}
						title="Preferences"
						activeIndex={currentQuestionIndex}
						items={consumerQuestionFlow.questions.map(
							(q) => answers[q.id] !== undefined && answers[q.id] !== null,
						)}
						showTitle={false}
					/>
					<QuestionFlow
						questions={consumerQuestionFlow.questions}
						titleVisibility="sr-only"
						mode="single-question"
						title="Step 3: Your Match"
						wrapper="wizard"
						answers={answers}
						currentQuestionIndex={currentQuestionIndex}
						onAnswersChange={(nextAnswers) =>
							onUpdate(answersToProfileUpdate(nextAnswers))
						}
						onQuestionIndexChange={setCurrentQuestionIndex}
						onComplete={onComplete}
						completeTo="/consumer/signup?step=preview"
						completeLabel="Continue"
						navigateOnComplete={false}
					/>
				</CardContent>
			</Card>
		</AnimatedStepCard>
	)
}

function getNextUnansweredQuestionIndex(
	questions: Question[],
	answers: Record<string, AnswerValue>,
) {
	const nextIndex = questions.findIndex((q) => answers[q.id] === undefined)

	return nextIndex === -1 ? Math.max(questions.length - 1, 0) : nextIndex
}

function extractAnswers(draft: ConsumerDraft): Record<string, AnswerValue> {
	const answers: Record<string, AnswerValue> = {}
	for (const question of consumerQuestionFlow.questions) {
		const value = draft[question.id as keyof ConsumerProfileUpdate]
		if (value !== undefined && value !== null) {
			answers[question.id] = value as AnswerValue
		}
	}
	return answers
}

function answersToProfileUpdate(
	answers: Record<string, AnswerValue>,
): Partial<ConsumerDraft> {
	const update: Partial<ConsumerDraft> = {}
	for (const question of consumerQuestionFlow.questions) {
		const value = answers[question.id]
		if (value !== undefined && value !== null) {
			update[question.id as keyof ConsumerDraft] = value as never
		}
	}
	return update
}

export function getAnswerLabel(question: Question, value: AnswerValue): string {
	if (value === undefined || value === null) return 'Not answered'
	if (question.freeForm && typeof value === 'string') {
		return value.trim() || 'Not answered'
	}
	if (Array.isArray(value)) {
		return value
			.map((slug) => questionOptionLabel(question, slug))
			.filter(Boolean)
			.join(', ')
	}
	return questionOptionLabel(question, value)
}
