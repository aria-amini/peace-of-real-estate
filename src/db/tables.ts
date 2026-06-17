import {
	boolean,
	foreignKey,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from 'drizzle-orm/pg-core'

type ProfileStatus = 'draft' | 'submitted' | 'active'

type EntitlementKey = 'consumer_lifetime_premium' | 'agent_subscription'

type EntitlementSource = 'manual' | 'stripe_checkout' | 'stripe_subscription'

export const user = pgTable(
	'user',
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		email: text().notNull(),
		emailVerified: boolean('email_verified').default(false).notNull(),
		image: text(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [uniqueIndex('user_email_index').on(table.email)],
)

export const userEntitlements = pgTable(
	'user_entitlements',
	{
		id: text().primaryKey().notNull(),
		userId: text('user_id').notNull(),
		key: text().$type<EntitlementKey>().notNull(),
		source: text().$type<EntitlementSource>().notNull(),
		stripeCustomerId: text('stripe_customer_id'),
		stripePaymentIntentId: text('stripe_payment_intent_id'),
		stripeSubscriptionId: text('stripe_subscription_id'),
		startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
		endsAt: timestamp('ends_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		index('user_entitlements_user_id_index').using('btree', table.userId),
		uniqueIndex('user_entitlements_user_key_index').on(table.userId, table.key),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: 'user_entitlements_user_id_fk',
		}),
	],
)

export const session = pgTable(
	'session',
	{
		id: text().primaryKey().notNull(),
		userId: text('user_id').notNull(),
		token: text().notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		uniqueIndex('session_token_index').on(table.token),
		index('session_user_id_index').using('btree', table.userId),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: 'session_user_id_fk',
		}),
	],
)

export const account = pgTable(
	'account',
	{
		id: text().primaryKey().notNull(),
		userId: text('user_id').notNull(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at', {
			withTimezone: true,
		}),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
			withTimezone: true,
		}),
		scope: text(),
		idToken: text('id_token'),
		password: text(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		index('account_user_id_index').using('btree', table.userId),
		uniqueIndex('account_provider_account_index').on(
			table.providerId,
			table.accountId,
		),
		index('account_provider_index').using(
			'btree',
			table.providerId,
			table.accountId,
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: 'account_user_id_fk',
		}),
	],
)

export const verification = pgTable(
	'verification',
	{
		id: text().primaryKey().notNull(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		index('verification_identifier_index').using('btree', table.identifier),
	],
)

export const buyerProfiles = pgTable(
	'buyer_profiles',
	{
		id: text().primaryKey().notNull(),
		userId: text('user_id').notNull(),
		status: text().$type<ProfileStatus>().default('draft').notNull(),
		location: text(),
		priceRange: text('price_range'),
		propertyTypesJson: jsonb('property_types_json').$type<string[] | null>(),
		intent: text(),
		experienceLevel: text('experience_level'),
		preferredContactMethod: text('preferred_contact_method'),
		updateDeliveryPreference: text('update_delivery_preference'),
		responseTimeExpectation: text('response_time_expectation'),
		agentRolePreference: text('agent_role_preference'),
		involvementLevel: text('involvement_level'),
		decisionStyle: text('decision_style'),
		toughLossPreference: text('tough_loss_preference'),
		agentNonNegotiablesJson: jsonb('agent_non_negotiables_json').$type<
			string[] | null
		>(),
		representationPreference: text('representation_preference'),
		commissionComfort: text('commission_comfort'),
		matchPrioritiesJson: jsonb('match_priorities_json').$type<
			string[] | null
		>(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		uniqueIndex('buyer_profiles_user_id_index').on(table.userId),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: 'buyer_profiles_user_id_fk',
		}),
	],
)

export const sellerProfiles = pgTable(
	'seller_profiles',
	{
		id: text().primaryKey().notNull(),
		userId: text('user_id').notNull(),
		status: text().$type<ProfileStatus>().default('draft').notNull(),
		location: text(),
		estimatedHomeValue: text('estimated_home_value'),
		propertyTypesJson: jsonb('property_types_json').$type<string[] | null>(),
		sellingSituation: text('selling_situation'),
		experienceLevel: text('experience_level'),
		preferredContactStyle: text('preferred_contact_style'),
		updateDeliveryPreference: text('update_delivery_preference'),
		updateCadence: text('update_cadence'),
		responseTimeExpectation: text('response_time_expectation'),
		successDefinition: text('success_definition'),
		involvementLevel: text('involvement_level'),
		homeRelationship: text('home_relationship'),
		agentSuccessSignalsJson: jsonb('agent_success_signals_json').$type<
			string[] | null
		>(),
		representationPreference: text('representation_preference'),
		commissionComfort: text('commission_comfort'),
		matchPrioritiesJson: jsonb('match_priorities_json').$type<
			string[] | null
		>(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		uniqueIndex('seller_profiles_user_id_index').on(table.userId),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: 'seller_profiles_user_id_fk',
		}),
	],
)

export const agentProfiles = pgTable(
	'agent_profiles',
	{
		id: text().primaryKey().notNull(),
		userId: text('user_id').notNull(),
		status: text().$type<ProfileStatus>().default('draft').notNull(),
		representationSide: text('representation_side'),
		typicalPriceRange: text('typical_price_range'),
		bestClientTypesJson: jsonb('best_client_types_json').$type<
			string[] | null
		>(),
		notFitFor: text('not_fit_for'),
		workingStyle: text('working_style'),
		dealStressStyle: text('deal_stress_style'),
		communicationCadence: text('communication_cadence'),
		quickContactStyle: text('quick_contact_style'),
		updateDeliveryStyle: text('update_delivery_style'),
		responseTime: text('response_time'),
		commissionStyle: text('commission_style'),
		dualAgencyStyle: text('dual_agency_style'),
		firstName: text('first_name'),
		lastName: text('last_name'),
		brokerageName: text('brokerage_name'),
		email: text(),
		phone: text(),
		businessAddress: text('business_address'),
		billingAddress: text('billing_address'),
		licenseNumberState: text('license_number_state'),
		serviceArea1: text('service_area_1'),
		serviceArea2: text('service_area_2'),
		serviceArea3: text('service_area_3'),
		yearsLicensed: text('years_licensed'),
		averageTransactions: text('average_transactions'),
		employmentStatus: text('employment_status'),
		licenseProof: text('license_proof'),
		clientFirstTerms: text('client_first_terms'),
		valueProposition: text('value_proposition'),
		usePaxWriter: boolean('use_pax_writer').default(true).notNull(),
		introVideo: text('intro_video'),
		licenseAttested: boolean('license_attested').default(false).notNull(),
		eoInsuranceStatus: text('eo_insurance_status'),
		peacePactSigned: boolean('peace_pact_signed').default(false).notNull(),
		peacePactSignature: text('peace_pact_signature'),
		peacePactSignedAt: timestamp('peace_pact_signed_at', {
			withTimezone: true,
		}),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		uniqueIndex('agent_profiles_user_id_index').on(table.userId),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: 'agent_profiles_user_id_fk',
		}),
	],
)
