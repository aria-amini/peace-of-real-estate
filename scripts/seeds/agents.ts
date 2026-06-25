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

const DEAL_STRESS_STYLES = [
	'Calm under pressure',
	'Strategic negotiator',
	'Transparent communicator',
	'Detail-oriented analyst',
	'Proactive problem solver',
]

const COMMUNICATION_CADENCES = ['Daily', 'Weekly', 'Bi-weekly', 'As needed']

const QUICK_CONTACT_STYLES = ['Text message', 'Phone call', 'Email', 'Any']

const UPDATE_DELIVERY_STYLES = [
	'Email summary',
	'In-person meetings',
	'Dashboard access',
	'Phone calls',
	'Text updates',
]

const RESPONSE_TIMES = [
	'Immediately',
	'Within 1 hour',
	'Within 2-4 hours',
	'Same business day',
	'Within 24 hours',
]

const DUAL_AGENCY_STYLES = [
	'Full disclosure only',
	'Avoid when possible',
	'Permitted with consent',
	'Case by case',
	'Policy against it',
]

const ENERGY_STYLES = ['calm', 'energetic', 'balanced'] as const
const TEACHING_STYLES = ['onRequest', 'proactive', 'minimal'] as const
const DECISION_MAKING_STYLES = ['data', 'gut', 'collaborative'] as const
const TRANSPARENCY_STYLES = ['upfront', 'diplomatic', 'asNeeded'] as const
const CLIENT_BOUNDARY_STYLES = ['gentle', 'firm', 'adaptive'] as const
const NEGOTIATION_ETHICS = ['winWin', 'aggressive', 'protective'] as const
const SERVICE_DEPTHS = ['standard', 'premium', 'concierge'] as const
const INVOLVEMENT_LEVELS = [
	'keyDetails',
	'deepInvolvement',
	'handsOff',
] as const
const REPRESENTATION_PREFERENCES = ['exclusive', 'flexible', 'limited'] as const

const EMPLOYMENT_STATUSES = [
	'Salesperson',
	'Realtor',
	'Broker Associate',
	'Associate Broker',
	'Broker',
	'Managing Broker',
]

const EO_INSURANCE_STATUSES = ['Active', 'Pending', 'Not required'] as const

const VALUE_PROPOSITIONS: Record<string, string> = {
	entry:
		'I specialize in helping first-time buyers and budget-conscious clients navigate the market with confidence and clarity.',
	mid: 'I deliver reliable, full-service representation for everyday buyers and sellers in the heart of the market.',
	premium:
		'I provide elevated service and strategic guidance for clients buying or selling higher-end homes.',
	luxury:
		'White-glove service for discerning clients. I bring deep luxury market expertise, discretion, and a global network.',
	investor:
		'I help investors build wealth through data-driven real estate decisions, from analysis to portfolio strategy.',
}

const IDEAL_CLIENT_DESCRIPTIONS: Record<string, string> = {
	entry:
		'First-time buyers and young families who want patient guidance through every step.',
	mid: 'Move-up buyers and sellers who value clear communication and dependable results.',
	premium:
		'Clients seeking a higher level of service for homes in top-tier neighborhoods.',
	luxury:
		'Discerning buyers and sellers who expect discretion, expertise, and white-glove attention.',
	investor:
		'Serious investors who want market data, ROI analysis, and portfolio strategy.',
}

const WHY_I_STARTED = [
	'I became an agent after buying my first home and realizing how confusing the process can be.',
	'I wanted to combine my love of real estate with helping people make confident decisions.',
	'After years in sales, I found that real estate lets me build lasting relationships with clients.',
	'I started in property management and realized I wanted to help clients buy and sell directly.',
	'Helping friends and family buy homes showed me I had a knack for negotiation and advocacy.',
]

const TYPICAL_DAY_IN_DEAL = [
	'I start with market updates, follow up with lenders and inspectors, and end with client calls.',
	'My days blend showings, contract reviews, and coordination with title and escrow teams.',
	'I spend mornings analyzing comps, afternoons touring homes, and evenings negotiating offers.',
	'Most of my day is client communication: updates, answers, and keeping deals on track.',
	'I focus on pipeline management, marketing listings, and preparing buyers for competitive offers.',
]

