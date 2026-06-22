import { text } from 'drizzle-orm/pg-core'

export type ProfileStatus = 'draft' | 'submitted' | 'active'

export type RepresentationSide = 'buying' | 'selling' | 'both'

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

export const agentProfileColumns = {
	representationSide: text('representation_side').$type<RepresentationSide>(),
	typicalPriceRange: text('typical_price_range'),
	bestClientTypes: text('best_client_types').array().notNull().default([]),
	notFitFor: text('not_fit_for'),
	workingStyle: text('working_style'),
	dealStressStyle: text('deal_stress_style'),
	communicationCadence: text('communication_cadence'),
	quickContactStyle: text('quick_contact_style'),
	updateDeliveryStyle: text('update_delivery_style'),
	responseTime: text('response_time'),
	commissionStyle: text('commission_style'),
	dualAgencyStyle: text('dual_agency_style'),
}
