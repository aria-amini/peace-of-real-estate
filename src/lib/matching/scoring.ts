import {
	AGENT_PRICE_RANGES,
	parsePriceRange,
} from '@/components/signup/price-range-utils'
import type { AgentProfile, ConsumerProfile } from '@/lib/matching/profile'

export interface AgentMatchData {
	id: string
	name: string
	role: 'agent'
	location: string
	zipCodes: string[]
	fitScore: number
	status: 'new' | 'pending' | 'accepted'
	date: string
	experience?: string
	agency?: string
	specialties: string[]
	about: string
	scores: Record<ScoreBucket, number>
	contact?: {
		phone?: string
		email?: string
	}
	stats?: {
		transactions: number
		avgDays: number
		satisfaction: number
	}
	isTopMatch?: boolean
	avatar?: string
}

type ScoreBucket = 'Working Style' | 'Communication' | 'Transparency' | 'Fit'

const DEFAULT_BUCKET_SCORES: Record<ScoreBucket, number> = {
	'Working Style': 3.8,
	Communication: 3.8,
	Transparency: 3.8,
	Fit: 3.8,
}

const involvementCompatibility: Record<string, string[]> = {
	veryInvolved: ['scheduled', 'milestone'],
	keyDetails: ['milestone', 'clientPaced'],
	handsOff: ['clientPaced'],
}

const representationCompatibility: Record<string, string[]> = {
	access: ['sameBrokerage', 'sellerOnly'],
	exclusive: ['separateBrokerage'],
}

const experienceCompatibility: Record<string, string[]> = {
	firstTime: ['firstTime'],
	experienced: ['moveUp', 'relocation', 'investor', 'condoTownhome'],
	veryExperienced: ['luxury', 'investor', 'landMultiFamily'],
}

const contactCompatibility: Record<string, string[]> = {
	text: ['text', 'adaptable'],
	call: ['call', 'adaptable'],
	email: ['callThenEmail', 'email'],
}

const propertyTypeToClientType: Record<string, string[]> = {
	singleFamily: ['firstTime', 'moveUp', 'seller'],
	condoTownhome: ['condoTownhome', 'moveUp', 'seller'],
	multiFamily: ['landMultiFamily', 'investor'],
	land: ['landMultiFamily', 'investor'],
}

function toStars(points: number, maxPoints: number): number {
	if (maxPoints === 0) return 3.8
	return Number((3 + (points / maxPoints) * 2).toFixed(1))
}

function categoryWeight(
	questionIds: string[],
	priorities: string[] | null | undefined,
): number {
	if (!priorities || priorities.length === 0) return 1
	return priorities.some((id) => questionIds.includes(id)) ? 1.5 : 1
}

function isCompatible(
	consumerValue: string | null | undefined,
	compatibility: Record<string, string[]>,
	agentValue: string | null | undefined,
): boolean {
	if (!consumerValue || !agentValue) return false
	const compatible = compatibility[consumerValue]
	return compatible ? compatible.includes(agentValue) : false
}

function hasAnyCompatible(
	consumerValue: string | null | undefined,
	compatibility: Record<string, string[]>,
	agentValues: string[] | null | undefined,
): boolean {
	if (!consumerValue || !agentValues || agentValues.length === 0) return false
	const compatible = compatibility[consumerValue] ?? []
	return agentValues.some((value) => compatible.includes(value))
}

function hasOverlap(
	a: string[] | null | undefined,
	b: string[] | null | undefined,
): boolean {
	if (!a || a.length === 0 || !b || b.length === 0) return false
	return a.some((value) => b.includes(value))
}

function priceRangeMatch(
	consumerRange: string | null | undefined,
	agentRange: string | null | undefined,
): boolean {
	const consumer = parsePriceRange(consumerRange)
	const agentSlug = agentRange?.trim() ?? ''
	const agent = AGENT_PRICE_RANGES[agentSlug]
	if (!agent) return false
	return consumer.min < agent.max && consumer.max > agent.min
}

