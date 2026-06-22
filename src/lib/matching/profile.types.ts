import type { agentProfiles, consumerProfiles } from '@/db/tables'

export type ProfileStatus =
	| 'draft'
	| 'essentials_submitted'
	| 'active'
	| 'enriched'

export type DeepProfileStatus = 'not_started' | 'in_progress' | 'complete'

export type ProfileRole = 'consumer' | 'agent'

export type RepresentationSide = 'buying' | 'selling' | 'both'

export type ConsumerProfile = typeof consumerProfiles.$inferSelect

export type ConsumerProfileInsert = typeof consumerProfiles.$inferInsert

export type AgentProfile = typeof agentProfiles.$inferSelect

export type AgentProfileInsert = typeof agentProfiles.$inferInsert

export type ConsumerProfileUpdate = Partial<
	Omit<ConsumerProfileInsert, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>

export type AgentProfileUpdate = Partial<
	Omit<AgentProfileInsert, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>
