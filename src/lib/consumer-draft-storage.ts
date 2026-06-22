import type { RepresentationSide } from '@/lib/matching/profile.types'
import type { AnswerValue, Answers } from '@/lib/matching/questions'

const STORAGE_KEY = 'pre-consumer-draft'

export type ConsumerDraft = {
	location?: string
	state?: string
	priceRange?: string
	propertyTypes?: string[]
	intent?: RepresentationSide
	experienceLevel?: string
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

function migrateDraft(draft: ConsumerDraft): ConsumerDraft {
	const migratedAnswers: Answers = {}
	for (const [key, value] of Object.entries(draft.answers ?? {})) {
		if (isValidAnswerValue(value)) {
			migratedAnswers[key] = value
		}
	}
	return { ...draft, answers: migratedAnswers }
}

export function loadConsumerDraft(): ConsumerDraft | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (!raw) return null
		const parsed = JSON.parse(raw) as unknown
		if (parsed && typeof parsed === 'object' && 'answers' in parsed) {
			return migrateDraft(parsed as ConsumerDraft)
		}
		return null
	} catch {
		return null
	}
}

export function saveConsumerDraft(draft: ConsumerDraft) {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function clearConsumerDraft() {
	if (typeof window === 'undefined') return
	window.localStorage.removeItem(STORAGE_KEY)
}

export function draftToProfileUpdate(draft: ConsumerDraft) {
	return {
		location: draft.location,
		state: draft.state,
		priceRange: draft.priceRange,
		propertyTypes: draft.propertyTypes,
		intent: draft.intent ?? 'buying',
		experienceLevel: draft.experienceLevel,
		preferredContactMethod: draft.answers.preferredContactMethod as
			| string
			| undefined,
		involvementLevel: draft.answers.involvementLevel as string | undefined,
		representationPreference: draft.answers.representationPreference as
			| string
			| undefined,
		commissionComfort: draft.answers.commissionComfort as string | undefined,
		matchPriorities: draft.matchPriorities,
	}
}
