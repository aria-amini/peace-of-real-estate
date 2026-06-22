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

const loadConsumerProfileServer = createServerFn({ method: 'GET' }).handler(
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

const saveConsumerProfileServer = createServerFn({ method: 'POST' })
	.inputValidator((data) => data as ConsumerProfileUpdate)
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

const loadAgentProfileServer = createServerFn({ method: 'GET' }).handler(
	async () => {
		const userId = await requireUserId()
		const db = getDb()
		const [profile] = await db
			.select()
			.from(agentProfiles)
			.where(eq(agentProfiles.userId, userId))
			.limit(1)
		return profile ?? null
	},
)

const saveAgentProfileServer = createServerFn({ method: 'POST' })
	.inputValidator((data) => data as AgentProfileUpdate)
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

export async function loadConsumerProfile() {
	return loadConsumerProfileServer()
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

export async function saveConsumerProfile(update: ConsumerProfileUpdate) {
	await saveConsumerProfileServer({ data: update })
}

export async function loadAgentProfile() {
	return loadAgentProfileServer()
}

export async function saveAgentProfile(update: AgentProfileUpdate) {
	await saveAgentProfileServer({ data: update })
}
