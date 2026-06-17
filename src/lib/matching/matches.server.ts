import { getDb } from '@/db/connection'
import { user, agentProfiles, buyerProfiles } from '@/db/tables'
import { serverEnv } from '@/env.server'
import type { AgentMatchData } from '@/lib/matching/matches'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { eq, or } from 'drizzle-orm'

type AgentProfile = typeof agentProfiles.$inferSelect
type BuyerProfile = typeof buyerProfiles.$inferSelect
type ConsumerProfile = { kind: 'buyer'; profile: BuyerProfile }

type ScoreBreakdown = {
	fitScore: number
	scores: Record<string, number>
}

type ScoreBucket = 'Working Style' | 'Communication' | 'Transparency' | 'Fit'

const DEFAULT_BUCKET_SCORES: Record<ScoreBucket, number> = {
	'Working Style': 3.8,
	Communication: 3.8,
	Transparency: 3.8,
	Fit: 3.8,
}

function normalize(value?: string | null) {
	return (
		value
			?.toLowerCase()
			.replace(/[^a-z0-9]+/g, ' ')
			.trim() ?? ''
	)
}

function hasAny(value: string | undefined | null, needles: string[]) {
	const normalized = normalize(value)
	return needles.some((needle) => normalized.includes(needle))
}

function startsSimilarly(a?: string | null, b?: string | null) {
	const [firstA] = normalize(a).split(' ')
	const [firstB] = normalize(b).split(' ')
	return Boolean(firstA && firstB && firstA === firstB)
}

function overlaps(a?: string[] | null, b?: string[] | null) {
	if (!a?.length || !b?.length) return false
	const normalizedB = b.map(normalize)
	return a.some((item) => {
		const normalized = normalize(item)
		return normalizedB.some(
			(candidate) =>
				candidate.includes(normalized) || normalized.includes(candidate),
		)
	})
}

function categoryWeight(questionIds: string[], priorities?: string[] | null) {
	if (!priorities?.length) return 1
	const hasPriority = priorities.some((questionId) =>
		questionIds.includes(questionId),
	)
	return hasPriority ? 1.5 : 1
}

function toStars(points: number, maxPoints: number) {
	if (maxPoints === 0) return 3.8
	return Number((3 + (points / maxPoints) * 2).toFixed(1))
}

function calculateFallbackScore(agent: AgentProfile): ScoreBreakdown {
	const fit = [
		agent.representationSide,
		agent.typicalPriceRange,
		agent.bestClientTypesJson?.length ? 'client-types' : null,
		agent.peacePactSigned ? 'peace-pact' : null,
	].filter(Boolean).length
	const workingStyle = [agent.workingStyle, agent.dealStressStyle].filter(
		Boolean,
	).length
	const communication = [
		agent.communicationCadence,
		agent.quickContactStyle,
		agent.updateDeliveryStyle,
		agent.responseTime,
	].filter(Boolean).length
	const transparency = [agent.commissionStyle, agent.dualAgencyStyle].filter(
		Boolean,
	).length
	const max = 12
	const points = fit + workingStyle + communication + transparency

	return {
		fitScore: Math.round((points / max) * 100),
		scores: {
			'Working Style': toStars(workingStyle, 2),
			Communication: toStars(communication, 4),
			Transparency: toStars(transparency, 2),
			Fit: toStars(fit, 4),
		},
	}
}

function calculateBuyerScore(
	profile: BuyerProfile,
	agent: AgentProfile,
): ScoreBreakdown {
	let weightedPoints = 0
	let weightedMax = 0
	const bucketPoints: Record<ScoreBucket, { points: number; max: number }> = {
		'Working Style': { points: 0, max: 0 },
		Communication: { points: 0, max: 0 },
		Transparency: { points: 0, max: 0 },
		Fit: { points: 0, max: 0 },
	}

	const add = (
		bucket: ScoreBucket,
		points: number,
		max: number,
		questionIds: string[],
	) => {
		const weight = categoryWeight(questionIds, profile.matchPrioritiesJson)
		weightedPoints += points * weight
		weightedMax += max * weight
		bucketPoints[bucket].points += points
		bucketPoints[bucket].max += max
	}

	add('Fit', agent.representationSide === 'Buyer representation' ? 2 : 0, 2, [
		'B.12',
	])
	add('Fit', agent.typicalPriceRange === profile.priceRange ? 2 : 0, 2, ['B.1'])
	add(
		'Fit',
		overlaps(profile.propertyTypesJson, agent.bestClientTypesJson) ? 1 : 0,
		1,
		['B.3'],
	)
	add(
		'Fit',
		hasAny(profile.experienceLevel, ['first time']) &&
			agent.bestClientTypesJson?.some((type) => hasAny(type, ['first time']))
			? 1
			: 0,
		1,
		['B.4'],
	)
	add(
		'Communication',
		startsSimilarly(profile.preferredContactMethod, agent.quickContactStyle)
			? 2
			: 0,
		2,
		['B.6'],
	)
	add(
		'Communication',
		startsSimilarly(profile.updateDeliveryPreference, agent.updateDeliveryStyle)
			? 2
			: 0,
		2,
		['B.7'],
	)
	add(
		'Communication',
		startsSimilarly(profile.responseTimeExpectation, agent.responseTime)
			? 2
			: 0,
		2,
		['B.13'],
	)
	add(
		'Working Style',
		hasAny(profile.decisionStyle, ['numbers']) &&
			hasAny(agent.workingStyle, ['data', 'analysis'])
			? 2
			: hasAny(profile.decisionStyle, ['advice']) &&
				  hasAny(agent.workingStyle, ['strategic', 'relational'])
				? 2
				: hasAny(profile.decisionStyle, ['gut']) &&
					  hasAny(agent.workingStyle, ['warm', 'relational'])
					? 2
					: 0,
		2,
		['B.8'],
	)
	add(
		'Working Style',
		hasAny(profile.involvementLevel, ['hands off', 'key details']) &&
			hasAny(agent.workingStyle, ['efficient', 'decisive'])
			? 2
			: hasAny(profile.involvementLevel, ['very involved']) &&
				  hasAny(agent.dealStressStyle, ['facts', 'understands'])
				? 2
				: 0,
		2,
		['B.11'],
	)
	add(
		'Transparency',
		hasAny(profile.representationPreference, ['exclusive', 'no conflicts']) &&
			hasAny(agent.dualAgencyStyle, ['separate brokerage'])
			? 2
			: 0,
		2,
		['B.12'],
	)
	add(
		'Transparency',
		hasAny(profile.commissionComfort, ['explain', 'options']) &&
			hasAny(agent.commissionStyle, ['proactively', 'open'])
			? 2
			: 0,
		2,
		['B.14'],
	)

	return finalizeScore(weightedPoints, weightedMax, bucketPoints, agent)
}