export function calculateFitScore(
	agent: AgentProfile,
	consumer?: ConsumerProfile,
): { fitScore: number; scores: Record<ScoreBucket, number> } {
	if (!consumer) return calculateFallbackScore(agent)

	const buckets: Record<ScoreBucket, { points: number; max: number }> = {
		'Working Style': { points: 0, max: 0 },
		Communication: { points: 0, max: 0 },
		Transparency: { points: 0, max: 0 },
		Fit: { points: 0, max: 0 },
	}

	let weightedPoints = 0
	let weightedMax = 0

	const add = (
		bucket: ScoreBucket,
		points: number,
		max: number,
		questionIds: string[],
	) => {
		const weight = categoryWeight(questionIds, consumer.matchPriorities)
		weightedPoints += points * weight
		weightedMax += max * weight
		buckets[bucket].points += points
		buckets[bucket].max += max
	}

	add(
		'Communication',
		isCompatible(
			consumer.preferredContactMethod,
			contactCompatibility,
			agent.quickContactStyle,
		) ||
			isCompatible(
				consumer.preferredContactMethod,
				contactCompatibility,
				agent.updateDeliveryStyle,
			)
			? 2
			: 0,
		2,
		['preferredContactMethod'],
	)

	add(
		'Working Style',
		isCompatible(
			consumer.involvementLevel,
			involvementCompatibility,
			agent.communicationCadence,
		)
			? 2
			: 0,
		2,
		['involvementLevel'],
	)

	add(
		'Transparency',
		isCompatible(
			consumer.representationPreference,
			representationCompatibility,
			agent.dualAgencyStyle,
		)
			? 2
			: 0,
		2,
		['representationPreference'],
	)

	const consumerPropertyTypes = consumer.propertyTypes ?? []
	const agentClientTypes = agent.bestClientTypes
	const propertyClientMatches = consumerPropertyTypes.flatMap(
		(type) => propertyTypeToClientType[type] ?? [],
	)
	add('Fit', hasOverlap(propertyClientMatches, agentClientTypes) ? 1 : 0, 1, [
		'propertyTypes',
	])

	add(
		'Fit',
		hasAnyCompatible(
			consumer.experienceLevel,
			experienceCompatibility,
			agentClientTypes,
		)
			? 1
			: 0,
		1,
		['experienceLevel'],
	)

	add(
		'Fit',
		agent.representationSide === 'both' ||
			agent.representationSide === consumer.intent
			? 2
			: 0,
		2,
		['representationSide'],
	)

	add(
		'Fit',
		priceRangeMatch(consumer.priceRange, agent.typicalPriceRange) ? 2 : 0,
		2,
		['priceRange'],
	)

	add(
		'Fit',
		agent.serviceAreas.some(
			(area) =>
				area &&
				consumer.state &&
				area.toLowerCase() === consumer.state.toLowerCase(),
		)
			? 1
			: 0,
		1,
		['state'],
	)

	const peacePactBonus = agent.peacePactSigned ? 3 : 0
	const fitScore =
		weightedMax > 0
			? Math.min(
					100,
					Math.round((weightedPoints / weightedMax) * 97 + peacePactBonus),
				)
			: calculateFallbackScore(agent).fitScore

	return {
		fitScore,
		scores: Object.fromEntries(
			Object.entries(buckets).map(([bucket, result]) => [
				bucket,
				result.max > 0
					? toStars(result.points, result.max)
					: DEFAULT_BUCKET_SCORES[bucket as ScoreBucket],
			]),
		) as Record<ScoreBucket, number>,
	}
}

function calculateFallbackScore(agent: AgentProfile): {
	fitScore: number
	scores: Record<ScoreBucket, number>
} {
	const fit = [
		agent.representationSide,
		agent.typicalPriceRange,
		agent.bestClientTypes.length ? 'client-types' : null,
		agent.peacePactSigned ? 'peace-pact' : null,
	].filter((value): value is string => typeof value === 'string').length
	const workingStyle = [
		agent.energyStyle,
		agent.teachingStyle,
		agent.dealStressStyle,
		agent.decisionMakingStyle,
	].filter(Boolean).length
	const communication = [
		agent.communicationCadence,
		agent.quickContactStyle,
		agent.updateDeliveryStyle,
		agent.responseTime,
	].filter(Boolean).length
	const transparency = [
		agent.transparencyStyle,
		agent.clientBoundaryStyle,
		agent.negotiationEthic,
		agent.dualAgencyStyle,
	].filter(Boolean).length
	const max = 16
	const points = fit + workingStyle + communication + transparency

	return {
		fitScore: Math.round((points / max) * 100),
		scores: {
			'Working Style': toStars(workingStyle, 4),
			Communication: toStars(communication, 4),
			Transparency: toStars(transparency, 4),
			Fit: toStars(fit, 4),
		},
	}
}
