import { boolean, text, timestamp } from 'drizzle-orm/pg-core'

export type ConsumerProfileStatus =
	| 'draft'
	| 'essentials_submitted'
	| 'active'
	| 'enriched'

export type RepresentationSide = 'buying' | 'selling' | 'both'

export const consumerLifecycleColumns = {
	status: text().$type<ConsumerProfileStatus>().default('draft').notNull(),
}

export const consumerProfileColumns = {
	intent: text().$type<RepresentationSide>().notNull(),
	state: text(),
	city: text(),
	zipCodes: text('zip_codes').array().notNull().default([]),
	timeline: text(),
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
	representationSide: text('representation_side')
		.$type<RepresentationSide>()
		.notNull(),
	city: text().notNull(),
	state: text().notNull(),
	typicalPriceRange: text('typical_price_range').notNull(),
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
	clientFirstTerms: text('client_first_terms'),
}

export const agentIdentityColumns = {
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	brokerageName: text('brokerage_name').notNull(),
	email: text(),
	phone: text(),
	businessAddress: text('business_address'),
	billingAddress: text('billing_address'),
	licenseNumberState: text('license_number_state').notNull(),
	zipCodes: text('zip_codes').array().notNull().default([]),
	yearsLicensed: text('years_licensed'),
	averageTransactions: text('average_transactions'),
	employmentStatus: text('employment_status'),
	licenseProof: text('license_proof'),
}

export const agentComplianceColumns = {
	usePaxWriter: boolean('use_pax_writer').default(true).notNull(),
	licenseAttested: boolean('license_attested').default(false).notNull(),
	eoInsuranceStatus: text('eo_insurance_status').notNull(),
	peacePactSigned: boolean('peace_pact_signed').default(false).notNull(),
	peacePactSignature: text('peace_pact_signature').notNull(),
	peacePactSignedAt: timestamp('peace_pact_signed_at', {
		withTimezone: true,
	}),
}

export const agentProfileColumns = {
	...agentCoreProfileColumns,
	...agentSubjectiveProfileColumns,
	...agentNarrativeProfileColumns,
	...agentIdentityColumns,
	...agentComplianceColumns,
}
