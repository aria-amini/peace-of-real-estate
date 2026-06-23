import { text } from 'drizzle-orm/pg-core'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { getDb } from '@/db/connection'
import { agentProfiles, consumerProfiles } from '@/db/tables'
import { requireUserId } from '@/lib/auth/functions'

export type ProfileStatus =
	| 'draft'
	| 'essentials_submitted'
	| 'active'
	| 'enriched'

export type ProfileRole = 'consumer' | 'agent'

export type RepresentationSide = 'buying' | 'selling' | 'both'

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

export const sharedProfileColumns = {
	status: text().$type<ProfileStatus>().default('draft').notNull(),
}

export const consumerProfileColumns = {
	intent: text().$type<RepresentationSide>().notNull(),
	location: text(),
	state: text(),
	priceRange: text('price_range'),
	estimatedHomeValue: text('estimated_home_value'),
	propertyTypes: text('property_types').array(),
	experienceLevel: text('experience_level'),
	preferredContactMethod: text('preferred_contact_method'),
	involvementLevel: text('involvement_level'),
	representationPreference: text('representation_preference'),
	commissionComfort: text('commission_comfort'),
	matchPriorities: text('match_priorities').array(),
	matchDetails: text('match_details'),
}

export const agentCoreProfileColumns = {
	representationSide: text('representation_side').$type<RepresentationSide>(),
	typicalPriceRange: text('typical_price_range'),
	bestClientTypes: text('best_client_types').array().notNull().default([]),
	notFitFor: text('not_fit_for'),
}

export const agentSubjectiveProfileColumns = {
	communicationCadence: text('communication_cadence'),
	quickContactStyle: text('quick_contact_style'),
	updateDeliveryStyle: text('update_delivery_style'),
	responseTime: text('response_time'),
	transparencyStyle: text('transparency_style'),
	clientBoundaryStyle: text('client_boundary_style'),
	negotiationEthic: text('negotiation_ethic'),
	dualAgencyStyle: text('dual_agency_style'),
	energyStyle: text('energy_style'),
	teachingStyle: text('teaching_style'),
	dealStressStyle: text('deal_stress_style'),
	decisionMakingStyle: text('decision_making_style'),
	serviceDepth: text('service_depth'),
	involvementLevel: text('involvement_level'),
	representationPreference: text('representation_preference'),
	matchPriorities: text('match_priorities').array().notNull().default([]),
}

export const agentNarrativeProfileColumns = {
	valueProposition: text('value_proposition'),
	idealClientDescription: text('ideal_client_description'),
	whyIStarted: text('why_i_started'),
	typicalDayInDeal: text('typical_day_in_deal'),
	hardNo: text('hard_no'),
	valueBeyondTransaction: text('value_beyond_transaction'),
}

export const agentProfileColumns = {
	...agentCoreProfileColumns,
	...agentSubjectiveProfileColumns,
	...agentNarrativeProfileColumns,
}

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

export {
	loadConsumerProfile,
	saveConsumerProfile,
	loadAgentProfile,
	saveAgentProfile,
	saveAgentEssentials,
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
