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

type ProfileType = 'buyer' | 'seller'

type QuestionnaireStatus = 'draft' | 'submitted'

type CategoryWeights = {
	'working-style': number
	communication: number
	transparency: number
	fit: number
}

type AnswerValue = number | number[] | string

type QuestionnaireAnswers = Record<string, AnswerValue>

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

export const consumers = pgTable(
	'consumers',
	{
		id: text().primaryKey().notNull(),
		userId: text('user_id').notNull(),
		type: text().$type<ProfileType>().notNull(),
		zipCodesJson: jsonb('zip_codes_json').$type<string[] | null>(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		uniqueIndex('consumers_user_id_index').on(table.userId),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: 'consumers_user_id_fk',
		}),
	],
)

export const consumerQuestionnaires = pgTable(
	'consumer_questionnaires',
	{
		id: text().primaryKey().notNull(),
		consumerId: text('consumer_id').notNull(),
		status: text().$type<QuestionnaireStatus>().notNull(),
		weightsJson: jsonb('weights_json').$type<CategoryWeights>().notNull(),
		answersJson: jsonb('answers_json').$type<QuestionnaireAnswers>().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		uniqueIndex('consumer_questionnaires_consumer_id_index').on(
			table.consumerId,
		),
		foreignKey({
			columns: [table.consumerId],
			foreignColumns: [consumers.id],
			name: 'consumer_questionnaires_consumer_id_fk',
		}),
	],
)

export const agents = pgTable(
	'agents',
	{
		id: text().primaryKey().notNull(),
		userId: text('user_id').notNull(),
		agency: text(),
		experience: text(),
		bio: text(),
		zipCodesJson: jsonb('zip_codes_json').$type<string[] | null>(),
		servicesJson: jsonb('services_json').$type<string[] | null>(),
		peacePactSigned: boolean('peace_pact_signed').default(false).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		uniqueIndex('agents_user_id_index').on(table.userId),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: 'agents_user_id_fk',
		}),
	],
)

export const agentQuestionnaires = pgTable(
	'agent_questionnaires',
	{
		id: text().primaryKey().notNull(),
		agentId: text('agent_id').notNull(),
		status: text().$type<QuestionnaireStatus>().notNull(),
		weightsJson: jsonb('weights_json').$type<CategoryWeights>().notNull(),
		answersJson: jsonb('answers_json').$type<QuestionnaireAnswers>().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	},
	(table) => [
		uniqueIndex('agent_questionnaires_agent_id_index').on(table.agentId),
		foreignKey({
			columns: [table.agentId],
			foreignColumns: [agents.id],
			name: 'agent_questionnaires_agent_id_fk',
		}),
	],
)
