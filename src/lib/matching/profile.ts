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

const consumerProfileCreateSchema = createInsertSchema(consumerProfiles)
	.omit({
		id: true,
		userId: true,
		createdAt: true,
		updatedAt: true,
	})
	.extend({
		intent: z.enum(['buying', 'selling', 'both']),
		status: z.enum(['draft', 'essentials_submitted', 'active', 'enriched']),
	})

const agentProfileCreateSchema = createInsertSchema(agentProfiles)
	.omit({
		id: true,
		userId: true,
		createdAt: true,
		updatedAt: true,
	})
	.extend({
		representationSide: z.enum(['buying', 'selling', 'both']),
	})

export type ConsumerProfileCreateInput = z.infer<
	typeof consumerProfileCreateSchema
>

export type AgentProfileCreateInput = z.infer<typeof agentProfileCreateSchema>

export type ConsumerProfileUpdate = Partial<ConsumerProfileCreateInput>

export type AgentProfileUpdate = Partial<AgentProfileCreateInput>

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

const upsertConsumerProfile = createServerFn({ method: 'POST' })
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

		const insert = consumerProfileCreateSchema.parse({
			...data,
			status: data.status ?? 'draft',
		})

		await db.insert(consumerProfiles).values({
			id: crypto.randomUUID(),
			userId,
			...insert,
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
	.validator((data: unknown) => agentProfileCreateSchema.parse(data))
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

const createConsumerProfileFromDraft = createServerFn({ method: 'POST' })
	.validator((data: ConsumerProfileUpdate) => data)
	.handler(async ({ data }) => {
		await requireUserId()
		const createInput = consumerProfileCreateSchema.parse({
			...data,
			status: 'active',
		})

		await upsertConsumerProfile({ data: createInput })

		return { success: true }
	})

const completeAgentSignup = createServerFn({ method: 'POST' })
	.validator((data: unknown) => agentProfileCreateSchema.parse(data))
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
		return { success: true }
	})

export {
	agentProfileColumns,
	consumerProfileColumns,
} from '@/lib/matching/profile.db'

export {
	consumerProfileCreateSchema,
	agentProfileCreateSchema,
	loadConsumerProfile,
	upsertConsumerProfile,
	loadAgentProfile,
	createAgentProfile,
	updateAgentProfile,
	createConsumerProfileFromDraft,
	completeAgentSignup,
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
