import { db } from '../src/db/connection'
import {
	user,
	agentProfiles,
	consumerProfiles,
	session,
	account,
	userEntitlements,
} from '../src/db/tables'

const FIRST_NAMES = [
	'James',
	'Mary',
	'Robert',
	'Patricia',
	'John',
	'Jennifer',
	'Michael',
	'Linda',
	'David',
	'Elizabeth',
	'William',
	'Barbara',
	'Richard',
	'Susan',
	'Joseph',
	'Jessica',
	'Thomas',
	'Sarah',
	'Christopher',
	'Karen',
	'Charles',
	'Lisa',
	'Daniel',
	'Nancy',
	'Matthew',
	'Betty',
	'Anthony',
	'Margaret',
	'Mark',
	'Sandra',
	'Donald',
	'Ashley',
	'Steven',
	'Kimberly',
	'Paul',
	'Emily',
	'Andrew',
	'Donna',
	'Joshua',
	'Michelle',
	'Kenneth',
	'Carol',
	'Kevin',
	'Amanda',
	'Brian',
	'Dorothy',
	'George',
	'Melissa',
	'Timothy',
	'Deborah',
	'Ronald',
	'Stephanie',
	'Edward',
	'Rebecca',
	'Jason',
	'Sharon',
	'Jeffrey',
	'Laura',
	'Ryan',
	'Cynthia',
	'Jacob',
	'Kathleen',
	'Gary',
	'Amy',
	'Nicholas',
	'Angela',
	'Eric',
	'Shirley',
	'Jonathan',
	'Anna',
	'Stephen',
	'Brenda',
	'Larry',
	'Pamela',
	'Justin',
	'Emma',
	'Scott',
	'Nikole',
	'Brandon',
	'Samantha',
	'Benjamin',
	'Katherine',
	'Samuel',
	'Christine',
	'Raymond',
	'Debra',
	'Gregory',
	'Rachel',
	'Frank',
	'Carolyn',
	'Alexander',
	'Janet',
	'Patrick',
	'Catherine',
	'Jack',
	'Maria',
	'Dennis',
	'Heather',
	'Jerry',
	'Diane',
]

const LAST_NAMES = [
	'Smith',
	'Johnson',
	'Williams',
	'Brown',
	'Jones',
	'Garcia',
	'Miller',
	'Davis',
	'Rodriguez',
	'Martinez',
	'Hernandez',
	'Lopez',
	'Gonzalez',
	'Wilson',
	'Anderson',
	'Thomas',
	'Taylor',
	'Moore',
	'Jackson',
	'Martin',
	'Lee',
	'Perez',
	'Thompson',
	'White',
	'Harris',
	'Sanchez',
	'Clark',
	'Ramirez',
	'Lewis',
	'Robinson',
	'Walker',
	'Young',
	'Allen',
	'King',
	'Wright',
	'Scott',
	'Torres',
	'Nguyen',
	'Hill',
	'Flores',
	'Green',
	'Adams',
	'Nelson',
	'Baker',
	'Hall',
	'Rivera',
	'Campbell',
	'Mitchell',
	'Carter',
	'Roberts',
	'Turner',
	'Phillips',
	'Evans',
	'Collins',
]

const LUXURY_BROKERAGES = [
	"Sotheby's International Realty",
	'Compass',
	'Douglas Elliman',
	'Corcoran',
	'Brown Harris Stevens',
	'The Agency',
	'Christies International Real Estate',
	'Engel & Volkers',
	'Luxury Portfolio International',
]

const MEGA_BROKERAGES = [
	'EXP Realty',
	'Coldwell Banker',
	'Keller Williams',
	'Re/Max',
	'Berkshire Hathaway HomeServices',
	'Century 21',
	'Redfin',
]

const INDEPENDENT_BROKERAGES = [
	'Realty ONE Group',
	'United Real Estate',
	'Real Brokerage',
	'Fathom Realty',
	'Crye-Leike',
	'Long & Foster',
	'Howard Hanna',
]

