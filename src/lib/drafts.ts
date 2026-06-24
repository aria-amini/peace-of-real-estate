import {
	type AgentProfileCreateInput,
	type ConsumerProfileUpdate,
} from '@/lib/matching/profile'

export type ConsumerDraft = ConsumerProfileUpdate

export type AgentDraft = Partial<AgentProfileCreateInput>

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

const CONSUMER_STORAGE_KEY = 'pre-consumer-draft'

export function loadConsumerDraft(): ConsumerDraft | null {
	return readStorage<ConsumerDraft>(CONSUMER_STORAGE_KEY)
}

export function saveConsumerDraft(draft: ConsumerDraft) {
	writeStorage(CONSUMER_STORAGE_KEY, draft)
}

export function clearConsumerDraft() {
	removeStorage(CONSUMER_STORAGE_KEY)
}

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
