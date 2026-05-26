import type {
	AgentProfileData,
	CategoryWeights,
	ConsumerFlowKind,
	QuestionnaireAnswers,
	UserRole,
	UserSettings,
} from '@/lib/user-settings'
import type { CoreQuestion } from '@/lib/questions'

const STORAGE_KEY = 'peace-of-real-estate.intake-draft'

export type IntakeDraft = UserSettings & {
	hasCompletedWeights?: boolean
	zipCode?: string
	intent?: string
	matchDetails?: string
	agentRepresentation?: string
}

export function getStoredIntakeDraft(): IntakeDraft | null {
	if (typeof window === 'undefined') {
		return null
	}

	const rawValue = window.localStorage.getItem(STORAGE_KEY)

	if (!rawValue) {
		return null
	}

	try {
		return JSON.parse(rawValue) as IntakeDraft
	} catch {
		window.localStorage.removeItem(STORAGE_KEY)
		return null
	}
}

export function clearStoredIntakeDraft() {
	if (typeof window === 'undefined') {
		return
	}

	window.localStorage.removeItem(STORAGE_KEY)
}

export function saveStoredIntakeDraft(draft: IntakeDraft) {
	if (typeof window === 'undefined') {
		return
	}

	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function getDefaultDraft(
	role: UserRole,
	flowKind?: ConsumerFlowKind,
): IntakeDraft {
	return {
		role,
		...(flowKind ? { flowKind } : {}),
		weights: {
			'working-style': 3,
			communication: 3,
			transparency: 3,
			fit: 3,
		},
		answers: {},
		...(role === 'agent'
			? {
					agentProfile: {
						experience: '',
						zipCodes: '',
						services: [],
					} satisfies AgentProfileData,
				}
			: {}),
		updatedAt: new Date().toISOString(),
	}
}

export function getStoredIntakeDraftForRole(role: UserRole): IntakeDraft {
	const existingDraft = getStoredIntakeDraft()

	if (existingDraft?.role === role) {
		return existingDraft
	}

	return getDefaultDraft(role)
}

export function getStoredConsumerDraftForFlow(
	flowKind: ConsumerFlowKind,
): IntakeDraft {
	const existingDraft = getStoredIntakeDraft()

	if (
		existingDraft?.role === 'consumer' &&
		existingDraft.flowKind === flowKind
	) {
		return existingDraft
	}

	return getDefaultDraft('consumer', flowKind)
}

export function saveStoredIntakeDraftForRole(
	role: UserRole,
	updates: {
		weights?: CategoryWeights
		answers?: QuestionnaireAnswers
		agentProfile?: AgentProfileData
		hasCompletedWeights?: boolean
		flowKind?: ConsumerFlowKind
		zipCode?: string
		intent?: string
		matchDetails?: string
		agentRepresentation?: string
	},
) {
	const nextDraft = {
		...getStoredIntakeDraftForRole(role),
		...updates,
		updatedAt: new Date().toISOString(),
	} satisfies IntakeDraft

	saveStoredIntakeDraft(nextDraft)
}

export function saveStoredConsumerDraftForFlow(
	flowKind: ConsumerFlowKind,
	updates: Parameters<typeof saveStoredIntakeDraftForRole>[1],
) {
	const nextDraft = {
		...getStoredConsumerDraftForFlow(flowKind),
		...updates,
		role: 'consumer' as const,
		flowKind,
		updatedAt: new Date().toISOString(),
	} satisfies IntakeDraft

	saveStoredIntakeDraft(nextDraft)
}

export function getNextUnansweredQuestionIndex(
	questions: Pick<CoreQuestion, 'id'>[],
	answers: QuestionnaireAnswers,
) {
	const nextIndex = questions.findIndex(
		(question) => answers[question.id] === undefined,
	)

	return nextIndex === -1 ? Math.max(questions.length - 1, 0) : nextIndex
}
