import { createFileRoute } from '@tanstack/react-router'
import {
	ArrowRightLeft,
	MapPin,
	Star,
	MessageCircle,
	Shield,
	Zap,
	Users,
	Phone,
	Mail,
	Award,
} from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getAgentMatches } from '@/lib/agent-matches'

export const Route = createFileRoute('/_app/match-activity')({
	component: MatchActivity,
})

// ─── Types ───────────────────────────────────────────────────────────

type MatchStatus = 'pending' | 'accepted' | 'completed' | 'new'

interface MatchDetails {
	id: string
	name: string
	role: 'buyer' | 'seller' | 'agent'
	location: string
	zipCodes: string[]
	fitScore: number
	status: MatchStatus
	date: string
	avatar?: string
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
}

// ─── Sub-Components ──────────────────────────────────────────────────

function FitScoreRing({ score, size = 56 }: { score: number; size?: number }) {
	const circumference = 2 * Math.PI * ((size - 4) / 2)
	const offset = circumference - (score / 100) * circumference
	return (
		<div
			className="relative inline-flex items-center justify-center"
			style={{ width: size, height: size }}
		>
			<svg width={size} height={size} className="-rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={(size - 4) / 2}
					fill="none"
					stroke="var(--border)"
					strokeWidth="3"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={(size - 4) / 2}
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					className="transition-all duration-1000"
				/>
			</svg>
			<span className="absolute text-sm">{score}</span>
		</div>
	)
}

function ScoreBar({ label, score }: { label: string; score: number }) {
	const percentage = (score / 5) * 100

	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between text-xs">
				<span className="text-muted-foreground">{label}</span>
				<span>{score.toFixed(1)}</span>
			</div>
			<div className="bg-border h-1.5 overflow-hidden">
				<div
					className="bg-primary h-full"
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	)
}

