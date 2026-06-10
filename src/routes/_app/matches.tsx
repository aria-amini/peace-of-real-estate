import { createFileRoute } from '@tanstack/react-router'
import { ArrowRightLeft, Lock, Users } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
	MatchCardModern,
	type MatchStatus,
} from '@/components/match-card-variants'
import { PaywallDialog } from '@/components/paywall-dialog'
import { getAgentMatches } from '@/lib/agent-matches'
import { isUserPremium, redirectUnauthenticatedUsers } from '@/lib/auth-guards'

export const Route = createFileRoute('/_app/matches')({
	beforeLoad: async () => {
		await redirectUnauthenticatedUsers()
	},
	component: Matches,
})

// ─── Main Component ──────────────────────────────────────────────────

function Matches() {
	const [filter, setFilter] = useState<MatchStatus | 'all'>('all')
	const [showPaywall, setShowPaywall] = useState(false)

	const { data: premiumStatus, refetch: refetchPremium } = useQuery({
		queryKey: ['user-premium'],
		queryFn: isUserPremium,
	})
	const isLocked = !premiumStatus

	const { data: matches = [], isLoading } = useQuery({
		queryKey: ['agent-matches'],
		queryFn: getAgentMatches,
	})

	const filteredMatches =
		filter === 'all' ? matches : matches.filter((m) => m.status === filter)

	const handleUpgrade = () => {
		void refetchPremium()
	}

	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-12 xl:mx-0 xl:ml-[calc((100vw-48rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Menu</span>
			</div>
			{/* Header */}
			<div className="mx-auto mb-10 max-w-xl">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center border">
						<ArrowRightLeft className="h-6 w-6" />
					</div>
					<div>
						<h1 className="text-3xl">Match Activity</h1>
					</div>
				</div>
				<p className="text-muted-foreground mt-3 text-sm leading-relaxed">
					Track your introductions, review compatibility scores, and manage your
					agent matches all in one place.
				</p>
			</div>

			{/* Preview Banner */}
			{isLocked && (
				<div className="mx-auto mb-6 flex max-w-xl items-center gap-3 rounded-xl border bg-amber-50/50 px-4 py-3 dark:bg-amber-950/20">
					<Lock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
					<p className="text-sm">
						Preview mode — upgrade to unlock full match details and connect with
						agents.
					</p>
					<Button
						size="sm"
						className="ml-auto shrink-0"
						onClick={() => setShowPaywall(true)}
					>
						Unlock
					</Button>
				</div>
			)}

			{/* Filters */}
			<div className="mx-auto mb-6 flex max-w-xl flex-wrap items-center gap-2">
				<span className="text-muted-foreground mr-2 text-xs font-medium">
					Filter:
				</span>
				{(['all', 'new', 'pending', 'accepted', 'completed'] as const).map(
					(f) => (
						<Button
							key={f}
							onClick={() => setFilter(f)}
							variant={filter === f ? 'default' : 'outline'}
							size="sm"
							disabled={isLocked}
						>
							{f.charAt(0).toUpperCase() + f.slice(1)}
							{f !== 'all' && (
								<span className="ml-1.5 opacity-60">
									({matches.filter((m) => m.status === f).length})
								</span>
							)}
						</Button>
					),
				)}
			</div>

			{/* Match Cards */}
			<div className="mx-auto max-w-xl space-y-4">
				{isLoading ? (
					<Card className="py-16 text-center">
						<p className="text-muted-foreground text-sm">Loading matches...</p>
					</Card>
				) : filteredMatches.length === 0 ? (
					<Card className="py-16 text-center">
						<Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
						<p className="text-muted-foreground text-sm">
							No matches in this category yet.
						</p>
					</Card>
				) : (
					filteredMatches.map((match) => (
						<MatchCardModern
							key={match.id}
							match={match}
							locked={isLocked}
							onUnlock={() => setShowPaywall(true)}
						/>
					))
				)}
			</div>
			<PaywallDialog
				open={showPaywall}
				onOpenChange={setShowPaywall}
				onUpgrade={handleUpgrade}
			/>
		</div>
	)
}
