import {
	consumers,
	consumerQuestionnaires,
	agents,
	agentQuestionnaires,
} from '@/db/tables'
import type { getDb } from '@/db/connection'
import { eq } from 'drizzle-orm'
import type {
	AgentProfileData,
	CategoryWeights,
	QuestionnaireAnswers,
	UserSettings,
} from './user-settings'

type Db = ReturnType<typeof getDb>

const DEFAULT_CONSUMER_TYPE = 'buyer'
const DEFAULT_STATUS = 'draft'

export async function getUserSettingsDb(
	db: Db,
	userId: string,
): Promise<UserSettings | null> {
	const [consumer, agent] = await Promise.all([
		findConsumerByUserId(db, userId),
		findAgentByUserId(db, userId),
	])

	if (!consumer && !agent) {
		return null
	}

	if (consumer && agent) {
		return consumer.updatedAt >= agent.updatedAt
			? getConsumerSettingsDb(db, consumer.id, consumer.updatedAt)
			: getAgentSettingsDb(db, agent.id, agent.updatedAt)
	}

	if (consumer) {
		return getConsumerSettingsDb(db, consumer.id, consumer.updatedAt)
	}

	return getAgentSettingsDb(db, agent!.id, agent!.updatedAt)
}

export async function saveUserSettingsDb(
	db: Db,
	userId: string,
	settings: UserSettings,
): Promise<void> {
	if (settings.role === 'agent') {
		await saveAgentSettingsDb(
			db,
			userId,
			settings.weights,
			settings.answers,
			settings.agentProfile,
		)
		return
	}

	await saveConsumerSettingsDb(db, userId, settings.weights, settings.answers)
}

export async function updateWeightsDb(
	db: Db,
	userId: string,
	weights: CategoryWeights,
): Promise<void> {
	const current = (await getUserSettingsDb(db, userId)) ?? getDefaultSettings()
	await saveUserSettingsDb(db, userId, { ...current, weights })
}

export async function updateAnswersDb(
	db: Db,
	userId: string,
	answers: QuestionnaireAnswers,
): Promise<void> {
	const current = (await getUserSettingsDb(db, userId)) ?? getDefaultSettings()
	await saveUserSettingsDb(db, userId, { ...current, answers })
}

export async function updateAgentProfileDb(
	db: Db,
	userId: string,
	profile: AgentProfileData,
): Promise<void> {
	const current =
		(await getUserSettingsDb(db, userId)) ?? getDefaultSettings('agent')
	await saveUserSettingsDb(db, userId, {
		...current,
		role: 'agent',
		agentProfile: profile,
	})
}

export async function resetUserSettingsDb(
	db: Db,
	userId: string,
): Promise<void> {
	const [consumer, agent] = await Promise.all([
		findConsumerByUserId(db, userId),
		findAgentByUserId(db, userId),
	])

	if (consumer) {
		await db
			.delete(consumerQuestionnaires)
			.where(eq(consumerQuestionnaires.consumerId, consumer.id))
		await db.delete(consumers).where(eq(consumers.id, consumer.id))
	}

	if (agent) {
		await db
			.delete(agentQuestionnaires)
			.where(eq(agentQuestionnaires.agentId, agent.id))
		await db.delete(agents).where(eq(agents.id, agent.id))
	}
}

async function getConsumerSettingsDb(
	db: Db,
	consumerId: string,
	consumerUpdatedAt: Date,
): Promise<UserSettings> {
	const questionnaire = await findConsumerQuestionnaireByConsumerId(
		db,
		consumerId,
	)
	const defaults = getDefaultSettings('consumer')

	return {
		role: 'consumer',
		weights: questionnaire?.weightsJson ?? defaults.weights,
		answers: questionnaire?.answersJson ?? defaults.answers,
		updatedAt: getLatestUpdatedAt(consumerUpdatedAt, questionnaire?.updatedAt),
	}
}

async function getAgentSettingsDb(
	db: Db,
	agentId: string,
	agentUpdatedAt: Date,
): Promise<UserSettings> {
	const [agent, questionnaire] = await Promise.all([
		findAgentById(db, agentId),
		findAgentQuestionnaireByAgentId(db, agentId),
	])
	const defaults = getDefaultSettings('agent')

	return {
		role: 'agent',
		weights: questionnaire?.weightsJson ?? defaults.weights,
		answers: questionnaire?.answersJson ?? defaults.answers,
		agentProfile: {
			experience: agent?.experience ?? '',
			zipCodes: formatZipCodes(agent?.zipCodesJson),
			services: agent?.servicesJson ?? [],
		},
		updatedAt: getLatestUpdatedAt(agentUpdatedAt, questionnaire?.updatedAt),
	}
}

