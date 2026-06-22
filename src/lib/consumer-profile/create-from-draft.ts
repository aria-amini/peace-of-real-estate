import { createServerFn } from '@tanstack/react-start'

import { requireUserId } from '@/lib/auth/functions'
import {
	draftToProfileUpdate,
	type ConsumerDraft,
} from '@/lib/consumer-draft-storage'
import { saveConsumerProfile } from '@/lib/matching/profile.db'

export const createConsumerProfileFromDraft = createServerFn({ method: 'POST' })
	.inputValidator((data) => data as ConsumerDraft)
	.handler(async ({ data }) => {
		await requireUserId()
		const update = draftToProfileUpdate(data)

		await saveConsumerProfile({
			status: 'active',
			...update,
		})

		return { success: true }
	})