const CITIES = [
	{
		city: 'Austin',
		state: 'TX',
		zips: ['78701', '78702', '78703', '78704', '78705'],
	},
	{
		city: 'Dallas',
		state: 'TX',
		zips: ['75201', '75202', '75204', '75205', '75206'],
	},
	{
		city: 'Houston',
		state: 'TX',
		zips: ['77001', '77002', '77004', '77005', '77006'],
	},
	{
		city: 'San Antonio',
		state: 'TX',
		zips: ['78201', '78202', '78203', '78204', '78205'],
	},
	{
		city: 'Phoenix',
		state: 'AZ',
		zips: ['85001', '85003', '85004', '85006', '85007'],
	},
	{
		city: 'Scottsdale',
		state: 'AZ',
		zips: ['85250', '85251', '85254', '85255', '85257'],
	},
	{
		city: 'Tucson',
		state: 'AZ',
		zips: ['85701', '85710', '85711', '85712', '85716'],
	},
	{
		city: 'Los Angeles',
		state: 'CA',
		zips: ['90001', '90002', '90003', '90004', '90005'],
	},
	{ city: 'Beverly Hills', state: 'CA', zips: ['90210', '90211', '90212'] },
	{
		city: 'San Diego',
		state: 'CA',
		zips: ['92101', '92102', '92103', '92104', '92105'],
	},
	{
		city: 'San Francisco',
		state: 'CA',
		zips: ['94102', '94103', '94104', '94105', '94107'],
	},
	{
		city: 'Denver',
		state: 'CO',
		zips: ['80201', '80202', '80204', '80205', '80206'],
	},
	{
		city: 'Boulder',
		state: 'CO',
		zips: ['80301', '80302', '80303', '80304', '80305'],
	},
	{
		city: 'Miami',
		state: 'FL',
		zips: ['33101', '33125', '33126', '33127', '33128'],
	},
	{
		city: 'Orlando',
		state: 'FL',
		zips: ['32801', '32803', '32804', '32805', '32806'],
	},
	{
		city: 'Tampa',
		state: 'FL',
		zips: ['33601', '33602', '33603', '33604', '33605'],
	},
	{
		city: 'Atlanta',
		state: 'GA',
		zips: ['30301', '30303', '30305', '30306', '30307'],
	},
	{
		city: 'Chicago',
		state: 'IL',
		zips: ['60601', '60602', '60603', '60604', '60605'],
	},
	{
		city: 'Naperville',
		state: 'IL',
		zips: ['60540', '60563', '60564', '60565'],
	},
	{
		city: 'Indianapolis',
		state: 'IN',
		zips: ['46201', '46202', '46203', '46204', '46205'],
	},
	{
		city: 'Boston',
		state: 'MA',
		zips: ['02101', '02108', '02109', '02110', '02111'],
	},
	{
		city: 'Cambridge',
		state: 'MA',
		zips: ['02138', '02139', '02140', '02141', '02142'],
	},
	{
		city: 'Detroit',
		state: 'MI',
		zips: ['48201', '48202', '48204', '48205', '48206'],
	},
	{
		city: 'Minneapolis',
		state: 'MN',
		zips: ['55401', '55402', '55403', '55404', '55405'],
	},
	{
		city: 'Charlotte',
		state: 'NC',
		zips: ['28201', '28202', '28203', '28204', '28205'],
	},
	{
		city: 'Raleigh',
		state: 'NC',
		zips: ['27601', '27603', '27604', '27605', '27606'],
	},
	{
		city: 'Las Vegas',
		state: 'NV',
		zips: ['89101', '89102', '89103', '89104', '89106'],
	},
	{
		city: 'New York',
		state: 'NY',
		zips: ['10001', '10002', '10003', '10004', '10005'],
	},
	{
		city: 'Brooklyn',
		state: 'NY',
		zips: ['11201', '11203', '11204', '11205', '11206'],
	},
	{
		city: 'Portland',
		state: 'OR',
		zips: ['97201', '97202', '97203', '97204', '97205'],
	},
	{
		city: 'Philadelphia',
		state: 'PA',
		zips: ['19101', '19102', '19103', '19104', '19106'],
	},
	{
		city: 'Nashville',
		state: 'TN',
		zips: ['37201', '37203', '37204', '37205', '37206'],
	},
	{
		city: 'Memphis',
		state: 'TN',
		zips: ['38101', '38103', '38104', '38105', '38106'],
	},
	{
		city: 'Seattle',
		state: 'WA',
		zips: ['98101', '98102', '98103', '98104', '98105'],
	},
	{
		city: 'Washington',
		state: 'DC',
		zips: ['20001', '20002', '20003', '20004', '20005'],
	},
]

