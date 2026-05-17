import { createFileRoute } from '@tanstack/react-router'

import { QuestionFlow } from '@/components/question-flow'
import {
	getNextUnansweredQuestionIndex,
	getStoredIntakeDraftForRole,
	saveStoredIntakeDraftForRole,
} from '@/lib/intake-draft'
import { agentQuestionFlow } from '@/lib/questions'

export const Route = createFileRoute('/agent/quiz')({
	component: AgentQuiz,
})

function AgentQuiz() {
	const draft = getStoredIntakeDraftForRole('agent')

	return (
		<QuestionFlow
			backTo="/agent/priorities"
			backLabel="Back to priorities"
			stepLabel="Step 2 of 4 - Show how you work with clients"
			accentClassName="bg-terracotta"
			accentTextClassName="text-terracotta"
			accentTintClassName="bg-terracotta-tint"
			accentHoverBorderClassName="hover:border-terracotta/30"
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
			completeLabel="Continue to Profile"
		/>
	)
}
