import coreQuestions from './core-questions.json'

export type QuestionCategory =
	| 'Working Style'
	| 'Fit'
	| 'Communication'
	| 'Transparency'

export type QuestionSelection = {
	type: 'multiple'
	maxSelections: number
}

export type CoreQuestion = {
	id: string
	number: number
	category?: QuestionCategory
	categories?: QuestionCategory[]
	categoryNote?: string
	prompt: string
	options?: string[]
	selection?: QuestionSelection
	inputType?: 'open-text'
}

type QuestionFlow = {
	label: string
	questionCount: number
	questions: CoreQuestion[]
}

type CoreQuestionsData = {
	flows: {
		buyer: QuestionFlow
		seller: QuestionFlow
		agent: QuestionFlow
	}
}

const data = coreQuestions as CoreQuestionsData

export const buyerQuestionFlow = data.flows.buyer
export const sellerQuestionFlow = data.flows.seller
export const agentQuestionFlow = data.flows.agent
