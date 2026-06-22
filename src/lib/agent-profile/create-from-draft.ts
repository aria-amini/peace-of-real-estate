import { createServerFn } from '@tanstack/react-start'

import {
	draftToAgentProfileUpdate,
	type AgentDraft,
} from '@/lib/agent-draft-storage'
import { requireUserId } from '@/lib/auth/functions'
import {
	saveAgentDeepProfile,
	saveAgentEssentials,
} from '@/lib/matching/profile.db'

export const createAgentProfileFromDraft = createServerFn({ method: 'POST' })
	.inputValidator((data) => data as AgentDraft)
	.handler(async ({ data }) => {
		await requireUserId()
		const update = draftToAgentProfileUpdate(data)
		await saveAgentEssentials(update)
		return { success: true }
	})

export const createAgentDeepProfileFromDraft = createServerFn({
	method: 'POST',
})
	.inputValidator((data) => data as AgentDraft)
	.handler(async ({ data }) => {
		await requireUserId()
		const update = draftToAgentProfileUpdate(data)
		await saveAgentDeepProfile(update)
		return { success: true }
	})
