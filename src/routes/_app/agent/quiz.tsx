import { createFileRoute } from '@tanstack/react-router'

import { QuestionFlow } from '@/components/question-flow'
import {
	getNextUnansweredQuestionIndex,
	getStoredIntakeDraftForRole,
	saveStoredIntakeDraftForRole,
} from '@/lib/intake-draft'
import { agentQuestionFlow } from '@/lib/questions'

export const Route = createFileRoute('/_app/agent/quiz')({
	component: AgentQuiz,
})

function AgentQuiz() {
	const draft = getStoredIntakeDraftForRole('agent')

	return (
		<QuestionFlow
			questions={agentQuestionFlow.questions}
			initialAnswers={draft.answers}
			initialQuestionIndex={getNextUnansweredQuestionIndex(
				agentQuestionFlow.questions,
				draft.answers,
			)}
			onAnswersChange={(answers) => {
				saveStoredIntakeDraftForRole('agent', { answers })
			}}
			completeTo="/agent/profile"
			completeLabel="Continue to Details"
		/>
	)
}
