import coreQuestions from './core-questions.json'

export type QuestionCategory =
	| 'Working Style'
	| 'Fit'
	| 'Communication'
	| 'Transparency'

export type QuestionSelection = {
	type: 'multiple'
	maxSelections?: number
}

export type QuestionInputType =
	| 'open-text'
	| 'single-select'
	| 'multi-select'
	| 'slider'
	| 'segmented'

export type CoreQuestion = {
	id: string
	number: number
	category?: QuestionCategory
	categories?: QuestionCategory[]
	categoryNote?: string
	prompt: string
	subtitle?: string
	options?: string[]
	selection?: QuestionSelection
	inputType?: QuestionInputType
	variant?: 'default' | 'compact'
}

export type QuestionFlow = {
	label: string
	questionCount: number
	questions: CoreQuestion[]
}

type CoreQuestionsData = {
	flows: {
		buyer: QuestionFlow
		agent: QuestionFlow
	}
}

const data = coreQuestions as CoreQuestionsData

export const buyerQuestionFlow = data.flows.buyer
export const agentQuestionFlow = data.flows.agent

const buyerMatchingQuestionIds = ['B.6', 'B.11', 'B.12', 'B.14', 'B.8', 'B.9']

function pickQuestions(flow: QuestionFlow, ids: string[]): QuestionFlow {
	const questionsById = new Map(
		flow.questions.map((question) => [question.id, question]),
	)
	const questions = ids
		.map((id, index) => {
			const question = questionsById.get(id)
			return question ? { ...question, number: index + 1 } : null
		})
		.filter((question): question is CoreQuestion => question !== null)

	return {
		...flow,
		label: flow.label.replace('Flow', 'Matching Quiz'),
		questionCount: questions.length,
		questions,
	}
}

export const buyerMatchingQuestionFlow = pickQuestions(
	buyerQuestionFlow,
	buyerMatchingQuestionIds,
)
