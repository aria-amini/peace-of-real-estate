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
const DRAFT_UPDATED_EVENT = 'intake-draft:updated'
const DRAFT_TTL_MS = 3 * 24 * 60 * 60 * 1000 // 3 days

export type ConsumerFlowStage =
	| 'intro'
	| 'quiz'
	| 'details'
	| 'summary'
	| 'payment'
	| 'results'

export type IntakeDraft = UserSettings & {
	hasCompletedWeights?: boolean
	zipCode?: string
	intent?: string
	matchDetails?: string
	agentRepresentation?: string
	currentStage?: ConsumerFlowStage
	lastCompletedStage?: ConsumerFlowStage
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
		const draft = JSON.parse(rawValue) as IntakeDraft

		if (
			draft.updatedAt &&
			Date.now() - new Date(draft.updatedAt).getTime() > DRAFT_TTL_MS
		) {
			window.localStorage.removeItem(STORAGE_KEY)
			return null
		}

		return draft
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
	window.dispatchEvent(new Event(DRAFT_UPDATED_EVENT))
}

export function listenForIntakeDraftUpdates(callback: () => void) {
	if (typeof window === 'undefined') {
		return () => {}
	}

	window.addEventListener(DRAFT_UPDATED_EVENT, callback)
	return () => window.removeEventListener(DRAFT_UPDATED_EVENT, callback)
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
		currentStage?: ConsumerFlowStage
		lastCompletedStage?: ConsumerFlowStage
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

export function clearStoredConsumerDraftForFlow(flowKind: ConsumerFlowKind) {
	if (typeof window === 'undefined') {
		return
	}

	const existing = getStoredIntakeDraft()
	if (existing?.role === 'consumer' && existing.flowKind === flowKind) {
		window.localStorage.removeItem(STORAGE_KEY)
	}
}

export function getNextPathForConsumerFlow(
	flowKind: ConsumerFlowKind,
	draft: IntakeDraft,
): string {
	const base = flowKind === 'buyer' ? '/buyer' : '/seller'
	const stage = draft.lastCompletedStage

	switch (stage) {
		case 'intro':
			return `${base}/quiz`
		case 'quiz':
			return `${base}/details`
		case 'details':
			return `${base}/summary`
		case 'summary':
			return `${base}/payment`
		case 'payment':
			return `${base}/results`
		default:
			if (Object.keys(draft.answers ?? {}).length > 0) {
				return `${base}/quiz`
			}
			if (draft.zipCode && draft.intent) {
				return `${base}/quiz`
			}
			return `${base}/intro`
	}
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