type AgentArchetype = {
	representationSide: 'buying' | 'selling' | 'both'
	priceTier: 'entry' | 'mid' | 'premium' | 'luxury' | 'investor'
	clientTypes: string[]
	notFitFor: string | null
	workingStyle: string
	dealStressStyle: string
	communicationCadence: string
	quickContactStyle: string
	updateDeliveryStyle: string
	responseTime: string
	commissionStyle: string
	dualAgencyStyle: string
	yearsRange: [number, number]
	experienceLabel: string
	transactionsLabel: string
	transactionsRange: [number, number]
	employmentStatus: string
	eoInsuranceStatus: string
	peacePactProb: number
	usePaxWriterProb: number
	valueProposition: string
	brokeragePool: readonly string[]
}

const PRICE_BY_TIER: Record<string, string[]> = {
	entry: ['$100k - $250k', '$150k - $350k', '$200k - $400k'],
	mid: ['$250k - $500k', '$300k - $600k', '$400k - $750k', '$500k - $750k'],
	premium: ['$500k - $1M', '$750k - $1.5M', '$1M - $2M'],
	luxury: ['$1M - $3M', '$2M - $5M', '$3M - $7M', '$5M+'],
	investor: ['$200k - $500k', '$300k - $1M', '$500k - $3M', '$1M - $5M'],
}

const YEARS_LABELS: Record<number, string> = {
	1: 'Less than 1 year',
	2: '1-2 years',
	3: '3-5 years',
	5: '5-10 years',
	10: '10-15 years',
	15: '15-20 years',
	20: '20+ years',
}

const TRANSACTION_LABELS: Record<number, string> = {
	5: '3-5 per year',
	10: '5-10 per year',
	15: '10-15 per year',
	20: '15-20 per year',
	30: '20-30 per year',
	40: '30-40 per year',
	50: '40-50 per year',
	60: '50+ per year',
}

function approxLabel(map: Record<number, string>, value: number): string {
	const keys = Object.keys(map)
		.map(Number)
		.sort((a, b) => a - b)
	for (const k of keys) {
		if (value <= k) return map[k]!
	}
	return map[keys[keys.length - 1]!]!
}

