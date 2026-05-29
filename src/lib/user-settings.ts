/**
 * USER SETTINGS SERVICE
 *
 * This module exposes browser-safe functions backed by server functions.
 * Persistence lives in Postgres through Drizzle.
 *
 * INTEGRATION PLAN:
 * 1. Persist to `consumers`/`consumer_questionnaires` and
 *    `agents`/`agent_questionnaires`
 * 2. Keep the TypeScript interfaces aligned with stored JSON payloads
 */

import { getDb } from '@/db/connection'
import {
	getUserSettingsDb,
	resetUserSettingsDb,
	saveUserSettingsDb,
	updateAgentProfileDb,
	updateAnswersDb,
	updateWeightsDb,
} from '@/lib/user-settings.db'
import { getAuth } from '@/lib/auth'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import type { CoreQuestion } from '@/lib/questions'

export type UserRole = 'consumer' | 'agent'

export type ConsumerFlowKind = 'buyer' | 'seller'

export type CategoryWeights = {
	'working-style': number
	communication: number
	transparency: number
	fit: number
}

export type AnswerValue = number | number[] | string

export type QuestionnaireAnswers = Record<string, AnswerValue>

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
	weights: CategoryWeights
	answers: QuestionnaireAnswers
	agentProfile?: AgentProfileData
	updatedAt: string
}

export function getDefaultSettings(role: UserRole = 'consumer'): UserSettings {
	return {
		role,
		weights: {
			'working-style': 3,
			communication: 3,
			transparency: 3,
			fit: 3,
		},
		answers:
			role === 'consumer'
				? {
						'B.1': 1,
						'B.2': 2,
						'B.3': 0,
						'B.4': 1,
						'B.5': 2,
						'B.6': 0,
						'B.7': 1,
						'B.8': 0,
						'B.9': 2,
						'B.10': 1,
						'B.11': 0,
						'B.12': 1,
						'B.13': 0,
						'B.14': 2,
					}
				: {
						'A.1': 0,
						'A.2': 1,
						'A.3': 2,
						'A.4': 0,
						'A.5': 1,
						'A.6': 0,
						'A.7': 2,
						'A.8': 1,
						'A.9': 0,
						'A.10': 1,
						'A.11': 0,
						'A.12': 2,
					},
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

const updateWeightsServer = createServerFn({ method: 'POST' })
	.inputValidator((data: CategoryWeights) => data)
	.handler(async ({ data }) => {
		const userId = await requireUserId()
		await updateWeightsDb(getDb(), userId, data)
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
 * Update category weights
 */
export async function updateWeights(weights: CategoryWeights): Promise<void> {
	await updateWeightsServer({ data: weights })
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

async function requireUserId(): Promise<string> {
	const session = await getAuth().api.getSession({
		headers: getRequestHeaders(),
	})

	if (!session?.user?.id) {
		throw new Error('Unauthorized')
	}

	return session.user.id
}
