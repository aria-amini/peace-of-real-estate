import { createServerFn } from '@tanstack/react-start'
import { eq, or } from 'drizzle-orm'

import { db } from '@/db/connection'
import { agentProfiles, consumerProfiles, user } from '@/db/tables'
import { requireUserId } from '@/lib/auth/functions'
import { calculateFitScore, type AgentMatchData } from '@/lib/matching/scoring'
import { getAvatarUrl } from '@/lib/s3'

export const loadAgentMatches = createServerFn({ method: 'GET' }).handler(
	async (): Promise<AgentMatchData[]> => {
		const userId = await requireUserId()

		const [consumer] = await db
			.select()
			.from(consumerProfiles)
			.where(eq(consumerProfiles.userId, userId))
			.limit(1)

		const results = await db
			.select({
				agent: agentProfiles,
				user,
			})
			.from(agentProfiles)
			.innerJoin(user, eq(agentProfiles.userId, user.id))
			.where(
				or(
					eq(agentProfiles.status, 'active'),
					eq(agentProfiles.status, 'enriched'),
				),
			)

		const scored = results.map((row) => ({
			row,
			score: calculateFitScore(row.agent, consumer),
		}))

		scored.sort((a, b) => b.score.fitScore - a.score.fitScore)
		const top = scored.slice(0, 5)

		return Promise.all(
			top.map(async ({ row, score }, index) => {
				const avatar = await getAvatarUrl(row.user.image)

				return {
					id: row.agent.id,
					name: row.user.name,
					role: 'agent' as const,
					location: 'Austin, TX',
					zipCodes: row.agent.serviceAreas,
					fitScore: score.fitScore,
					status: 'new' as const,
					date: 'Just now',
					experience: row.agent.yearsLicensed ?? '',
					agency: row.agent.brokerageName ?? '',
					specialties: row.agent.bestClientTypes,
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
	},
)