const ARCHETYPES: AgentArchetype[] = [
	// 1. First-Time Buyer Specialist
	{
		representationSide: 'buying',
		priceTier: 'entry',
		clientTypes: ['First-time Buyers', 'Sellers', 'Relocation'],
		notFitFor:
			'I do not work with fix-and-flip investors or commercial properties.',
		workingStyle: 'Patient and educational',
		dealStressStyle: 'Calm under pressure',
		communicationCadence: 'Weekly',
		quickContactStyle: 'Text message',
		updateDeliveryStyle: 'Email summary',
		responseTime: 'Within 2-4 hours',
		commissionStyle: 'Standard market rate',
		dualAgencyStyle: 'Full disclosure only',
		yearsRange: [2, 8],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [8, 20],
		employmentStatus: 'Salesperson',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.75,
		usePaxWriterProb: 0.85,
		valueProposition:
			'I make home buying simple and stress-free for first-time buyers. From pre-approval to closing, I guide you through every step with patience and clarity.',
		brokeragePool: [...MEGA_BROKERAGES, ...INDEPENDENT_BROKERAGES],
	},
	// 2. Seller Marketing Expert
	{
		representationSide: 'selling',
		priceTier: 'mid',
		clientTypes: ['Sellers', 'Staging', 'Marketing'],
		notFitFor: 'I do not represent buyers in multiple-offer situations.',
		workingStyle: 'Efficient and streamlined',
		dealStressStyle: 'Strategic negotiator',
		communicationCadence: 'Bi-weekly',
		quickContactStyle: 'Phone call',
		updateDeliveryStyle: 'In-person meetings',
		responseTime: 'Within 1 hour',
		commissionStyle: 'Tiered commission',
		dualAgencyStyle: 'Avoid when possible',
		yearsRange: [4, 15],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [12, 30],
		employmentStatus: 'Realtor',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.7,
		usePaxWriterProb: 0.8,
		valueProposition:
			'I maximize your home value with data-driven pricing, professional staging, and targeted marketing. My sellers average 98% of asking price.',
		brokeragePool: [...MEGA_BROKERAGES, ...INDEPENDENT_BROKERAGES],
	},
	// 3. Luxury Market Specialist
	{
		representationSide: 'both',
		priceTier: 'luxury',
		clientTypes: ['Luxury', 'Sellers', 'Buyers', 'International'],
		notFitFor:
			'I do not work with first-time buyers or entry-level properties.',
		workingStyle: 'High-touch and personal',
		dealStressStyle: 'Transparent communicator',
		communicationCadence: 'As needed',
		quickContactStyle: 'Any',
		updateDeliveryStyle: 'Dashboard access',
		responseTime: 'Within 1 hour',
		commissionStyle: 'Premium full service',
		dualAgencyStyle: 'Permitted with consent',
		yearsRange: [10, 25],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [10, 25],
		employmentStatus: 'Broker',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.9,
		usePaxWriterProb: 0.7,
		valueProposition:
			'White-glove service for discerning clients. I bring decades of luxury market expertise, a global network, and complete discretion to every transaction.',
		brokeragePool: LUXURY_BROKERAGES,
	},
	// 4. Data-Driven Investor Agent
	{
		representationSide: 'both',
		priceTier: 'investor',
		clientTypes: ['Investors', 'Commercial', 'Property Management'],
		notFitFor:
			'I do not work with first-time home buyers or residential renters.',
		workingStyle: 'Data-driven and analytical',
		dealStressStyle: 'Detail-oriented analyst',
		communicationCadence: 'Weekly',
		quickContactStyle: 'Email',
		updateDeliveryStyle: 'Dashboard access',
		responseTime: 'Same business day',
		commissionStyle: 'Flat fee structure',
		dualAgencyStyle: 'Case by case',
		yearsRange: [5, 20],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [20, 50],
		employmentStatus: 'Broker Associate',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.5,
		usePaxWriterProb: 0.6,
		valueProposition:
			'I help investors build wealth through data-driven real estate decisions. My clients get comprehensive market analysis, ROI projections, and portfolio strategy.',
		brokeragePool: [...MEGA_BROKERAGES, ...INDEPENDENT_BROKERAGES],
	},
	// 5. New Construction Insider
	{
		representationSide: 'buying',
		priceTier: 'mid',
		clientTypes: ['New Construction', 'Buyers', 'Land'],
		notFitFor: 'I do not work with existing home resales or short sales.',
		workingStyle: 'Collaborative and consultative',
		dealStressStyle: 'Proactive problem solver',
		communicationCadence: 'Weekly',
		quickContactStyle: 'Text message',
		updateDeliveryStyle: 'Email summary',
		responseTime: 'Within 2-4 hours',
		commissionStyle: 'Standard market rate',
		dualAgencyStyle: 'Full disclosure only',
		yearsRange: [3, 12],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [15, 30],
		employmentStatus: 'Realtor',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.7,
		usePaxWriterProb: 0.9,
		valueProposition:
			'I specialize in new construction and pre-construction sales. I know the builders, the floor plans, and the neighborhoods to help you build your dream home.',
		brokeragePool: [...MEGA_BROKERAGES, ...INDEPENDENT_BROKERAGES],
	},
	// 6. Relocation Specialist
	{
		representationSide: 'both',
		priceTier: 'premium',
		clientTypes: ['Relocation', 'Sellers', 'Buyers', 'Military'],
		notFitFor: 'I am not a good fit for investors or commercial clients.',
		workingStyle: 'High-touch and personal',
		dealStressStyle: 'Proactive problem solver',
		communicationCadence: 'Daily',
		quickContactStyle: 'Any',
		updateDeliveryStyle: 'Phone calls',
		responseTime: 'Within 1 hour',
		commissionStyle: 'Negotiable based on services',
		dualAgencyStyle: 'Permitted with consent',
		yearsRange: [5, 15],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [15, 35],
		employmentStatus: 'Broker',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.8,
		usePaxWriterProb: 0.75,
		valueProposition:
			'Moving is stressful. I make relocation seamless with concierge-level service, corporate partnerships, and deep knowledge of neighborhoods across the region.',
		brokeragePool: MEGA_BROKERAGES,
	},
	// 7. Veteran Community Pillar
	{
		representationSide: 'both',
		priceTier: 'mid',
		clientTypes: ['Sellers', 'Buyers', 'Seniors', 'First-time Buyers'],
		notFitFor: null,
		workingStyle: 'Direct and honest',
		dealStressStyle: 'Transparent communicator',
		communicationCadence: 'As needed',
		quickContactStyle: 'Phone call',
		updateDeliveryStyle: 'In-person meetings',
		responseTime: 'Within 24 hours',
		commissionStyle: 'Standard market rate',
		dualAgencyStyle: 'Full disclosure only',
		yearsRange: [20, 35],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [10, 20],
		employmentStatus: 'Managing Broker',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.95,
		usePaxWriterProb: 0.4,
		valueProposition:
			'With 20+ years in this community, I have helped hundreds of families buy and sell. My reputation is built on trust, integrity, and results that speak for themselves.',
		brokeragePool: [...MEGA_BROKERAGES, ...INDEPENDENT_BROKERAGES],
	},
	// 8. Young Hustler / Rising Star
	{
		representationSide: 'both',
		priceTier: 'entry',
		clientTypes: ['First-time Buyers', 'Sellers', 'Marketing'],
		notFitFor: 'I do not handle luxury properties or commercial real estate.',
		workingStyle: 'Aggressive and results-focused',
		dealStressStyle: 'Strategic negotiator',
		communicationCadence: 'Daily',
		quickContactStyle: 'Text message',
		updateDeliveryStyle: 'Text updates',
		responseTime: 'Immediately',
		commissionStyle: 'Negotiable based on services',
		dualAgencyStyle: 'Permitted with consent',
		yearsRange: [1, 5],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [5, 15],
		employmentStatus: 'Salesperson',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.4,
		usePaxWriterProb: 0.95,
		valueProposition:
			'Full energy, full service, full transparency. I leverage cutting-edge technology and social media marketing to get you the best deal in any market.',
		brokeragePool: [...MEGA_BROKERAGES, ...INDEPENDENT_BROKERAGES],
	},
	// 9. Boutique Buyer-Only Agent
	{
		representationSide: 'buying',
		priceTier: 'premium',
		clientTypes: ['Buyers', 'Luxury', 'Relocation'],
		notFitFor:
			'I exclusively represent buyers and do not take seller listings.',
		workingStyle: 'Patient and educational',
		dealStressStyle: 'Detail-oriented analyst',
		communicationCadence: 'Weekly',
		quickContactStyle: 'Email',
		updateDeliveryStyle: 'Dashboard access',
		responseTime: 'Same business day',
		commissionStyle: 'Premium full service',
		dualAgencyStyle: 'Policy against it',
		yearsRange: [6, 18],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [8, 18],
		employmentStatus: 'Broker Associate',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.85,
		usePaxWriterProb: 0.8,
		valueProposition:
			'I work exclusively for buyers, never sellers. That means no conflicts of interest, 100% loyalty, and a fiduciary duty to find you the perfect home at the best price.',
		brokeragePool: [...MEGA_BROKERAGES, ...LUXURY_BROKERAGES],
	},
	// 10. Property Management & Landlord Specialist
	{
		representationSide: 'selling',
		priceTier: 'investor',
		clientTypes: ['Property Management', 'Investors', 'Commercial'],
		notFitFor:
			'I do not work with first-time home buyers or residential sales.',
		workingStyle: 'Efficient and streamlined',
		dealStressStyle: 'Proactive problem solver',
		communicationCadence: 'As needed',
		quickContactStyle: 'Email',
		updateDeliveryStyle: 'Dashboard access',
		responseTime: 'Within 2-4 hours',
		commissionStyle: 'Flat fee structure',
		dualAgencyStyle: 'Case by case',
		yearsRange: [4, 15],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [20, 50],
		employmentStatus: 'Realtor',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.5,
		usePaxWriterProb: 0.6,
		valueProposition:
			'I help landlords and property investors maximize returns. From tenant placement to portfolio expansion, I handle the real estate so you can focus on your business.',
		brokeragePool: [...MEGA_BROKERAGES, ...INDEPENDENT_BROKERAGES],
	},
	// 11. Senior & Downsizing Specialist
	{
		representationSide: 'selling',
		priceTier: 'mid',
		clientTypes: ['Seniors', 'Sellers', 'Staging'],
		notFitFor: 'I do not work with first-time buyers or young families.',
		workingStyle: 'Patient and educational',
		dealStressStyle: 'Calm under pressure',
		communicationCadence: 'As needed',
		quickContactStyle: 'Phone call',
		updateDeliveryStyle: 'In-person meetings',
		responseTime: 'Within 24 hours',
		commissionStyle: 'Standard market rate',
		dualAgencyStyle: 'Full disclosure only',
		yearsRange: [10, 25],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [8, 15],
		employmentStatus: 'Broker',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.9,
		usePaxWriterProb: 0.3,
		valueProposition:
			'I specialize in helping seniors downsize and transition to their next chapter with dignity and compassion. I handle the details, from decluttering to closing.',
		brokeragePool: [...MEGA_BROKERAGES, ...INDEPENDENT_BROKERAGES],
	},
	// 12. First-Gen / Bilingual Community Agent
	{
		representationSide: 'both',
		priceTier: 'entry',
		clientTypes: ['First-time Buyers', 'Sellers', 'Relocation'],
		notFitFor: null,
		workingStyle: 'Collaborative and consultative',
		dealStressStyle: 'Transparent communicator',
		communicationCadence: 'Weekly',
		quickContactStyle: 'Text message',
		updateDeliveryStyle: 'Email summary',
		responseTime: 'Within 2-4 hours',
		commissionStyle: 'Standard market rate',
		dualAgencyStyle: 'Full disclosure only',
		yearsRange: [2, 8],
		experienceLabel: '',
		transactionsLabel: '',
		transactionsRange: [8, 18],
		employmentStatus: 'Salesperson',
		eoInsuranceStatus: 'Active',
		peacePactProb: 0.6,
		usePaxWriterProb: 0.8,
		valueProposition:
			'I serve our community with bilingual service and cultural understanding. Whether you are buying your first home or selling after 30 years, I am here for you.',
		brokeragePool: [...MEGA_BROKERAGES, ...INDEPENDENT_BROKERAGES],
	},
]

