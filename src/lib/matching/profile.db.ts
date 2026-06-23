import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { getDb } from '@/db/connection'
import { agentProfiles, consumerProfiles } from '@/db/tables'
import { requireUserId } from '@/lib/auth/functions'
import type {
	AgentProfileUpdate,
	ConsumerProfile,
	ConsumerProfileUpdate,
} from '@/lib/matching/profile.types'

const loadConsumerProfile = createServerFn({ method: 'GET' }).handler(
	async () => {
		const userId = await requireUserId()
		const db = getDb()
		const [profile] = await db
			.select()
			.from(consumerProfiles)
			.where(eq(consumerProfiles.userId, userId))
			.limit(1)
		return profile ?? null
	},
)

const saveConsumerProfile = createServerFn({ method: 'POST' })
	.validator((data) => data as ConsumerProfileUpdate)
	.handler(async ({ data }) => {
		const userId = await requireUserId()
		const db = getDb()
		const now = new Date()

		const existing = await db
			.select({ id: consumerProfiles.id })
			.from(consumerProfiles)
			.where(eq(consumerProfiles.userId, userId))
			.limit(1)

		if (existing[0]) {
			await db
				.update(consumerProfiles)
				.set({ ...data, updatedAt: now })
				.where(eq(consumerProfiles.id, existing[0].id))
			return
		}

		await db.insert(consumerProfiles).values({
			id: crypto.randomUUID(),
			userId,
			intent: data.intent ?? 'buying',
			status: data.status ?? 'draft',
			...data,
			createdAt: now,
			updatedAt: now,
		})
	})

const loadAgentProfile = createServerFn({ method: 'GET' }).handler(async () => {
	const userId = await requireUserId()
	const db = getDb()
	const [profile] = await db
		.select()
		.from(agentProfiles)
		.where(eq(agentProfiles.userId, userId))
		.limit(1)
	return profile ?? null
})

const saveAgentProfile = createServerFn({ method: 'POST' })
	.validator((data) => data as AgentProfileUpdate)
	.handler(async ({ data }) => {
		const userId = await requireUserId()
		const db = getDb()
		const now = new Date()

		const existing = await db
			.select({ id: agentProfiles.id })
			.from(agentProfiles)
			.where(eq(agentProfiles.userId, userId))
			.limit(1)

		if (existing[0]) {
			await db
				.update(agentProfiles)
				.set({ ...data, updatedAt: now })
				.where(eq(agentProfiles.id, existing[0].id))
			return
		}

		await db.insert(agentProfiles).values({
			id: crypto.randomUUID(),
			userId,
			status: data.status ?? 'draft',
			usePaxWriter: data.usePaxWriter ?? true,
			licenseAttested: data.licenseAttested ?? false,
			peacePactSigned: data.peacePactSigned ?? false,
			...data,
			createdAt: now,
			updatedAt: now,
		})
	})

function isEssentialsComplete(data: AgentProfileUpdate) {
	return Boolean(
		data.firstName?.trim() &&
		data.lastName?.trim() &&
		data.brokerageName?.trim() &&
		data.licenseNumberState?.trim() &&
		data.serviceAreas &&
		data.serviceAreas.length > 0 &&
		data.typicalPriceRange?.trim() &&
		data.representationSide?.trim() &&
		data.bestClientTypes &&
		data.bestClientTypes.length > 0 &&
		data.licenseAttested &&
		data.eoInsuranceStatus?.trim() &&
		data.peacePactSigned &&
		data.peacePactSignature?.trim(),
	)
}

const saveAgentEssentials = createServerFn({ method: 'POST' })
	.validator((data) => data as AgentProfileUpdate)
	.handler(async ({ data }) => {
		const userId = await requireUserId()
		const db = getDb()
		const now = new Date()

		const status = isEssentialsComplete(data) ? 'active' : 'draft'

		const existing = await db
			.select({ id: agentProfiles.id, status: agentProfiles.status })
			.from(agentProfiles)
			.where(eq(agentProfiles.userId, userId))
			.limit(1)

		if (existing[0]) {
			const nextStatus = existing[0].status === 'enriched' ? 'enriched' : status
			await db
				.update(agentProfiles)
				.set({ ...data, status: nextStatus, updatedAt: now })
				.where(eq(agentProfiles.id, existing[0].id))
			return
		}

		await db.insert(agentProfiles).values({
			id: crypto.randomUUID(),
			userId,
			status,
			usePaxWriter: data.usePaxWriter ?? true,
			licenseAttested: data.licenseAttested ?? false,
			peacePactSigned: data.peacePactSigned ?? false,
			...data,
			createdAt: now,
			updatedAt: now,
		})
	})

export { loadConsumerProfile, saveConsumerProfile }
export { loadAgentProfile, saveAgentProfile }
export { saveAgentEssentials }

export function hasCompletedConsumerIntake(
	profile: ConsumerProfile | null | undefined,
) {
	return Boolean(
		profile?.preferredContactMethod ||
		profile?.involvementLevel ||
		profile?.representationPreference ||
		profile?.commissionComfort,
	)
}
