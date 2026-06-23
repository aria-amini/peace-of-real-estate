import { z } from 'zod'

export type Question = {
	id: string
	title: string
	options: Record<string, string>
	multiple?: boolean
	freeForm?: boolean
	allowSkip?: boolean
}

export type AnswerValue = string | string[] | null

export type Answers = Record<string, AnswerValue>

export const answerValueSchema: z.ZodType<AnswerValue> = z.union([
	z.string(),
	z.array(z.string()),
	z.null(),
])

export const answersSchema: z.ZodType<Answers> = z.record(
	z.string(),
	answerValueSchema,
)

export const consumerQuestions = [
	{
		id: 'preferredContactMethod',
		title: 'Preferred method of communication?',
		options: {
			text: 'Text',
			call: 'Call',
			email: 'Email',
		},
	},
	{
		id: 'involvementLevel',
		title: 'Involvement level?',
		options: {
			veryInvolved: 'Very involved',
			keyDetails: 'Key details only',
			handsOff: 'Mostly hands off',
		},
	},
	{
		id: 'representationPreference',
		title: 'When it comes to choosing an agent, which matters more to you?',
		options: {
			access: 'More access and connections',
			exclusive: 'Exclusive representation',
		},
	},
	{
		id: 'commissionComfort',
		title: 'How do you plan to handle commissions with your agent?',
		options: {
			negotiate: "I'm comfortable negotiating",
			explain: "I'm new, explain it to me",
		},
	},
	{
		id: 'experienceLevel',
		title: 'How familiar does this process feel?',
		options: {
			firstTime: "First time; I'll want guidance",
			experienced: "I've done this before, but want help staying on track",
			veryExperienced: 'I know the process and want a strong operator',
		},
	},
] as const satisfies Question[]

export const agentQuestions = [
	{
		id: 'representationSide',
		title: 'Which side of the transaction do you primarily represent?',
		options: {
			buying: 'Buyer representation',
			selling: 'Seller representation',
		},
	},
	{
		id: 'typicalPriceRange',
		title: 'What is your typical price range?',
		options: {
			under400k: 'Under $400k',
			'400kTo750k': '$400k to $750k',
			'750kTo1_5m': '$750k to $1.5M',
			'1_5mPlus': '$1.5M and above',
		},
	},
	{
		id: 'bestClientTypes',
		title: 'Where do you do your best work?',
		multiple: true,
		options: {
			firstTime:
				'First-time buyers who need guidance through the entire process',
			moveUp: 'Move-up or downsizing buyers navigating a transition',
			relocation: 'Relocation clients on tight timelines',
			luxury: 'Luxury transactions with high-touch expectations',
			investor: 'Investors focused on numbers and execution',
			landMultiFamily: 'Land or multi-family transactions',
			seller: 'Sellers and listings',
			condoTownhome: 'Condos and townhomes',
			other: 'Other',
		},
	},
	{
		id: 'notFitFor',
		title: 'Who are you NOT the right fit for?',
		freeForm: true,
		options: {},
	},
	{
		id: 'workingStyle',
		title: 'How would most of your clients describe working with you?',
		options: {
			strategic:
				'Strategic and data-driven - I bring the analysis, the market context, and a clear plan',
			calm: 'Calm and steady - I keep things grounded and drama-free, especially when it gets stressful',
			warm: 'Warm and relational - my clients feel genuinely cared for as people, not just as transactions',
			efficient:
				'Efficient and decisive - I move fast, communicate clearly, and do not waste their time',
		},
	},
	{
		id: 'dealStressStyle',
		title:
			'When a deal gets difficult - bad inspection, appraisal gap, unreasonable counterparty - what is your instinct?',
		options: {
			facts:
				'Get the client the facts immediately and lay out every option so they can decide',
			understands:
				'Slow it down - make sure the client fully understands the situation before anyone reacts',
			lead: 'I take the lead - I work the problem, protect my client from unnecessary noise, and bring them in when there is a real decision to make',
			deEscalate:
				'De-escalate first - bring the temperature down, then problem-solve together',
		},
	},
	{
		id: 'communicationCadence',
		title: 'How often do you communicate with clients during a transaction?',
		options: {
			scheduled:
				'I check in regularly on a set schedule, whether or not there is news to share',
			milestone: 'I update clients at every key milestone and decision point',
			clientPaced:
				'I let clients set the pace - I am responsive when they reach out but I do not initiate unless something requires their attention',
		},
	},
	{
		id: 'quickContactStyle',
		title:
			'How do you prefer to handle quick back-and-forth with clients during a transaction?',
		options: {
			text: 'Text - fast and easy, clients can reach me anytime',
			call: "Phone - I'd rather just talk it through quickly",
			adaptable: 'Either is fine - I adapt to what works for the client',
		},
	},
	{
		id: 'updateDeliveryStyle',
		title:
			'How do you typically deliver updates, timelines, and documents to clients?',
		options: {
			email: 'Email - everything documented, easy to reference later',
			text: 'Text with attachments - quick delivery, clients get it right away',
			callThenEmail:
				'Phone call first, then email recap - I talk through it and follow up in writing',
		},
	},
	{
		id: 'responseTime',
		title: 'When a client reaches out, how quickly do you typically respond?',
		options: {
			'10m': 'Within 10 minutes',
			'30m': 'Within 30 minutes',
			hours: 'Within a few hours - same day always',
			'24h': 'Within 24 hours',
		},
	},
	{
		id: 'commissionStyle',
		title: 'How do you approach commission conversations with clients?',
		options: {
			proactiveSet:
				'I bring it up proactively and my rate is set - I explain my value and it speaks for itself',
			proactiveOpen:
				'I bring it up proactively and I am open to discussing it based on the client and transaction',
			waitSet:
				'I wait for the client to raise it and my rate is set - if they ask I explain my value',
			waitOpen:
				'I wait for the client to raise it and I am happy to have that conversation openly',
		},
	},
	{
		id: 'dualAgencyStyle',
		title:
			'You are the listing agent and an unrepresented buyer walks in interested in your listing. What do you do?',
		options: {
			separateBrokerage:
				'I refer the buyer to an agent at a completely separate brokerage - they deserve independent representation',
			sellerOnly:
				'I represent the seller only and the buyer proceeds unrepresented - with full written disclosure to all parties',
			sameBrokerage:
				'Another agent at my brokerage steps in to represent the buyer - with full written disclosure to both parties',
		},
	},
] as const satisfies Question[]

