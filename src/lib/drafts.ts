import { createServerFn } from '@tanstack/react-start'

import { requireUserId } from '@/lib/auth/functions'
import {
	agentProfileColumns,
	consumerProfileColumns,
	saveAgentEssentials,
	saveConsumerProfile,
	type AgentProfileUpdate,
	type ConsumerProfileUpdate,
} from '@/lib/matching/profile'
import type { AnswerValue, Answers } from '@/lib/matching/questions'

// Draft types extend the DB profile shapes so profile.ts stays the
// source of truth for profile fields. Extra keys are transient UI state that
// only lives in localStorage.

export type ConsumerDraft = ConsumerProfileUpdate & {
	city?: string
	zipCodes?: string[]
	timeline?: string
	answers: Answers
}

export type AgentDraft = AgentProfileUpdate & {
	city?: string
	state?: string
	zipCodes?: string[]
	answers?: Answers
}

//region LocalStorage helpers

function readStorage<T>(key: string): T | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = window.localStorage.getItem(key)
		if (!raw) return null
		const parsed = JSON.parse(raw) as unknown
		if (parsed && typeof parsed === 'object') {
			return parsed as T
		}
		return null
	} catch {
		return null
	}
}

function writeStorage(key: string, draft: unknown) {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(key, JSON.stringify(draft))
}

function removeStorage(key: string) {
	if (typeof window === 'undefined') return
	window.localStorage.removeItem(key)
}

//endregion

//region Consumer draft

const CONSUMER_STORAGE_KEY = 'pre-consumer-draft'

function isValidAnswerValue(value: unknown): value is AnswerValue {
	if (typeof value === 'string') return true
	if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
		return true
	}
	return false
}

function migrateConsumerDraft(draft: ConsumerDraft): ConsumerDraft {
	const migratedAnswers: Answers = {}
	for (const [key, value] of Object.entries(draft.answers ?? {})) {
		if (isValidAnswerValue(value)) {
			migratedAnswers[key] = value
		}
	}
	return { ...draft, answers: migratedAnswers }
}

export function loadConsumerDraft(): ConsumerDraft | null {
	const parsed = readStorage<ConsumerDraft>(CONSUMER_STORAGE_KEY)
	if (parsed && 'answers' in parsed) {
		return migrateConsumerDraft(parsed)
	}
	return null
}

export function saveConsumerDraft(draft: ConsumerDraft) {
	writeStorage(CONSUMER_STORAGE_KEY, draft)
}

export function clearConsumerDraft() {
	removeStorage(CONSUMER_STORAGE_KEY)
}

//endregion

//region Agent draft

const AGENT_STORAGE_KEY = 'pre-agent-draft'

export function loadAgentDraft(): AgentDraft | null {
	return readStorage<AgentDraft>(AGENT_STORAGE_KEY)
}

export function saveAgentDraft(draft: AgentDraft) {
	writeStorage(AGENT_STORAGE_KEY, draft)
}

export function clearAgentDraft() {
	removeStorage(AGENT_STORAGE_KEY)
}

//endregion

//region Transformations

// Build profile updates directly from profile.ts so adding a column
// there is automatically reflected in the draft promotion path.

export function draftToConsumerProfileUpdate(
	draft: ConsumerDraft,
): ConsumerProfileUpdate {
	const update: ConsumerProfileUpdate = {}

	for (const key of Object.keys(
		consumerProfileColumns,
	) as (keyof typeof consumerProfileColumns)[]) {
		if (key in draft) {
			;(update as Record<string, unknown>)[key] = draft[key]
		}
	}

	update.location = draft.location ?? draft.city
	update.intent = draft.intent ?? 'buying'
	update.preferredContactMethod = draft.answers.preferredContactMethod as
		| string
		| undefined
	update.involvementLevel = draft.answers.involvementLevel as string | undefined
	update.representationPreference = draft.answers.representationPreference as
		| string
		| undefined
	update.commissionComfort = draft.answers.commissionComfort as
		| string
		| undefined

	return update
}

export function draftToAgentProfileUpdate(
	draft: AgentDraft,
): AgentProfileUpdate {
	const update: AgentProfileUpdate = {}

	for (const key of Object.keys(
		agentProfileColumns,
	) as (keyof typeof agentProfileColumns)[]) {
		if (key in draft) {
			;(update as Record<string, unknown>)[key] = draft[key]
		}
	}

	return update
}

//endregion

//region Server functions

export const createConsumerProfileFromDraft = createServerFn({ method: 'POST' })
	.validator(consumerDraftSchema)
	.handler(async ({ data }) => {
		await requireUserId()
		const update = draftToConsumerProfileUpdate(data)

		await saveConsumerProfile({
			data: {
				status: 'active',
				...update,
			},
		})

		return { success: true }
	})

export const createAgentProfileFromDraft = createServerFn({ method: 'POST' })
	.validator(agentDraftSchema)
	.handler(async ({ data }) => {
		await requireUserId()
		const update = draftToAgentProfileUpdate(data)
		await saveAgentEssentials({ data: update })
		return { success: true }
	})

//endregion