async function saveConsumerSettingsDb(
	db: Db,
	userId: string,
	weights: CategoryWeights,
	answers: QuestionnaireAnswers,
): Promise<void> {
	const now = new Date()
	const consumer = await findConsumerByUserId(db, userId)
	const consumerId = consumer?.id ?? crypto.randomUUID()

	if (consumer) {
		await db
			.update(consumers)
			.set({
				type: consumer.type,
				zipCodesJson: consumer.zipCodesJson,
				updatedAt: now,
			})
			.where(eq(consumers.id, consumer.id))
	} else {
		await db.insert(consumers).values({
			id: consumerId,
			userId,
			type: DEFAULT_CONSUMER_TYPE,
			zipCodesJson: null,
			createdAt: now,
			updatedAt: now,
		})
	}

	const questionnaire = await findConsumerQuestionnaireByConsumerId(
		db,
		consumerId,
	)

	if (questionnaire) {
		await db
			.update(consumerQuestionnaires)
			.set({
				status: DEFAULT_STATUS,
				weightsJson: weights,
				answersJson: answers,
				updatedAt: now,
			})
			.where(eq(consumerQuestionnaires.id, questionnaire.id))
	} else {
		await db.insert(consumerQuestionnaires).values({
			id: crypto.randomUUID(),
			consumerId,
			status: DEFAULT_STATUS,
			weightsJson: weights,
			answersJson: answers,
			createdAt: now,
			updatedAt: now,
		})
	}
}

async function saveAgentSettingsDb(
	db: Db,
	userId: string,
	weights: CategoryWeights,
	answers: QuestionnaireAnswers,
	profile?: AgentProfileData,
): Promise<void> {
	const now = new Date()
	const agent = await findAgentByUserId(db, userId)
	const agentId = agent?.id ?? crypto.randomUUID()

	if (agent) {
		await db
			.update(agents)
			.set({
				experience: profile?.experience ?? agent.experience,
				zipCodesJson: profile
					? parseZipCodes(profile.zipCodes)
					: agent.zipCodesJson,
				servicesJson: profile?.services ?? agent.servicesJson,
				agency: agent.agency,
				bio: agent.bio,
				peacePactSigned: agent.peacePactSigned,
				updatedAt: now,
			})
			.where(eq(agents.id, agent.id))
	} else {
		await db.insert(agents).values({
			id: agentId,
			userId,
			agency: null,
			experience: profile?.experience ?? null,
			bio: null,
			zipCodesJson: profile ? parseZipCodes(profile.zipCodes) : null,
			servicesJson: profile?.services ?? null,
			peacePactSigned: false,
			createdAt: now,
			updatedAt: now,
		})
	}

	const questionnaire = await findAgentQuestionnaireByAgentId(db, agentId)

	if (questionnaire) {
		await db
			.update(agentQuestionnaires)
			.set({
				status: DEFAULT_STATUS,
				weightsJson: weights,
				answersJson: answers,
				updatedAt: now,
			})
			.where(eq(agentQuestionnaires.id, questionnaire.id))
	} else {
		await db.insert(agentQuestionnaires).values({
			id: crypto.randomUUID(),
			agentId,
			status: DEFAULT_STATUS,
			weightsJson: weights,
			answersJson: answers,
			createdAt: now,
			updatedAt: now,
		})
	}
}

function getLatestUpdatedAt(primary: Date, secondary?: Date): string {
	return (secondary && secondary > primary ? secondary : primary).toISOString()
}

function parseZipCodes(value: string): string[] | null {
	const zipCodes = value
		.split(',')
		.map((zipCode) => zipCode.trim())
		.filter(Boolean)

	return zipCodes.length > 0 ? zipCodes : null
}

function formatZipCodes(value?: string[] | null): string {
	return value?.join(', ') ?? ''
}

async function findConsumerByUserId(db: Db, userId: string) {
	const [consumer] = await db
		.select()
		.from(consumers)
		.where(eq(consumers.userId, userId))
	return consumer
}

async function findAgentByUserId(db: Db, userId: string) {
	const [agent] = await db
		.select()
		.from(agents)
		.where(eq(agents.userId, userId))
	return agent
}

async function findAgentById(db: Db, agentId: string) {
	const [agent] = await db.select().from(agents).where(eq(agents.id, agentId))
	return agent
}

async function findConsumerQuestionnaireByConsumerId(
	db: Db,
	consumerId: string,
) {
	const [questionnaire] = await db
		.select()
		.from(consumerQuestionnaires)
		.where(eq(consumerQuestionnaires.consumerId, consumerId))
	return questionnaire
}

async function findAgentQuestionnaireByAgentId(db: Db, agentId: string) {
	const [questionnaire] = await db
		.select()
		.from(agentQuestionnaires)
		.where(eq(agentQuestionnaires.agentId, agentId))
	return questionnaire
}

function getDefaultSettings(
	role: 'consumer' | 'agent' = 'consumer',
): UserSettings {
	return {
		role,
		weights: {
			'working-style': 3,
			communication: 3,
			transparency: 3,
			fit: 3,
		},
		answers:
			role === 'consumer'
				? {
						'B.1': 1,
						'B.2': 2,
						'B.3': 0,
						'B.4': 1,
						'B.5': 2,
						'B.6': 0,
						'B.7': 1,
						'B.8': 0,
						'B.9': 2,
						'B.10': 1,
						'B.11': 0,
						'B.12': 1,
						'B.13': 0,
						'B.14': 2,
					}
				: {
						'A.1': 0,
						'A.2': 1,
						'A.3': 2,
						'A.4': 0,
						'A.5': 1,
						'A.6': 0,
						'A.7': 2,
						'A.8': 1,
						'A.9': 0,
						'A.10': 1,
						'A.11': 0,
						'A.12': 2,
					},
		updatedAt: new Date().toISOString(),
	}
}