function pick<T>(arr: readonly T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]!
}

function randInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickPrice(archetype: AgentArchetype): string {
	const options = PRICE_BY_TIER[archetype.priceTier]!
	const base = pick(options)
	const variation = pick(['', ' (negotiable)', '']) as string
	return base + variation
}

function pickBrokerage(archetype: AgentArchetype): string {
	return pick(archetype.brokeragePool)
}

function pickEmployment(archetype: AgentArchetype): string {
	if (archetype.yearsRange[1] >= 20) {
		return pick(['Managing Broker', 'Broker'])
	}
	if (archetype.yearsRange[1] >= 10) {
		return pick(['Broker', 'Associate Broker', 'Broker Associate'])
	}
	if (archetype.yearsRange[1] >= 5) {
		return pick(['Associate Broker', 'Realtor', 'Broker Associate'])
	}
	return pick(['Salesperson', 'Realtor'])
}

function statusFromProfile(
	peaceSigned: boolean,
	score: number,
): 'draft' | 'active' | 'enriched' {
	if (peaceSigned && score > 0.7) return 'enriched'
	if (peaceSigned && score > 0.4) return 'active'
	return 'draft'
}

function generatePersona(archetype: AgentArchetype, r: number) {
	const years = randInt(archetype.yearsRange[0], archetype.yearsRange[1])
	const avgTrans = randInt(
		archetype.transactionsRange[0],
		archetype.transactionsRange[1],
	)
	const peacePact = r < archetype.peacePactProb
	const usePaxWriter = r < archetype.usePaxWriterProb
	const completionScore = r

	return {
		representationSide: archetype.representationSide,
		typicalPriceRange: pickPrice(archetype),
		bestClientTypes: [...archetype.clientTypes]
			.sort(() => r - 0.5)
			.slice(0, randInt(2, archetype.clientTypes.length)),
		notFitFor: archetype.notFitFor,
		dealStressStyle: archetype.dealStressStyle,
		communicationCadence: archetype.communicationCadence,
		quickContactStyle: archetype.quickContactStyle,
		updateDeliveryStyle: archetype.updateDeliveryStyle,
		responseTime: archetype.responseTime,
		dualAgencyStyle: archetype.dualAgencyStyle,
		energyStyle: 'calm',
		teachingStyle: 'onRequest',
		decisionMakingStyle: 'data',
		transparencyStyle: 'upfront',
		clientBoundaryStyle: 'gentle',
		negotiationEthic: 'winWin',
		serviceDepth: 'standard',
		involvementLevel: 'keyDetails',
		representationPreference: 'exclusive',
		matchPriorities: ['communicationCadence', 'responseTime'],
		yearsLicensed: approxLabel(YEARS_LABELS, years),
		averageTransactions: approxLabel(TRANSACTION_LABELS, avgTrans),
		employmentStatus: pickEmployment(archetype),
		eoInsuranceStatus: archetype.eoInsuranceStatus,
		valueProposition: archetype.valueProposition,
		peacePactSigned: peacePact,
		usePaxWriter,
		status: statusFromProfile(peacePact, completionScore),
	}
}

