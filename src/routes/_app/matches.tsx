import { createFileRoute } from '@tanstack/react-router'
import { ArrowRightLeft, Zap, Users } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import type { MatchStatus } from '@/components/match-card'
import { MatchCardModern } from '@/components/match-card-variants'
import { getAgentMatches } from '@/lib/agent-matches'
import { redirectUnauthenticatedUsers } from '@/lib/auth-guards'

export const Route = createFileRoute('/_app/matches')({
	beforeLoad: async () => {
		await redirectUnauthenticatedUsers()
	},
	component: Matches,
})

// ─── Main Component ──────────────────────────────────────────────────

function Matches() {
	const [filter, setFilter] = useState<MatchStatus | 'all'>('all')

	const { data: matches = [], isLoading } = useQuery({
		queryKey: ['agent-matches'],
		queryFn: getAgentMatches,
	})

	const filteredMatches =
		filter === 'all' ? matches : matches.filter((m) => m.status === filter)

	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-12 xl:mx-0 xl:ml-[calc((100vw-48rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Menu</span>
			</div>
			{/* Header */}
			<div className="mb-10">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center border">
						<ArrowRightLeft className="h-6 w-6" />
					</div>
					<div>
						<h1 className="text-3xl">Match Activity</h1>
					</div>
				</div>
				<p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
					Track your introductions, review compatibility scores, and manage your
					agent matches all in one place.
				</p>
			</div>

			{/* Filters */}
			<div className="mb-6 flex flex-wrap items-center gap-2">
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
			<div className="space-y-4">
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
						<MatchCardModern key={match.id} match={match} />
					))
				)}
			</div>

			{/* Bottom CTA */}
			<Card className="mt-8">
				<CardContent>
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<div>
							<div className="text-muted-foreground mb-2 text-sm">
								Improve Your Matches
							</div>
							<h3 className="text-lg">Complete your Pax AI Deep Dive</h3>
							<p className="text-muted-foreground mt-1 max-w-md text-sm">
								Answer 6 core behavioral questions to sharpen match precision
								and verify working-style fit.
							</p>
						</div>
						<Button className="shrink-0">
							<Zap className="h-4 w-4" />
							Start Deep Dive
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
