import {
	agents,
	agentQuestionnaires,
	consumers,
	consumerQuestionnaires,
	user,
} from '@/db/tables'
import {
	getUserSettingsDb,
	resetUserSettingsDb,
	updateAgentProfileDb,
	updateAnswersDb,
	updateWeightsDb,
} from '@/lib/user-settings.db'
import { initDb, test } from '@aamini/config/test/db'
import { eq } from 'drizzle-orm'
import { describe, expect } from 'vite-plus/test'

const consumerUserId = 'consumer-user'
const agentUserId = 'agent-user'

initDb(async (db) => {
	const now = new Date('2026-04-21T12:00:00.000Z')

	await db.insert(user).values([
		{
			id: consumerUserId,
			name: 'Consumer User',
			email: 'consumer@example.com',
			emailVerified: true,
			image: null,
			createdAt: now,
			updatedAt: now,
		},
		{
			id: agentUserId,
			name: 'Agent User',
			email: 'agent@example.com',
			emailVerified: true,
			image: null,
			createdAt: now,
			updatedAt: now,
		},
	])
	await db.insert(consumers).values({
		id: 'consumer-1',
		userId: consumerUserId,
		type: 'buyer',
		zipCodesJson: ['78701'],
		createdAt: now,
		updatedAt: new Date('2026-04-21T12:01:00.000Z'),
	})
	await db.insert(consumerQuestionnaires).values({
		id: 'consumer-questionnaire-1',
		consumerId: 'consumer-1',
		status: 'submitted',
		weightsJson: {
			'working-style': 5,
			communication: 4,
			transparency: 3,
			fit: 2,
		},
		answersJson: {
			'B.1': 1,
			'B.10': [0, 2],
		},
		createdAt: now,
		updatedAt: new Date('2026-04-21T12:02:00.000Z'),
	})
})

describe('user settings db tests', () => {
	test('loads consumer settings from persistence tables', async ({ db }) => {
		const settings = await getUserSettingsDb(db, consumerUserId)

		expect(settings).toEqual({
			role: 'consumer',
			weights: {
				'working-style': 5,
				communication: 4,
				transparency: 3,
				fit: 2,
			},
			answers: {
				'B.1': 1,
				'B.10': [0, 2],
			},
			updatedAt: '2026-04-21T12:02:00.000Z',
		})
	})

	test('creates agent profile and questionnaire on first agent write', async ({
		db,
	}) => {
		await updateAgentProfileDb(db, agentUserId, {
			experience: '7 years',
			zipCodes: '78701, 78704',
			services: ['Buyer Representation', 'Luxury Homes'],
		})

		const settings = await getUserSettingsDb(db, agentUserId)
		const [agent] = await db
			.select()
			.from(agents)
			.where(eq(agents.userId, agentUserId))
		const [questionnaire] = await db
			.select()
			.from(agentQuestionnaires)
			.where(eq(agentQuestionnaires.agentId, agent!.id))

		expect(agent).toMatchObject({
			userId: agentUserId,
			experience: '7 years',
			zipCodesJson: ['78701', '78704'],
			servicesJson: ['Buyer Representation', 'Luxury Homes'],
		})
		expect(questionnaire).toMatchObject({
			status: 'draft',
		})
		expect(settings).toMatchObject({
			role: 'agent',
			agentProfile: {
				experience: '7 years',
				zipCodes: '78701, 78704',
				services: ['Buyer Representation', 'Luxury Homes'],
			},
		})
	})

	test('updates consumer questionnaire without duplicating rows', async ({
		db,
	}) => {
		await updateWeightsDb(db, consumerUserId, {
			'working-style': 1,
			communication: 2,
			transparency: 3,
			fit: 4,
		})
		await updateAnswersDb(db, consumerUserId, {
			'B.1': 2,
			'B.10': [1, 3],
			'B.14': 0,
		})

		const settings = await getUserSettingsDb(db, consumerUserId)
		const questionnaires = await db
			.select()
			.from(consumerQuestionnaires)
			.where(eq(consumerQuestionnaires.consumerId, 'consumer-1'))

		expect(questionnaires).toHaveLength(1)
		expect(settings).toMatchObject({
			role: 'consumer',
			weights: {
				'working-style': 1,
				communication: 2,
				transparency: 3,
				fit: 4,
			},
			answers: {
				'B.1': 2,
				'B.10': [1, 3],
				'B.14': 0,
			},
		})
	})

	test('resets persisted rows for both roles', async ({ db }) => {
		await updateAgentProfileDb(db, agentUserId, {
			experience: '2 years',
			zipCodes: '73301',
			services: ['First-time Buyers'],
		})

		await resetUserSettingsDb(db, consumerUserId)
		await resetUserSettingsDb(db, agentUserId)

		expect(await getUserSettingsDb(db, consumerUserId)).toBeNull()
		expect(await getUserSettingsDb(db, agentUserId)).toBeNull()
		expect(await db.select().from(consumers)).toHaveLength(0)
		expect(await db.select().from(consumerQuestionnaires)).toHaveLength(0)
		expect(await db.select().from(agents)).toHaveLength(0)
		expect(await db.select().from(agentQuestionnaires)).toHaveLength(0)
	})
})