function MatchCard({
	match,
	isExpanded,
	onToggle,
}: {
	match: MatchDetails
	isExpanded: boolean
	onToggle: () => void
}) {
	const initials = match.name
		.split(' ')
		.map((n) => n[0])
		.join('')
	const [avatarFailed, setAvatarFailed] = useState(false)
	const showAvatar = Boolean(match.avatar) && !avatarFailed

	return (
		<Card>
			{/* Top Match Banner */}
			{match.isTopMatch && (
				<div className="flex items-center gap-2 px-6 py-2 text-xs">
					<Star className="h-3.5 w-3.5 fill-current" />
					Top Match — Highest Compatibility
				</div>
			)}

			{/* Main Card Content */}
			<CardContent>
				<div className="flex items-start gap-5">
					{/* Avatar */}
					{showAvatar ? (
						<img
							src={match.avatar}
							alt={match.name}
							className="h-14 w-14 shrink-0 object-cover"
							loading="lazy"
							onError={() => setAvatarFailed(true)}
						/>
					) : (
						<div className="flex h-14 w-14 shrink-0 items-center justify-center text-lg">
							{initials}
						</div>
					)}

					{/* Info */}
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="font-heading text-lg">{match.name}</h3>
							{match.agency && (
								<span className="text-muted-foreground text-sm">
									{match.agency}
								</span>
							)}
						</div>

						<div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-sm">
							<span className="flex items-center gap-1">
								<MapPin className="h-3.5 w-3.5" />
								{match.location}
							</span>
							{match.experience && (
								<span className="flex items-center gap-1">
									<Award className="h-3.5 w-3.5" />
									{match.experience}
								</span>
							)}
						</div>

						{/* Zip Codes */}
						<div className="mt-2 flex flex-wrap items-center gap-1.5">
							<span className="text-muted-foreground text-xs">Serves:</span>
							{match.zipCodes.map((zip) => (
								<span key={zip} className="border px-2 py-0.5 text-xs">
									{zip}
								</span>
							))}
						</div>
					</div>

					{/* Fit Score & Status */}
					<div className="flex flex-col items-end gap-2">
						<FitScoreRing score={match.fitScore} />
					</div>
				</div>

				{/* Specialties */}
				<div className="mt-4 flex flex-wrap gap-2">
					{match.specialties.map((specialty) => (
						<span key={specialty} className="border px-3 py-1 text-xs">
							{specialty}
						</span>
					))}
				</div>

				{/* Expand/Collapse */}
				<button
					onClick={onToggle}
					className="text-muted-foreground mt-4 flex w-full items-center justify-center gap-2 border-t pt-4 text-xs"
				>
					{isExpanded ? 'Show less' : 'View full profile'}
					<svg
						className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d={isExpanded ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
						/>
					</svg>
				</button>

				{/* Expanded Details */}
				{isExpanded && (
					<div className="animate-fade-in mt-6 space-y-6 border-t pt-6">
						{/* About */}
						<div>
							<div className="text-muted-foreground mb-2 text-sm">About</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{match.about}
							</p>
						</div>

						{/* Stats Grid */}
						{match.stats && (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<div className="px-4 py-3 text-center sm:p-4">
									<div className="text-xl">{match.stats.transactions}</div>
									<div className="text-muted-foreground mt-1 text-xs">
										Transactions
									</div>
								</div>
								<div className="px-4 py-3 text-center sm:p-4">
									<div className="text-xl">{match.stats.avgDays}</div>
									<div className="text-muted-foreground mt-1 text-xs">
										Avg. Days
									</div>
								</div>
								<div className="px-4 py-3 text-center sm:p-4">
									<div className="text-xl">{match.stats.satisfaction}</div>
									<div className="text-muted-foreground mt-1 text-xs">
										Rating
									</div>
								</div>
							</div>
						)}

						{/* Fit Breakdown */}
						<div>
							<div className="text-muted-foreground mb-3 text-sm">
								Compatibility Breakdown
							</div>
							<div className="grid gap-3 sm:grid-cols-2">
								{Object.entries(match.scores).map(([label, score]) => (
									<ScoreBar key={label} label={label} score={score} />
								))}
							</div>
						</div>

						{/* Contact */}
						{match.contact && (
							<div className="flex flex-wrap gap-4">
								{match.contact.phone && (
									<Button asChild size="sm" variant="secondary">
										<a href={`tel:${match.contact.phone}`}>
											<Phone className="h-3.5 w-3.5" />
											{match.contact.phone}
										</a>
									</Button>
								)}
								{match.contact.email && (
									<Button asChild size="sm" variant="secondary">
										<a href={`mailto:${match.contact.email}`}>
											<Mail className="h-3.5 w-3.5" />
											{match.contact.email}
										</a>
									</Button>
								)}
							</div>
						)}

						{/* Actions */}
						<div className="flex items-center justify-between border-t pt-4">
							<div className="text-muted-foreground flex items-center gap-2 text-xs">
								<Shield className="h-3.5 w-3.5" />
								Peace Pact signed
							</div>
							{match.status === 'new' && (
								<Button size="sm">
									<MessageCircle className="h-3.5 w-3.5" />
									Accept Introduction
								</Button>
							)}
							{match.status === 'pending' && (
								<Button size="sm" variant="secondary">
									<Users className="h-3.5 w-3.5" />
									View Profile
								</Button>
							)}
							{match.status === 'accepted' && (
								<Button size="sm" variant="secondary">
									<MessageCircle className="h-3.5 w-3.5" />
									Message
								</Button>
							)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

// ─── Main Component ──────────────────────────────────────────────────

function MatchActivity() {
	const [expandedId, setExpandedId] = useState<string | null>('1')
	const [filter, setFilter] = useState<MatchStatus | 'all'>('all')

	const { data: matches = [], isLoading } = useQuery({
		queryKey: ['agent-matches'],
		queryFn: getAgentMatches,
	})

	const filteredMatches =
		filter === 'all' ? matches : matches.filter((m) => m.status === filter)

	return (
		<div className="mx-auto w-full max-w-5xl px-6 py-12">
			{/* Header */}
			<div className="mb-10">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center border">
						<ArrowRightLeft className="h-6 w-6" />
					</div>
					<div>
						<div className="text-muted-foreground mb-1 text-sm">Dashboard</div>
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
						<MatchCard
							key={match.id}
							match={match}
							isExpanded={expandedId === match.id}
							onToggle={() =>
								setExpandedId(expandedId === match.id ? null : match.id)
							}
						/>
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
