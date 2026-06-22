import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { QuestionFlow } from '@/components/question-flow'
import { useAccountSettings } from '@/hooks/use-account-settings'
import type { AgentProfileUpdate } from '@/lib/matching/profile.types'
import {
	agentQuestionFlow,
	type AnswerValue,
	type Question,
} from '@/lib/matching/questions'

export const Route = createFileRoute('/agent/quiz')({
	component: AgentQuiz,
})

function getNextUnansweredQuestionIndex(
	questions: Question[],
	answers: Record<string, AnswerValue>,
) {
	const nextIndex = questions.findIndex(
		(question) => answers[question.id] === undefined,
	)

	return nextIndex === -1 ? Math.max(questions.length - 1, 0) : nextIndex
}

function answersFromProfile(
	profile: Record<string, unknown> | null,
	questions: Question[],
): Record<string, AnswerValue> {
	if (!profile) return {}

	const answers: Record<string, AnswerValue> = {}
	for (const question of questions) {
		const value = profile[question.id]
		if (value === undefined || value === null) continue
		if (typeof value === 'string') {
			answers[question.id] = value
		} else if (
			Array.isArray(value) &&
			value.every((item): item is string => typeof item === 'string')
		) {
			answers[question.id] = value
		}
	}
	return answers
}

function AgentQuiz() {
	const { agentProfile, loading, saveAgent } = useAccountSettings()
	const navigate = useNavigate()
	const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() =>
		answersFromProfile(
			agentProfile as Record<string, unknown> | null,
			agentQuestionFlow.questions,
		),
	)

	if (loading) return null

	const handleComplete = async () => {
		const ok = await saveAgent(answers as AgentProfileUpdate)
		if (ok) {
			await navigate({ to: '/agent/profile' })
		}
	}

	return (
		<QuestionFlow
			roleLabel="Agent"
			questions={agentQuestionFlow.questions}
			mode="single-question"
			answers={answers}
			currentQuestionIndex={getNextUnansweredQuestionIndex(
				agentQuestionFlow.questions,
				answers,
			)}
			onAnswersChange={setAnswers}
			completeTo="/agent/profile"
			completeLabel="Continue to Details"
			headerInsideCard
			navigateOnComplete={false}
			onComplete={handleComplete}
		/>
	)
}
