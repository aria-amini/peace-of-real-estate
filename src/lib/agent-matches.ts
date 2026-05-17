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
	scores: Record<string, number>
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

export async function getAgentMatches(): Promise<AgentMatchData[]> {
	const response = await fetch('/api/agent-matches')
	if (!response.ok) {
		throw new Error(`Failed to load agent matches: ${response.status}`)
	}

	return response.json()
}
