import { UserIcon } from '@phosphor-icons/react'
import { useState } from 'react'

import {
	AnimatedStepCard,
	StepProgressHeader,
} from '@/components/signup/shared'
import { QuestionFlow } from '@/components/signup/question-flow'
import { Card, CardContent } from '@/components/ui/card'
import type { ConsumerDraft } from '@/lib/drafts'
import {
	consumerQuestionFlow,
	getAnswerSummary,
	type AnswerValue,
	type Answers,
	type Question,
} from '@/lib/matching/questions'
import { StepHeader, SKIPPED_ANSWER } from './shared'

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
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() =>
		getNextUnansweredQuestionIndex(
			consumerQuestionFlow.questions,
			state.answers,
		),
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
							(q) =>
								state.answers[q.id] !== undefined &&
								state.answers[q.id] !== SKIPPED_ANSWER,
						)}
						showTitle={false}
					/>
					<QuestionFlow
						questions={consumerQuestionFlow.questions}
						titleVisibility="sr-only"
						mode="single-question"
						title="Step 3: Your Match"
						wrapper="wizard"
						answers={state.answers}
						currentQuestionIndex={currentQuestionIndex}
						onAnswersChange={(nextAnswers) =>
							onUpdate({ answers: nextAnswers })
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
	answers: Answers,
) {
	const nextIndex = questions.findIndex((q) => answers[q.id] === undefined)

	return nextIndex === -1 ? Math.max(questions.length - 1, 0) : nextIndex
}

export function getAnswerLabel(question: Question, value: AnswerValue): string {
	return getAnswerSummary(question, value)
}