const STREETS = [
	'Main St',
	'Oak Ave',
	'Elm St',
	'Maple Dr',
	'Cedar Ln',
	'Pine St',
	'Park Ave',
	'Broadway',
	'Lake Dr',
	'Hill Rd',
	'River Rd',
	'Forest Ave',
	'Highland Blvd',
	'Sunset Blvd',
	'Magnolia Ave',
	'Chestnut St',
	'Walnut St',
	'Cherry Ln',
	'Birch Ct',
	'Ash Blvd',
]

function buildAddress(location: (typeof CITIES)[number]): string {
	const streetNum = randInt(100, 9999)
	const street = pick(STREETS)
	const zip = pick(location.zips)
	return `${streetNum} ${street}, ${location.city}, ${location.state} ${zip}`
}

function buildPhone(): string {
	const area = String(randInt(200, 999))
	const prefix = String(randInt(200, 999))
	const line = String(randInt(1000, 9999))
	return `(${area}) ${prefix}-${line}`
}

async function populateDb(count: number) {
	const now = new Date()

	console.log('Clearing existing data...')

	const extraTables = [
		'agent_questionnaires',
		'agents',
		'consumer_questionnaires',
		'consumers',
		'listing',
		'price_point',
	]
	for (const table of extraTables) {
		try {
			await db.execute(`delete from "${table}"`)
		} catch {
			// table may not exist, skip
		}
	}

	await db.delete(consumerProfiles)
	await db.delete(agentProfiles)
	await db.delete(session)
	await db.delete(account)
	await db.delete(userEntitlements)
	await db.delete(user)
	console.log('Existing data cleared.')

	console.log(
		`Seeding ${count} agents across ${ARCHETYPES.length} persona archetypes...`,
	)

	for (let i = 0; i < count; i++) {
		const archetype = ARCHETYPES[i % ARCHETYPES.length]!
		const r = Math.random()
		const persona = generatePersona(archetype, r)

		const firstName = pick(FIRST_NAMES)
		const lastName = pick(LAST_NAMES)
		const fullName = `${firstName} ${lastName}`
		const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1, 999)}@example.com`
		const userId = crypto.randomUUID()
		const agentId = crypto.randomUUID()
		const location = pick(CITIES)

		await db.insert(user).values({
			id: userId,
			name: fullName,
			email,
			emailVerified: true,
			image: null,
			createdAt: now,
			updatedAt: now,
		})

		await db.insert(agentProfiles).values({
			id: agentId,
			userId,
			status: persona.status,
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
			idealClientDescription: null,
			whyIStarted: null,
			typicalDayInDeal: null,
			hardNo: null,
			valueBeyondTransaction: null,
			firstName,
			lastName,
			brokerageName: pickBrokerage(archetype),
			email,
			phone: buildPhone(),
			businessAddress: buildAddress(location),
			billingAddress: buildAddress(location),
			licenseNumberState: `LIC-${randInt(100000, 999999)}-${location.state}`,
			serviceAreas: location.zips.slice(0, 3),
			yearsLicensed: persona.yearsLicensed,
			averageTransactions: persona.averageTransactions,
			employmentStatus: persona.employmentStatus,
			licenseProof: null,
			clientFirstTerms: null,
			usePaxWriter: persona.usePaxWriter,
			licenseAttested: true,
			eoInsuranceStatus: persona.eoInsuranceStatus,
			peacePactSigned: persona.peacePactSigned,
			peacePactSignature: persona.peacePactSigned
				? `${firstName} ${lastName}`
				: null,
			peacePactSignedAt: persona.peacePactSigned
				? new Date(now.getTime() - randInt(0, 90) * 86400000)
				: null,
			createdAt: now,
			updatedAt: now,
		})

		if ((i + 1) % 50 === 0 || i === count - 1) {
			console.log(`  ${i + 1}/${count} agents seeded`)
		}
	}

	console.log(
		`\nDone! Successfully seeded ${count} agents across ${ARCHETYPES.length} archetypes.`,
	)
}

const requestedCount = process.argv[2] ? parseInt(process.argv[2], 10) : 200
const count =
	Number.isFinite(requestedCount) && requestedCount > 0
		? Math.min(requestedCount, 1000)
		: 200

populateDb(count)
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Seed failed:', err)
		process.exit(1)
	})
