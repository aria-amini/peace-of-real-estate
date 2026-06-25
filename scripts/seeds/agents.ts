import { db } from '../../src/db/connection'
import {
	account,
	agentProfiles,
	consumerProfiles,
	session,
	user,
	userEntitlements,
} from '../../src/db/tables'
import { uploadAgentAvatar } from './avatars'
import {
	approxLabel,
	buildAddress,
	buildPhone,
	CITIES,
	FIRST_NAMES,
	INDEPENDENT_BROKERAGES,
	LAST_NAMES,
	LUXURY_BROKERAGES,
	MEGA_BROKERAGES,
	pick,
	PRICE_BY_TIER,
	randInt,
	TRANSACTION_LABELS,
	YEARS_LABELS,
	type City,
} from './utils'

// =============================================================================
// Weighted random helpers
// =============================================================================

type WeightedOption<T> = { value: T; weight: number }

function pickWeighted<T>(options: readonly WeightedOption<T>[]): T {
	const total = options.reduce((sum, option) => sum + option.weight, 0)
	let random = Math.random() * total
	for (const option of options) {
		random -= option.weight
		if (random <= 0) return option.value
	}
	return options[options.length - 1]!.value
}

function sample<T>(arr: readonly T[], count: number): T[] {
	const shuffled = [...arr].sort(() => Math.random() - 0.5)
	return shuffled.slice(0, count)
}

// =============================================================================
// Randomized field pools
// =============================================================================

const REPRESENTATION_SIDES: WeightedOption<'buying' | 'selling' | 'both'>[] = [
	{ value: 'both', weight: 50 },
	{ value: 'buying', weight: 30 },
	{ value: 'selling', weight: 20 },
]

const PRICE_TIERS: WeightedOption<keyof typeof PRICE_BY_TIER>[] = [
	{ value: 'entry', weight: 15 },
	{ value: 'mid', weight: 35 },
	{ value: 'premium', weight: 30 },
	{ value: 'luxury', weight: 12 },
	{ value: 'investor', weight: 8 },
]

const CLIENT_TYPES = [
	'First-time Buyers',
	'Sellers',
	'Relocation',
	'Luxury',
	'Investors',
	'New Construction',
	'Property Management',
	'Seniors',
	'Staging',
	'Marketing',
	'Land',
	'Commercial',
	'International',
	'Military',
	'Buyers',
]

const EMPLOYMENT_STATUSES = [
	'Salesperson',
	'Realtor',
	'Broker Associate',
	'Associate Broker',
	'Broker',
	'Managing Broker',
]

const EO_INSURANCE_STATUSES = ['Active', 'Pending', 'Not required'] as const

const NOT_FIT_FOR = [
	'I do not work with commercial properties or fix-and-flip investors.',
	'I am not a good fit for clients seeking entry-level properties.',
	'I do not handle luxury properties or estate sales.',
	'I do not work with renters or short-term rentals.',
	'I do not represent clients outside my licensed metro area.',
	'I am not a good fit for clients who want daily updates.',
	'I do not take listings under $200k.',
	'I do not work with unrepresented buyers in dual-agency situations.',
	null,
	null,
]

const BROKERAGE_POOLS = [
	...LUXURY_BROKERAGES,
	...MEGA_BROKERAGES,
	...INDEPENDENT_BROKERAGES,
]

// =============================================================================
// Persona generation
// =============================================================================

function generatePersona() {
	const priceTier = pickWeighted(PRICE_TIERS)
	const years = randInt(1, 30)
	const avgTrans = randInt(3, 60)
	const clientTypeCount = randInt(2, 4)

	return {
		representationSide: pickWeighted(REPRESENTATION_SIDES),
		typicalPriceRange: pick(PRICE_BY_TIER[priceTier]!),
		bestClientTypes: sample(CLIENT_TYPES, clientTypeCount),
		notFitFor: pick(NOT_FIT_FOR),
		yearsLicensed: approxLabel(YEARS_LABELS, years),
		averageTransactions: approxLabel(TRANSACTION_LABELS, avgTrans),
		employmentStatus: pick(EMPLOYMENT_STATUSES),
		eoInsuranceStatus: pick(EO_INSURANCE_STATUSES),
		peacePactSigned: Math.random() < 0.75,
		usePaxWriter: Math.random() < 0.8,
	}
}

// =============================================================================
// Agent seeding
// =============================================================================

async function clearFakeData() {
	console.log('Clearing existing seed data...')

	await db.delete(consumerProfiles)
	await db.delete(agentProfiles)
	await db.delete(session)
	await db.delete(account)
	await db.delete(userEntitlements)
	await db.delete(user)

	console.log('Existing seed data cleared.')
}

function generateName(): {
	firstName: string
	lastName: string
	fullName: string
} {
	const firstName = pick(FIRST_NAMES)
	const lastName = pick(LAST_NAMES)
	return { firstName, lastName, fullName: `${firstName} ${lastName}` }
}

function generateEmail(firstName: string, lastName: string): string {
	return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1, 999)}@example.com`
}

async function insertAgent(location: City, now: Date) {
	const persona = generatePersona()
	const { firstName, lastName, fullName } = generateName()
	const email = generateEmail(firstName, lastName)
	const userId = crypto.randomUUID()
	const agentId = crypto.randomUUID()

	const imageKey = await uploadAgentAvatar(agentId, email)

	await db.insert(user).values({
		id: userId,
		name: fullName,
		email,
		emailVerified: true,
		image: imageKey,
		createdAt: now,
		updatedAt: now,
	})

	await db.insert(agentProfiles).values({
		id: agentId,
		userId,
		city: location.city,
		state: location.state,
		representationSide: persona.representationSide,
		typicalPriceRange: persona.typicalPriceRange,
		bestClientTypes: persona.bestClientTypes,
		notFitFor: persona.notFitFor,
		firstName,
		lastName,
		brokerageName: pick(BROKERAGE_POOLS),
		email,
		phone: buildPhone(),
		businessAddress: buildAddress(location),
		billingAddress: buildAddress(location),
		licenseNumberState: `LIC-${randInt(100000, 999999)}-${location.state}`,
		zipCodes: location.zips.slice(0, 3),
		yearsLicensed: persona.yearsLicensed,
		averageTransactions: persona.averageTransactions,
		employmentStatus: persona.employmentStatus,
		usePaxWriter: persona.usePaxWriter,
		licenseAttested: true,
		eoInsuranceStatus: persona.eoInsuranceStatus,
		peacePactSigned: persona.peacePactSigned,
		peacePactSignature: `${firstName} ${lastName}`,
		peacePactSignedAt: persona.peacePactSigned
			? new Date(now.getTime() - randInt(0, 90) * 86400000)
			: null,
		createdAt: now,
		updatedAt: now,
	})
}

export async function seedAgents(count: number) {
	const now = new Date()

	await clearFakeData()

	console.log(`Seeding ${count} agents with randomized profiles...`)

	for (let i = 0; i < count; i++) {
		const location = pick(CITIES)
		await insertAgent(location, now)

		if ((i + 1) % 50 === 0 || i === count - 1) {
			console.log(`  ${i + 1}/${count} agents seeded`)
		}
	}

	console.log(`\nDone! Successfully seeded ${count} agents.`)
}
