import type { RepresentationSide } from '@/lib/matching/profile.types'
import type { AnswerValue, Answers } from '@/lib/matching/questions'

const STORAGE_KEY = 'pre-agent-draft'

export type AgentDraft = {
	serviceArea1?: string
	serviceArea2?: string
	serviceArea3?: string
	typicalPriceRange?: string
	representationSide?: RepresentationSide
	bestClientTypes?: string[]
	yearsLicensed?: string
	averageTransactions?: string
	matchPriorities?: string[]
	answers: Answers
}

function isValidAnswerValue(value: unknown): value is AnswerValue {
	if (typeof value === 'string') return true
	if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
		return true
	}
	return false
}

function migrateDraft(draft: AgentDraft): AgentDraft {
	const migratedAnswers: Answers = {}
	for (const [key, value] of Object.entries(draft.answers ?? {})) {
		if (isValidAnswerValue(value)) {
			migratedAnswers[key] = value
		}
	}
	return { ...draft, answers: migratedAnswers }
}

export function loadAgentDraft(): AgentDraft | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (!raw) return null
		const parsed = JSON.parse(raw) as unknown
		if (parsed && typeof parsed === 'object' && 'answers' in parsed) {
			return migrateDraft(parsed as AgentDraft)
		}
		return null
	} catch {
		return null
	}
}

export function saveAgentDraft(draft: AgentDraft) {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function clearAgentDraft() {
	if (typeof window === 'undefined') return
	window.localStorage.removeItem(STORAGE_KEY)
}

export function draftToAgentProfileUpdate(draft: AgentDraft) {
	return {
		serviceArea1: draft.serviceArea1,
		serviceArea2: draft.serviceArea2,
		serviceArea3: draft.serviceArea3,
		typicalPriceRange: draft.typicalPriceRange,
		representationSide: draft.representationSide,
		bestClientTypes: draft.bestClientTypes,
		yearsLicensed: draft.yearsLicensed,
		averageTransactions: draft.averageTransactions,
		notFitFor: draft.answers.notFitFor as string | undefined,
		workingStyle: draft.answers.workingStyle as string | undefined,
		dealStressStyle: draft.answers.dealStressStyle as string | undefined,
		communicationCadence: draft.answers.communicationCadence as
			| string
			| undefined,
		quickContactStyle: draft.answers.quickContactStyle as string | undefined,
		updateDeliveryStyle: draft.answers.updateDeliveryStyle as
			| string
			| undefined,
		responseTime: draft.answers.responseTime as string | undefined,
		commissionStyle: draft.answers.commissionStyle as string | undefined,
		dualAgencyStyle: draft.answers.dualAgencyStyle as string | undefined,
		matchPriorities: draft.matchPriorities,
	}
}