export const propertyTypeOptions = {
	singleFamily: 'Single-Family',
	condoTownhome: 'Condo/Townhome',
	multiFamily: 'Multi-family',
	land: 'Land',
} as const

export const propertyTypeTags: Record<string, string[]> = {
	'Single-Family': ['single-family'],
	'Condo/Townhome': ['condo', 'townhome'],
	'Multi-family': ['multi-family'],
	Land: ['land'],
}

export type QuestionFlow = {
	label: string
	questions: Question[]
}

export const consumerQuestionFlow = {
	label: 'Consumer Matching Quiz',
	questions: consumerQuestions as Question[],
} satisfies QuestionFlow

export const agentQuestionFlow = {
	label: 'Agent Flow',
	questions: agentQuestions as Question[],
} satisfies QuestionFlow

export function questionOptionEntries(question: Question): [string, string][] {
	return Object.entries(question.options)
}

export function questionOptionSlugs(question: Question): string[] {
	return Object.keys(question.options)
}

export function questionOptionLabel(question: Question, slug: string): string {
	return question.options[slug] ?? slug
}

export function getAnswerSummary(
	question: Question,
	answer: AnswerValue | undefined,
): string {
	if (answer === undefined || answer === '' || answer === null) {
		return 'Not answered'
	}

	if (question.freeForm && typeof answer === 'string') {
		return answer.trim() || 'Not answered'
	}

	if (Array.isArray(answer)) {
		const labels = answer.map((slug) => question.options[slug]).filter(Boolean)
		return labels.length > 0 ? labels.join(', ') : 'Not answered'
	}

	return question.options[answer] ?? 'Not answered'
}

export function getMultiSelectSummary(
	question: Question,
	answer: AnswerValue | undefined,
): string[] {
	if (answer === undefined || answer === null) return []
	if (Array.isArray(answer)) {
		return answer
			.map((slug) => question.options[slug])
			.filter((label): label is string => typeof label === 'string')
	}
	const label = question.options[answer]
	return label ? [label] : []
}

export function isMultiSelect(question: Question): boolean {
	return question.multiple === true
}

export function isFreeForm(question: Question): boolean {
	return question.freeForm === true
}

export function hasOptions(question: Question): boolean {
	return Object.keys(question.options).length > 0
}
