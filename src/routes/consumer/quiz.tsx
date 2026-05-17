import { authClient } from '@/lib/auth-client'
import { createFileRoute } from '@tanstack/react-router'
import { Navigate } from '@tanstack/react-router'

import { QuestionFlow } from '@/components/question-flow'
import {
	getNextUnansweredQuestionIndex,
	getStoredIntakeDraftForRole,
	saveStoredIntakeDraftForRole,
} from '@/lib/intake-draft'
import { buyerQuestionFlow } from '@/lib/questions'

export const Route = createFileRoute('/consumer/quiz')({
	component: ConsumerQuiz,
})

function ConsumerQuiz() {
	const { data: session, isPending } = authClient.useSession()
	const draft = getStoredIntakeDraftForRole('consumer')

	if (isPending) {
		return <div className="flex-1" />
	}

	if (session) {
		return <Navigate to="/match-activity" />
	}

	return (
		<QuestionFlow
			backTo="/consumer/priorities"
			backLabel="Back to priorities"
			stepLabel="Step 2 of 4 - Help us understand your preferences"
			accentClassName="bg-blue-cyan"
			accentTextClassName="text-blue-cyan"
			accentTintClassName="bg-blue-cyan-tint"
			accentHoverBorderClassName="hover:border-blue-cyan/30"
			questions={buyerQuestionFlow.questions}
			initialAnswers={draft.answers}
			initialQuestionIndex={getNextUnansweredQuestionIndex(
				buyerQuestionFlow.questions,
				draft.answers,
			)}
			onAnswersChange={(answers) => {
				saveStoredIntakeDraftForRole('consumer', { answers })
			}}
			completeTo="/consumer/results"
			completeLabel="View Your Matches"
		/>
	)
}
