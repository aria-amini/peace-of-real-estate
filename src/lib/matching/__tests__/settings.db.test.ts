import { agentProfiles, buyerProfiles, user } from '@/db/tables'
import {
	getUserSettingsDb,
	resetUserSettingsDb,
	updateAgentProfileDb,
	updateAnswersDb,
} from '@/lib/matching/settings.db'
import { initDb, test } from '@config/test/db'
import { eq } from 'drizzle-orm'
import { describe, expect } from '@config/test/db'

const buyerUserId = 'buyer-user'
const agentUserId = 'agent-user'

initDb(async (db) => {
	const now = new Date('2026-04-21T12:00:00.000Z')

	await db.insert(user).values([
		{
			id: buyerUserId,
			name: 'Buyer User',
			email: 'buyer@example.com',
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

	await db.insert(buyerProfiles).values({
		id: 'buyer-profile-1',
		userId: buyerUserId,
		status: 'submitted',
		location: 'Austin, TX 78701',
		priceRange: '$400k to $750k',
		propertyTypesJson: ['Single-Family'],
		intent: 'Buy a Home',
		experienceLevel: "I've done this before",
		preferredContactMethod: 'Text',
		agentNonNegotiablesJson: [
			'Market expert - know this market cold',
			"Responds fast - I won't wonder where they are",
		],
		createdAt: now,
		updatedAt: new Date('2026-04-21T12:02:00.000Z'),
	})
})

describe('user settings db tests', () => {
	test('loads buyer settings from buyer profile table', async ({ db }) => {
		const settings = await getUserSettingsDb(db, buyerUserId)

		expect(settings).toMatchObject({
			role: 'consumer',
			flowKind: 'buyer',
			zipCode: 'Austin, TX 78701',
			priceRange: '$400k to $750k',
			propertyType: ['Single-Family'],
			intent: 'Buy a Home',
			experienceLevel: "I've done this before",
			answers: {
				'B.1': 1,
				'B.4': 1,
				'B.6': 0,
				'B.10': [0, 2],
			},
			updatedAt: '2026-04-21T12:02:00.000Z',
		})
	})

	test('creates agent profile on first agent write', async ({ db }) => {
		await updateAgentProfileDb(db, agentUserId, {
			firstName: 'Avery',
			lastName: 'Agent',
			brokerageName: 'Horizon Realty',
			serviceArea1: '78701',
			serviceArea2: '78704',
			yearsLicensed: '7 years',
			valueProposition: 'Calm, clear guidance.',
			experience: '7 years',
			zipCodes: '78701, 78704',
			services: ['Buyer Representation', 'Luxury Homes'],
		})

		const settings = await getUserSettingsDb(db, agentUserId)
		const [profile] = await db
			.select()
			.from(agentProfiles)
			.where(eq(agentProfiles.userId, agentUserId))

		expect(profile).toMatchObject({
			userId: agentUserId,
			firstName: 'Avery',
			lastName: 'Agent',
			brokerageName: 'Horizon Realty',
			serviceArea1: '78701',
			serviceArea2: '78704',
			yearsLicensed: '7 years',
			valueProposition: 'Calm, clear guidance.',
		})
		expect(settings).toMatchObject({
			role: 'agent',
			agentProfile: {
				firstName: 'Avery',
				lastName: 'Agent',
				brokerageName: 'Horizon Realty',
				zipCodes: '78701, 78704',
				yearsLicensed: '7 years',
				valueProposition: 'Calm, clear guidance.',
			},
		})
	})

	test('updates buyer answers without duplicating profile rows', async ({
		db,
	}) => {
		await updateAnswersDb(db, buyerUserId, {
			'B.6': 1,
			'B.10': [1, 3],
			'B.14': 0,
		})

		const settings = await getUserSettingsDb(db, buyerUserId)
		const profiles = await db
			.select()
			.from(buyerProfiles)
			.where(eq(buyerProfiles.userId, buyerUserId))

		expect(profiles).toHaveLength(1)
		expect(settings).toMatchObject({
			role: 'consumer',
			flowKind: 'buyer',
			answers: {
				'B.6': 1,
				'B.10': [1, 3],
				'B.14': 0,
			},
		})
	})

	test('resets persisted buyer and agent rows', async ({ db }) => {
		await updateAgentProfileDb(db, agentUserId, {
			experience: '2 years',
			zipCodes: '73301',
			services: ['First-time Buyers'],
		})

		await resetUserSettingsDb(db, buyerUserId)
		await resetUserSettingsDb(db, agentUserId)

		expect(await getUserSettingsDb(db, buyerUserId)).toBeNull()
		expect(await getUserSettingsDb(db, agentUserId)).toBeNull()
		expect(await db.select().from(buyerProfiles)).toHaveLength(0)
		expect(await db.select().from(agentProfiles)).toHaveLength(0)
	})
})