const HARD_NOS = [
	'I do not represent buyers without pre-approval in competitive markets.',
	'I will not take overpriced listings that ignore market data.',
	'I do not work with clients who refuse to communicate openly.',
	'I will not dual-represent without full written consent.',
	'I do not guarantee outcomes I cannot control.',
]

const VALUE_BEYOND_TRANSACTIONS = [
	'I connect clients with trusted lenders, inspectors, and contractors long after closing.',
	'I provide market insights and neighborhood context that help clients plan their next move.',
	'My clients get a lifelong real estate advisor, not just someone who closes a deal.',
	'I help clients understand tax implications, school zones, and resale potential.',
	'I stay in touch with annual home value updates and market trend reports.',
]

const CLIENT_FIRST_TERMS = [
	'I answer every question honestly, even when the answer is not what the client wants to hear.',
	"I put my clients' interests ahead of any commission or deal pressure.",
	'I communicate proactively so clients never feel left in the dark.',
	"I treat every client's money and timeline with the same care I would my own.",
	'I negotiate fiercely but fairly, always aiming for a win-win outcome.',
]

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
		dealStressStyle: pick(DEAL_STRESS_STYLES),
		communicationCadence: pick(COMMUNICATION_CADENCES),
		quickContactStyle: pick(QUICK_CONTACT_STYLES),
		updateDeliveryStyle: pick(UPDATE_DELIVERY_STYLES),
		responseTime: pick(RESPONSE_TIMES),
		dualAgencyStyle: pick(DUAL_AGENCY_STYLES),
		energyStyle: pick(ENERGY_STYLES),
		teachingStyle: pick(TEACHING_STYLES),
		decisionMakingStyle: pick(DECISION_MAKING_STYLES),
		transparencyStyle: pick(TRANSPARENCY_STYLES),
		clientBoundaryStyle: pick(CLIENT_BOUNDARY_STYLES),
		negotiationEthic: pick(NEGOTIATION_ETHICS),
		serviceDepth: pick(SERVICE_DEPTHS),
		involvementLevel: pick(INVOLVEMENT_LEVELS),
		representationPreference: pick(REPRESENTATION_PREFERENCES),
		matchPriorities: sample(
			[
				'communicationCadence',
				'responseTime',
				'transparencyStyle',
				'experience',
			],
			randInt(1, 3),
		),
		yearsLicensed: approxLabel(YEARS_LABELS, years),
		averageTransactions: approxLabel(TRANSACTION_LABELS, avgTrans),
		employmentStatus: pick(EMPLOYMENT_STATUSES),
		eoInsuranceStatus: pick(EO_INSURANCE_STATUSES),
		valueProposition: VALUE_PROPOSITIONS[priceTier]!,
		idealClientDescription: IDEAL_CLIENT_DESCRIPTIONS[priceTier]!,
		whyIStarted: pick(WHY_I_STARTED),
		typicalDayInDeal: pick(TYPICAL_DAY_IN_DEAL),
		hardNo: pick(HARD_NOS),
		valueBeyondTransaction: pick(VALUE_BEYOND_TRANSACTIONS),
		clientFirstTerms: pick(CLIENT_FIRST_TERMS),
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
		dealStressStyle: persona.dealStressStyle,
		communicationCadence: persona.communicationCadence,
		quickContactStyle: persona.quickContactStyle,
		updateDeliveryStyle: persona.updateDeliveryStyle,
		responseTime: persona.responseTime,
		dualAgencyStyle: persona.dualAgencyStyle,
		energyStyle: persona.energyStyle,
		teachingStyle: persona.teachingStyle,
		decisionMakingStyle: persona.decisionMakingStyle,
		transparencyStyle: persona.transparencyStyle,
		clientBoundaryStyle: persona.clientBoundaryStyle,
		negotiationEthic: persona.negotiationEthic,
		serviceDepth: persona.serviceDepth,
		involvementLevel: persona.involvementLevel,
		representationPreference: persona.representationPreference,
		matchPriorities: persona.matchPriorities,
		valueProposition: persona.valueProposition,
		idealClientDescription: persona.idealClientDescription,
		whyIStarted: persona.whyIStarted,
		typicalDayInDeal: persona.typicalDayInDeal,
		hardNo: persona.hardNo,
		valueBeyondTransaction: persona.valueBeyondTransaction,
		clientFirstTerms: persona.clientFirstTerms,
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
