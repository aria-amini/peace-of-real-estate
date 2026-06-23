import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { db } from '@/db/connection'
import { agentProfiles, consumerProfiles } from '@/db/tables'
import { requireUserId } from '@/lib/auth/functions'

export type {
	ConsumerProfileStatus,
	RepresentationSide,
} from '@/lib/matching/profile.db'

export type ConsumerProfile = typeof consumerProfiles.$inferSelect

export type ConsumerProfileInsert = typeof consumerProfiles.$inferInsert

export type AgentProfile = typeof agentProfiles.$inferSelect

export type AgentProfileInsert = typeof agentProfiles.$inferInsert

export type ConsumerProfileUpdate = Partial<
	Omit<ConsumerProfileInsert, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>

export type AgentProfileUpdate = Partial<
	Omit<AgentProfileInsert, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>

const loadConsumerProfile = createServerFn({ method: 'GET' }).handler(
	async () => {
		const userId = await requireUserId()
		const [profile] = await db
			.select()
			.from(consumerProfiles)
			.where(eq(consumerProfiles.userId, userId))
			.limit(1)
		return profile ?? null
	},
)

const saveConsumerProfile = createServerFn({ method: 'POST' })
	.validator((data: ConsumerProfileUpdate) => data)
	.handler(async ({ data }) => {
		const userId = await requireUserId()
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
	const [profile] = await db
		.select()
		.from(agentProfiles)
		.where(eq(agentProfiles.userId, userId))
		.limit(1)
	return profile ?? null
})

export function isAgentProfileComplete(data: AgentProfileUpdate) {
	return Boolean(
		data.firstName?.trim() &&
		data.lastName?.trim() &&
		data.brokerageName?.trim() &&
		data.licenseNumberState?.trim() &&
		data.city?.trim() &&
		data.state?.trim() &&
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

const createAgentProfile = createServerFn({ method: 'POST' })
	.validator((data: AgentProfileUpdate) => data)
	.handler(async ({ data }) => {
		if (!isAgentProfileComplete(data)) {
			throw new Error('Agent profile is incomplete')
		}

		const userId = await requireUserId()
		const now = new Date()

		const existing = await db
			.select({ id: agentProfiles.id })
			.from(agentProfiles)
			.where(eq(agentProfiles.userId, userId))
			.limit(1)

		if (existing[0]) {
			throw new Error('Agent profile already exists')
		}

		await db.insert(agentProfiles).values({
			id: crypto.randomUUID(),
			userId,
			usePaxWriter: data.usePaxWriter ?? true,
			licenseAttested: data.licenseAttested ?? false,
			peacePactSigned: data.peacePactSigned ?? false,
			...data,
			createdAt: now,
			updatedAt: now,
		})
	})

const updateAgentProfile = createServerFn({ method: 'POST' })
	.validator((data: AgentProfileUpdate) => data)
	.handler(async ({ data }) => {
		const userId = await requireUserId()
		const now = new Date()

		const existing = await db
			.select({ id: agentProfiles.id })
			.from(agentProfiles)
			.where(eq(agentProfiles.userId, userId))
			.limit(1)

		if (!existing[0]) {
			throw new Error('Agent profile not found')
		}

		await db
			.update(agentProfiles)
			.set({ ...data, updatedAt: now })
			.where(eq(agentProfiles.id, existing[0].id))
	})

export {
	agentProfileColumns,
	consumerProfileColumns,
} from '@/lib/matching/profile.db'

export {
	loadConsumerProfile,
	saveConsumerProfile,
	loadAgentProfile,
	createAgentProfile,
	updateAgentProfile,
}

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
