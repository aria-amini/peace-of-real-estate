import { getDb } from '@/db/connection'
import { user, agents, agentQuestionnaires } from '@/db/tables'
import { env } from '@/env'
import type { AgentMatchData } from '@/lib/agent-matches'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { eq } from 'drizzle-orm'

function calculateFitScore(
	agentWeights: Record<string, number>,
	agentAnswers: Record<string, number | number[] | string>,
): number {
	let score = 0
	for (const [, val] of Object.entries(agentAnswers)) {
		if (typeof val === 'number') {
			score += val
		}
	}

	score += (agentWeights['working-style'] ?? 0) * 0.1
	score += (agentWeights.communication ?? 0) * 0.1
	score += (agentWeights.transparency ?? 0) * 0.1
	score += (agentWeights.fit ?? 0) * 0.1
	return score
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

function getStorageClient() {
	storageClient ??= new S3Client({
		region: env.AWS_REGION ?? 'auto',
		endpoint: env.AWS_ENDPOINT_URL ?? '',
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
		},
		forcePathStyle: false,
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

	const avatarBucket = env.AVATAR_BUCKET
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

export async function listAgentMatches(): Promise<AgentMatchData[]> {
	const db = getDb()

	const results = await db
		.select({
			agent: agents,
			questionnaire: agentQuestionnaires,
			user: user,
		})
		.from(agents)
		.innerJoin(agentQuestionnaires, eq(agents.id, agentQuestionnaires.agentId))
		.innerJoin(user, eq(agents.userId, user.id))

	const scored = results.map((row) => {
		const weights = row.questionnaire.weightsJson
		const answers = row.questionnaire.answersJson
		const fitScore = calculateFitScore(weights, answers)

		return { row, fitScore }
	})

	scored.sort(sortByFitScoreDesc)
	const top5 = scored.slice(0, 5)

	return Promise.all(
		top5.map(async ({ row, fitScore }, index) => {
			const answers = row.questionnaire.answersJson
			const avatar = await resolveAvatarUrl(row.user.image)

			const workingStyleAnswers = Object.entries(answers)
				.filter(([key]) => key.startsWith('A.'))
				.map(([, val]) => (typeof val === 'number' ? val : 0))

			const avgAnswer =
				workingStyleAnswers.reduce((a, b) => a + b, 0) /
				(workingStyleAnswers.length || 1)
			const baseScore = (avgAnswer / 2) * 5

			return {
				id: row.agent.id,
				name: row.user.name,
				role: 'agent' as const,
				location: 'Austin, TX',
				zipCodes: row.agent.zipCodesJson ?? [],
				fitScore: Math.round((fitScore / 24) * 100),
				status: 'new' as const,
				date: 'Just now',
				experience: row.agent.experience ?? '',
				agency: row.agent.agency ?? '',
				specialties: row.agent.servicesJson ?? [],
				about:
					row.agent.bio ??
					'Experienced real estate professional serving the local community.',
				scores: {
					'Working Style': Math.min(5, baseScore + Math.random() * 0.5),
					Communication: Math.min(5, baseScore + Math.random() * 0.5),
					Transparency: Math.min(5, baseScore + Math.random() * 0.5),
					Fit: Math.min(5, baseScore + Math.random() * 0.5),
				},
				contact: {
					email: row.user.email,
				},
				stats: {
					transactions: Math.floor(Math.random() * 200) + 50,
					avgDays: Math.floor(Math.random() * 20) + 10,
					satisfaction: Number((Math.random() * 0.5 + 4.5).toFixed(1)),
				},
				isTopMatch: index === 0,
				...(avatar ? { avatar } : {}),
			}
		}),
	)
}
