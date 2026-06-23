import { describe, expect, it } from 'vitest'

import {
	agentQuestionFlow,
	consumerQuestionFlow,
	getAnswerSummary,
	getMultiSelectSummary,
	isFreeForm,
	isMultiSelect,
	questionOptionLabel,
	questionOptionSlugs,
} from '@/lib/matching/questions'

describe('question helpers', () => {
	const question = consumerQuestionFlow.questions.find(
		(q) => q.id === 'preferredContactMethod',
	)!

	it('lists option slugs', () => {
		expect(questionOptionSlugs(question)).toEqual(['text', 'call', 'email'])
	})

	it('returns option labels', () => {
		expect(questionOptionLabel(question, 'text')).toBe('Text')
		expect(questionOptionLabel(question, 'missing')).toBe('missing')
	})

	it('summarizes single answers', () => {
		expect(getAnswerSummary(question, 'text')).toBe('Text')
		expect(getAnswerSummary(question, undefined)).toBe('Not answered')
	})

	it('summarizes multi-select answers', () => {
		const multiQuestion = agentQuestionFlow.questions.find(
			(q) => q.id === 'bestClientTypes',
		)!
		expect(getAnswerSummary(multiQuestion, ['firstTime', 'luxury'])).toBe(
			'First-time buyers who need guidance through the entire process, Luxury transactions with high-touch expectations',
		)
	})

	it('summarizes free-form answers', () => {
		const freeFormQuestion = agentQuestionFlow.questions.find(
			(q) => q.id === 'notFitFor',
		)!
		expect(getAnswerSummary(freeFormQuestion, 'Busy clients')).toBe(
			'Busy clients',
		)
	})

	it('returns multi-select summaries as arrays', () => {
		expect(getMultiSelectSummary(question, 'text')).toEqual(['Text'])
		expect(getMultiSelectSummary(question, ['text', 'call'])).toEqual([
			'Text',
			'Call',
		])
	})

	it('detects question types', () => {
		const multiQuestion = agentQuestionFlow.questions.find(
			(q) => q.id === 'bestClientTypes',
		)!
		const freeFormQuestion = agentQuestionFlow.questions.find(
			(q) => q.id === 'notFitFor',
		)!
		expect(isMultiSelect(multiQuestion)).toBe(true)
		expect(isMultiSelect(question)).toBe(false)
		expect(isFreeForm(freeFormQuestion)).toBe(true)
		expect(isFreeForm(question)).toBe(false)
	})
})
