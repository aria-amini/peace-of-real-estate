/**
 * USER SETTINGS SERVICE
 *
 * This module exposes browser-safe functions backed by server functions.
 * Persistence lives in Postgres through Drizzle.
 *
 * INTEGRATION PLAN:
 * 1. Persist to concrete `buyer_profiles` and `agent_profiles` tables.
 * 2. Keep the TypeScript interfaces aligned with the onboarding draft shape.
 */

import { getDb } from '@/db/connection'
import {
	getUserSettingsDb,
	resetUserSettingsDb,
	saveUserSettingsDb,
	updateAgentProfileDb,
	updateAnswersDb,
} from '@/lib/matching/settings.db'
import { requireUserId } from '@/lib/auth/functions'
import { createServerFn } from '@tanstack/react-start'

import type { CoreQuestion } from '@/lib/matching/questions'

export type UserRole = 'consumer' | 'agent'

export type ConsumerFlowKind = 'buyer'

export type AnswerValue = number | number[] | string

export type QuestionnaireAnswers = Record<string, AnswerValue>

const SKIPPED_ANSWER = '__skipped__'

export type AgentProfileData = {
	firstName?: string
	lastName?: string
	brokerageName?: string
	email?: string
	phone?: string
	businessAddress?: string
	billingAddress?: string
	licenseNumberState?: string
	serviceArea1?: string
	serviceArea2?: string
	serviceArea3?: string
	yearsLicensed?: string
	averageTransactions?: string
	employmentStatus?: string
	licenseProof?: string
	clientFirstTerms?: string
	valueProposition?: string
	usePaxWriter?: boolean
	introVideo?: string
	experience: string
	zipCodes: string
	services: string[]
}

export type UserSettings = {
	role: UserRole
	flowKind?: ConsumerFlowKind
	answers: QuestionnaireAnswers
	agentProfile?: AgentProfileData
	zipCode?: string
	state?: string
	intent?: string
	priceRange?: string
	propertyType?: string[]
	experienceLevel?: string
	matchPriorities?: string[]
	matchDetails?: string
	agentRepresentation?: string
	updatedAt: string
}

export function getDefaultSettings(role: UserRole = 'consumer'): UserSettings {
	return {
		role,
		...(role === 'consumer' ? { flowKind: 'buyer' as const } : {}),
		answers: {},
		...(role === 'agent'
			? {
					agentProfile: {
						experience: '',
						zipCodes: '',
						services: [],
					},
				}
			: {}),
		updatedAt: new Date().toISOString(),
	}
}

const getUserSettingsServer = createServerFn({ method: 'GET' }).handler(
	async () => {
		const userId = await requireUserId()
		return getUserSettingsDb(getDb(), userId)
	},
)

const saveUserSettingsServer = createServerFn({ method: 'POST' })
	.inputValidator((data: UserSettings) => data)
	.handler(async ({ data }) => {
		const userId = await requireUserId()
		await saveUserSettingsDb(getDb(), userId, data)
	})

const updateAnswersServer = createServerFn({ method: 'POST' })
	.inputValidator((data: QuestionnaireAnswers) => data)
	.handler(async ({ data }) => {
		const userId = await requireUserId()
		await updateAnswersDb(getDb(), userId, data)
	})

const updateAgentProfileServer = createServerFn({ method: 'POST' })
	.inputValidator((data: AgentProfileData) => data)
	.handler(async ({ data }) => {
		const userId = await requireUserId()
		await updateAgentProfileDb(getDb(), userId, data)
	})

const resetUserSettingsServer = createServerFn({ method: 'POST' }).handler(
	async () => {
		const userId = await requireUserId()
		await resetUserSettingsDb(getDb(), userId)
	},
)

/**
 * Get user settings for current authenticated user.
 */
export async function getUserSettings(): Promise<UserSettings | null> {
	try {
		return await getUserSettingsServer()
	} catch {
		return null
	}
}

/**
 * Save a full settings payload for current user.
 */
export async function saveUserSettings(settings: UserSettings): Promise<void> {
	await saveUserSettingsServer({
		data: { ...settings, updatedAt: new Date().toISOString() },
	})
}

/**
 * Update questionnaire answers
 */
export async function updateAnswers(
	answers: QuestionnaireAnswers,
): Promise<void> {
	await updateAnswersServer({ data: answers })
}

/**
 * Update agent profile
 */
export async function updateAgentProfile(
	profile: AgentProfileData,
): Promise<void> {
	await updateAgentProfileServer({ data: profile })
}

/**
 * Reset all persisted settings for current user.
 */
export async function resetUserSettings(): Promise<void> {
	await resetUserSettingsServer()
}

/**
 * Get a human-readable summary of an answer
 */
export function getAnswerSummary(
	question: CoreQuestion,
	answer: AnswerValue,
): string {
	if (answer === SKIPPED_ANSWER) {
		return 'Skipped'
	}

	if (question.inputType === 'open-text') {
		return typeof answer === 'string' ? answer : 'Not answered'
	}

	if (Array.isArray(answer)) {
		const selected = answer.map((i) => question.options?.[i]).filter(Boolean)
		return selected.length > 0 ? selected.join(', ') : 'Not answered'
	}

	if (typeof answer === 'number') {
		return question.options?.[answer] ?? 'Not answered'
	}

	return 'Not answered'
}

/**
 * Get completion status for questionnaire
 */
export function getQuestionnaireProgress(
	questions: CoreQuestion[],
	answers: QuestionnaireAnswers,
): { answered: number; total: number; percentage: number } {
	const answered = questions.filter((q) => {
		const ans = answers[q.id]
		if (ans === undefined || ans === null) return false
		if (typeof ans === 'string') return ans.trim().length > 0
		if (Array.isArray(ans)) return ans.length > 0
		return true
	}).length

	return {
		answered,
		total: questions.length,
		percentage: Math.round((answered / questions.length) * 100),
	}
}

/**
 * Group questions by category for display
 */
export function groupQuestionsByCategory(
	questions: CoreQuestion[],
): Record<string, CoreQuestion[]> {
	const groups: Record<string, CoreQuestion[]> = {}

	for (const q of questions) {
		const cats = q.categories ?? (q.category ? [q.category] : ['Other'])
		for (const cat of cats) {
			if (!groups[cat]) groups[cat] = []
			groups[cat].push(q)
		}
	}

	return groups
}
