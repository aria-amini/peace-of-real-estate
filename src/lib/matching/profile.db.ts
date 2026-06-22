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
			deepProfileStatus: data.deepProfileStatus ?? 'not_started',
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

function computeDeepProfileStatus(
	data: AgentProfileUpdate,
): 'not_started' | 'in_progress' | 'complete' {
	const subjectiveFields = [
		data.communicationCadence,
		data.quickContactStyle,
		data.updateDeliveryStyle,
		data.responseTime,
		data.transparencyStyle,
		data.clientBoundaryStyle,
		data.negotiationEthic,
		data.dualAgencyStyle,
		data.energyStyle,
		data.teachingStyle,
		data.dealStressStyle,
		data.decisionMakingStyle,
		data.serviceDepth,
		data.involvementLevel,
		data.representationPreference,
	]
	const subjectiveComplete = subjectiveFields.every(Boolean)
	const narrativeComplete = Boolean(
		data.valueProposition?.trim() || data.whyIStarted?.trim(),
	)
	const prioritiesSet =
		data.matchPriorities !== undefined && data.matchPriorities.length > 0

	if (subjectiveComplete && narrativeComplete && prioritiesSet)
		return 'complete'
	if (subjectiveFields.some(Boolean) || narrativeComplete || prioritiesSet)
		return 'in_progress'
	return 'not_started'
}

const saveAgentEssentialsServer = createServerFn({ method: 'POST' })
	.inputValidator((data) => data as AgentProfileUpdate)
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
			deepProfileStatus: 'not_started',
			...data,
			createdAt: now,
			updatedAt: now,
		})
	})

const saveAgentDeepProfileServer = createServerFn({ method: 'POST' })
	.inputValidator((data) => data as AgentProfileUpdate)
	.handler(async ({ data }) => {
		const userId = await requireUserId()
		const db = getDb()
		const now = new Date()

		const deepProfileStatus = computeDeepProfileStatus(data)
		const status = deepProfileStatus === 'complete' ? 'enriched' : 'active'

		const existing = await db
			.select({ id: agentProfiles.id })
			.from(agentProfiles)
			.where(eq(agentProfiles.userId, userId))
			.limit(1)

		if (existing[0]) {
			await db
				.update(agentProfiles)
				.set({
					...data,
					status,
					deepProfileStatus,
					deepProfileCompletedAt:
						deepProfileStatus === 'complete' ? now : undefined,
					updatedAt: now,
				})
				.where(eq(agentProfiles.id, existing[0].id))
			return
		}

		await db.insert(agentProfiles).values({
			id: crypto.randomUUID(),
			userId,
			status,
			deepProfileStatus,
			deepProfileCompletedAt:
				deepProfileStatus === 'complete' ? now : undefined,
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

export async function saveAgentEssentials(update: AgentProfileUpdate) {
	await saveAgentEssentialsServer({ data: update })
}

export async function saveAgentDeepProfile(update: AgentProfileUpdate) {
	await saveAgentDeepProfileServer({ data: update })
}
