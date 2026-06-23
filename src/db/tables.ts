import {
	boolean,
	check,
	foreignKey,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from 'drizzle-orm/pg-core'

import { sql } from 'drizzle-orm'

import {
	agentProfileColumns,
	consumerProfileColumns,
	sharedProfileColumns,
} from '@/lib/matching/profile.columns'

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

export const consumerProfiles = pgTable(
	'consumer_profiles',
	{
		id: text().primaryKey().notNull(),
		userId: text('user_id').notNull(),
		...sharedProfileColumns,
		...consumerProfileColumns,
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		uniqueIndex('consumer_profiles_user_id_index').on(table.userId),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: 'consumer_profiles_user_id_fk',
		}),
		check(
			'consumer_profiles_status_check',
			sql`${table.status} in ('draft', 'essentials_submitted', 'active', 'enriched')`,
		),
		check(
			'consumer_profiles_intent_check',
			sql`${table.intent} in ('buying', 'selling', 'both')`,
		),
	],
)

export const agentProfiles = pgTable(
	'agent_profiles',
	{
		id: text().primaryKey().notNull(),
		userId: text('user_id').notNull(),
		...sharedProfileColumns,
		...agentProfileColumns,
		firstName: text('first_name'),
		lastName: text('last_name'),
		brokerageName: text('brokerage_name'),
		email: text(),
		phone: text(),
		businessAddress: text('business_address'),
		billingAddress: text('billing_address'),
		licenseNumberState: text('license_number_state'),
		serviceAreas: text('service_areas').array().notNull().default([]),
		yearsLicensed: text('years_licensed'),
		averageTransactions: text('average_transactions'),
		employmentStatus: text('employment_status'),
		licenseProof: text('license_proof'),
		clientFirstTerms: text('client_first_terms'),
		usePaxWriter: boolean('use_pax_writer').default(true).notNull(),
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
		check(
			'agent_profiles_status_check',
			sql`${table.status} in ('draft', 'essentials_submitted', 'active', 'enriched')`,
		),
		check(
			'agent_profiles_representation_side_check',
			sql`${table.representationSide} is null or ${table.representationSide} in ('buying', 'selling', 'both')`,
		),
	],
)

export const cities = pgTable(
	'cities',
	{
		id: text().primaryKey().notNull(),
		city: text().notNull(),
		state: text().notNull(),
		centerLat: text('center_lat').notNull(),
		centerLng: text('center_lng').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		uniqueIndex('cities_city_state_index').on(table.city, table.state),
		index('cities_state_index').on(table.state),
	],
)

export const cityZips = pgTable(
	'city_zips',
	{
		id: text().primaryKey().notNull(),
		city: text().notNull(),
		state: text().notNull(),
		zip: text().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		index('city_zips_city_state_index').on(table.city, table.state),
		uniqueIndex('city_zips_city_state_zip_index').on(
			table.city,
			table.state,
			table.zip,
		),
		index('city_zips_zip_index').on(table.zip),
	],
)
