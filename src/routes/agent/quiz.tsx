import { createFileRoute } from '@tanstack/react-router'

import { QuestionFlow } from '@/components/question-flow'
import {
	getNextUnansweredQuestionIndex,
	getStoredIntakeDraftForRole,
	saveStoredIntakeDraftForRole,
} from '@/lib/matching/intake-draft'
import { agentQuestionFlow } from '@/lib/matching/questions'

export const Route = createFileRoute('/agent/quiz')({
	component: AgentQuiz,
})

function AgentQuiz() {
	const draft = getStoredIntakeDraftForRole('agent')

	return (
		<QuestionFlow
			roleLabel="Agent"
			questions={agentQuestionFlow.questions}
			initialAnswers={draft.answers}
			initialQuestionIndex={getNextUnansweredQuestionIndex(
				agentQuestionFlow.questions,
				draft.answers,
			)}
			onAnswersChange={(answers) => {
				const cleaned: Record<string, number | number[] | string> = {}
				for (const [key, value] of Object.entries(answers)) {
					if (value !== undefined) {
						cleaned[key] = value
					}
				}
				saveStoredIntakeDraftForRole('agent', { answers: cleaned })
			}}
			completeTo="/agent/profile"
			completeLabel="Continue to Details"
			headerInsideCard
		/>
	)
}