function finalizeScore(
	weightedPoints: number,
	weightedMax: number,
	bucketPoints: Record<ScoreBucket, { points: number; max: number }>,
	agent: AgentProfile,
): ScoreBreakdown {
	const peacePactBonus = agent.peacePactSigned ? 3 : 0
	const fitScore = Math.min(
		100,
		Math.round((weightedPoints / weightedMax) * 97 + peacePactBonus),
	)

	return {
		fitScore,
		scores: Object.fromEntries(
			Object.entries(bucketPoints).map(([bucket, result]) => [
				bucket,
				result.max > 0
					? toStars(result.points, result.max)
					: DEFAULT_BUCKET_SCORES[bucket as ScoreBucket],
			]),
		),
	}
}

function calculateFitScore(
	agent: AgentProfile,
	consumer?: ConsumerProfile,
): ScoreBreakdown {
	if (!consumer) return calculateFallbackScore(agent)

	return calculateBuyerScore(consumer.profile, agent)
}

function sortByFitScoreDesc(
	a: { fitScore: number },
	b: { fitScore: number },
): number {
	if (b.fitScore > a.fitScore) return 1
	if (b.fitScore < a.fitScore) return -1
	return 0
}

let storageClient: S3Client | undefined

async function getConsumerProfile(
	userId: string,
): Promise<ConsumerProfile | undefined> {
	const db = getDb()
	const [buyer] = await db
		.select()
		.from(buyerProfiles)
		.where(eq(buyerProfiles.userId, userId))
		.limit(1)

	if (buyer) return { kind: 'buyer', profile: buyer }
	return undefined
}

function getStorageClient() {
	storageClient ??= new S3Client({
		region: serverEnv.AWS_REGION ?? 'auto',
		endpoint: serverEnv.AWS_ENDPOINT_URL ?? '',
		credentials: {
			accessKeyId: serverEnv.AWS_ACCESS_KEY_ID ?? '',
			secretAccessKey: serverEnv.AWS_SECRET_ACCESS_KEY ?? '',
		},
		forcePathStyle: true,
	})

	return storageClient
}

async function resolveAvatarUrl(image?: string | null) {
	if (!image) {
		return undefined
	}

	if (/^https?:\/\//.test(image)) {
		return image
	}

	const avatarBucket = serverEnv.AVATAR_BUCKET
	if (!avatarBucket) {
		return undefined
	}

	return getSignedUrl(
		getStorageClient(),
		new GetObjectCommand({
			Bucket: avatarBucket,
			Key: image,
		}),
		{ expiresIn: 60 * 60 },
	)
}

export async function listAgentMatches(
	userId?: string,
): Promise<AgentMatchData[]> {
	const db = getDb()
	const consumer = userId ? await getConsumerProfile(userId) : undefined

	const results = await db
		.select({
			agent: agentProfiles,
			user: user,
		})
		.from(agentProfiles)
		.innerJoin(user, eq(agentProfiles.userId, user.id))
		.where(
			or(
				eq(agentProfiles.status, 'submitted'),
				eq(agentProfiles.status, 'active'),
			),
		)

	const scored = results.map((row) => {
		const score = calculateFitScore(row.agent, consumer)

		return { row, score }
	})

	scored.sort((a, b) => sortByFitScoreDesc(a.score, b.score))
	const top5 = scored.slice(0, 5)

	return Promise.all(
		top5.map(async ({ row, score }, index) => {
			const avatar = await resolveAvatarUrl(row.user.image)

			return {
				id: row.agent.id,
				name: row.user.name,
				role: 'agent' as const,
				location: 'Austin, TX',
				zipCodes: [
					row.agent.serviceArea1,
					row.agent.serviceArea2,
					row.agent.serviceArea3,
				].filter((area): area is string => Boolean(area)),
				fitScore: score.fitScore,
				status: 'new' as const,
				date: 'Just now',
				experience: row.agent.yearsLicensed ?? '',
				agency: row.agent.brokerageName ?? '',
				specialties: row.agent.bestClientTypesJson ?? [],
				about:
					row.agent.valueProposition ??
					'Experienced real estate professional serving the local community.',
				scores: score.scores,
				contact: {
					email: row.user.email,
				},
				stats: {
					transactions: Number(row.agent.averageTransactions) || 50,
					avgDays: 14,
					satisfaction: row.agent.peacePactSigned ? 4.9 : 4.7,
				},
				isTopMatch: index === 0,
				...(avatar ? { avatar } : {}),
			}
		}),
	)
}
