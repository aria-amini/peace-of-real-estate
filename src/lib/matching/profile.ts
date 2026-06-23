import { createServerFn } from '@tanstack/react-start'
import { createInsertSchema } from 'drizzle-zod'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

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

const agentProfileCreateSchema = createInsertSchema(agentProfiles)
	.omit({
		id: true,
		userId: true,
		createdAt: true,
		updatedAt: true,
	})
	.partial({
		email: true,
		phone: true,
		businessAddress: true,
		billingAddress: true,
		yearsLicensed: true,
		averageTransactions: true,
		employmentStatus: true,
		licenseProof: true,
		clientFirstTerms: true,
		peacePactSignedAt: true,
		valueProposition: true,
		idealClientDescription: true,
		whyIStarted: true,
		typicalDayInDeal: true,
		hardNo: true,
		valueBeyondTransaction: true,
		communicationCadence: true,
		quickContactStyle: true,
		updateDeliveryStyle: true,
		responseTime: true,
		transparencyStyle: true,
		clientBoundaryStyle: true,
		negotiationEthic: true,
		dualAgencyStyle: true,
		energyStyle: true,
		teachingStyle: true,
		dealStressStyle: true,
		decisionMakingStyle: true,
		serviceDepth: true,
		involvementLevel: true,
		representationPreference: true,
		notFitFor: true,
	})
	.extend({
		representationSide: z.enum(['buying', 'selling', 'both']),
	})

export type AgentProfileCreateInput = z.infer<typeof agentProfileCreateSchema>

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

const createAgentProfile = createServerFn({ method: 'POST' })
	.validator((data: AgentProfileCreateInput) => data)
	.handler(async ({ data }) => {
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

		const insert = {
			id: crypto.randomUUID(),
			userId,
			...data,
			createdAt: now,
			updatedAt: now,
		} satisfies AgentProfileInsert

		await db.insert(agentProfiles).values(insert)
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
