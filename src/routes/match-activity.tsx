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
import { getAgentMatches } from '@/lib/agent-matches'

export const Route = createFileRoute('/match-activity')({
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

// ─── Color System ────────────────────────────────────────────────────

const categoryColors: Record<
	string,
	{ bg: string; text: string; bar: string }
> = {
	'Working Style': {
		bg: 'bg-blue-cyan-tint',
		text: 'text-blue-cyan',
		bar: 'bg-blue-cyan',
	},
	Communication: {
		bg: 'bg-terracotta-tint',
		text: 'text-terracotta',
		bar: 'bg-terracotta',
	},
	Transparency: {
		bg: 'bg-olive-tint',
		text: 'text-olive',
		bar: 'bg-olive',
	},
	Fit: {
		bg: 'bg-ochre-tint',
		text: 'text-ochre',
		bar: 'bg-ochre',
	},
}

// ─── Sub-Components ──────────────────────────────────────────────────

function FitScoreRing({ score, size = 56 }: { score: number; size?: number }) {
	const circumference = 2 * Math.PI * ((size - 4) / 2)
	const offset = circumference - (score / 100) * circumference
	const color =
		score >= 90
			? 'var(--color-blue-cyan)'
			: score >= 80
				? 'var(--color-olive)'
				: 'var(--color-ochre)'

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
					stroke={color}
					strokeWidth="3"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					className="transition-all duration-1000"
				/>
			</svg>
			<span
				className="data-number absolute text-sm font-bold"
				style={{ color }}
			>
				{score}
			</span>
		</div>
	)
}

function ScoreBar({ label, score }: { label: string; score: number }) {
	const percentage = (score / 5) * 100
	const colors = categoryColors[label] ?? {
		bg: 'bg-[var(--muted)]',
		text: 'text-[var(--foreground)]',
		bar: 'bg-[var(--foreground)]',
	}

	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between text-xs">
				<span className="text-muted-foreground">{label}</span>
				<span className="data-number font-semibold">{score.toFixed(1)}</span>
			</div>
			<div className="bg-border h-1.5 overflow-hidden">
				<div
					className={`${colors.bar} h-full transition-all duration-700`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	)
}

function MatchCard({
	match,
	index,
	isExpanded,
	onToggle,
}: {
	match: MatchDetails
	index: number
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
		<div
			className="bg-card card-institutional group overflow-hidden transition-colors duration-300 hover:border-[var(--foreground)]/20"
			style={{
				animationDelay: `${index * 120}ms`,
			}}
		>
			{/* Top Match Banner */}
			{match.isTopMatch && (
				<div className="bg-blue-cyan text-blue-cyan-foreground flex items-center gap-2 px-6 py-2 text-xs font-semibold tracking-wide">
					<Star className="h-3.5 w-3.5 fill-current" />
					Top Match — Highest Compatibility
				</div>
			)}

			{/* Main Card Content */}
			<div className="p-6 md:p-8">
				<div className="flex items-start gap-5">
					{/* Avatar */}
					{showAvatar ? (
						<img
							src={match.avatar}
							alt={match.name}
							className="border-blue-cyan h-14 w-14 shrink-0 border object-cover"
							loading="lazy"
							onError={() => setAvatarFailed(true)}
						/>
					) : (
						<div className="border-blue-cyan bg-blue-cyan-tint text-blue-cyan flex h-14 w-14 shrink-0 items-center justify-center border text-lg font-bold">
							{initials}
						</div>
					)}

					{/* Info */}
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="font-serif text-lg">{match.name}</h3>
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
								<span
									key={zip}
									className="bg-[var(--muted)] px-2 py-0.5 text-xs font-medium"
								>
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
						<span
							key={specialty}
							className="border-border bg-secondary text-secondary-foreground border px-3 py-1 text-xs font-medium"
						>
							{specialty}
						</span>
					))}
				</div>

				{/* Expand/Collapse */}
				<button
					onClick={onToggle}
					className="mt-4 flex w-full items-center justify-center gap-2 border-t border-[var(--border)] pt-4 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
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
					<div className="animate-fade-in mt-6 space-y-6 border-t border-[var(--border)] pt-6">
						{/* About */}
						<div>
							<div className="data-label mb-2">About</div>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{match.about}
							</p>
						</div>

						{/* Stats Grid */}
						{match.stats && (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<div className="bg-[var(--secondary)] px-4 py-3 text-center sm:p-4">
									<div className="data-number text-xl font-bold">
										{match.stats.transactions}
									</div>
									<div className="text-muted-foreground mt-1 text-xs">
										Transactions
									</div>
								</div>
								<div className="bg-[var(--secondary)] px-4 py-3 text-center sm:p-4">
									<div className="data-number text-xl font-bold">
										{match.stats.avgDays}
									</div>
									<div className="text-muted-foreground mt-1 text-xs">
										Avg. Days
									</div>
								</div>
								<div className="bg-[var(--secondary)] px-4 py-3 text-center sm:p-4">
									<div className="data-number text-xl font-bold">
										{match.stats.satisfaction}
									</div>
									<div className="text-muted-foreground mt-1 text-xs">
										Rating
									</div>
								</div>
							</div>
						)}

						{/* Fit Breakdown */}
						<div>
							<div className="data-label mb-3">Compatibility Breakdown</div>
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
									<a
										href={`tel:${match.contact.phone}`}
										className="btn-secondary inline-flex items-center gap-2 text-xs"
									>
										<Phone className="h-3.5 w-3.5" />
										{match.contact.phone}
									</a>
								)}
								{match.contact.email && (
									<a
										href={`mailto:${match.contact.email}`}
										className="btn-secondary inline-flex items-center gap-2 text-xs"
									>
										<Mail className="h-3.5 w-3.5" />
										{match.contact.email}
									</a>
								)}
							</div>
						)}

						{/* Actions */}
						<div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
							<div className="text-muted-foreground flex items-center gap-2 text-xs">
								<Shield className="h-3.5 w-3.5" />
								Peace Pact signed
							</div>
							{match.status === 'new' && (
								<button className="btn-primary flex items-center gap-2 text-xs">
									<MessageCircle className="h-3.5 w-3.5" />
									Accept Introduction
								</button>
							)}
							{match.status === 'pending' && (
								<button className="btn-secondary flex items-center gap-2 text-xs">
									<Users className="h-3.5 w-3.5" />
									View Profile
								</button>
							)}
							{match.status === 'accepted' && (
								<button className="btn-secondary flex items-center gap-2 text-xs">
									<MessageCircle className="h-3.5 w-3.5" />
									Message
								</button>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
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
					<div className="border-border bg-secondary flex h-12 w-12 items-center justify-center border">
						<ArrowRightLeft className="h-6 w-6" />
					</div>
					<div>
						<div className="data-label mb-1">Dashboard</div>
						<h1 className="font-serif text-3xl font-normal tracking-tight">
							Match Activity
						</h1>
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
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`px-3 py-1.5 text-xs font-medium transition-all ${
								filter === f
									? 'bg-[var(--foreground)] text-[var(--primary-foreground)]'
									: 'border-border bg-card border hover:border-[var(--foreground)]/30'
							}`}
						>
							{f.charAt(0).toUpperCase() + f.slice(1)}
							{f !== 'all' && (
								<span className="ml-1.5 opacity-60">
									({matches.filter((m) => m.status === f).length})
								</span>
							)}
						</button>
					),
				)}
			</div>

			{/* Match Cards */}
			<div className="space-y-4">
				{isLoading ? (
					<div className="bg-card card-institutional py-16 text-center">
						<div className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
						<p className="text-muted-foreground text-sm">Loading matches...</p>
					</div>
				) : filteredMatches.length === 0 ? (
					<div className="bg-card card-institutional py-16 text-center">
						<Users className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-30" />
						<p className="text-muted-foreground text-sm">
							No matches in this category yet.
						</p>
					</div>
				) : (
					filteredMatches.map((match, i) => (
						<MatchCard
							key={match.id}
							match={match}
							index={i}
							isExpanded={expandedId === match.id}
							onToggle={() =>
								setExpandedId(expandedId === match.id ? null : match.id)
							}
						/>
					))
				)}
			</div>

			{/* Bottom CTA */}
			<div className="border-border bg-card card-institutional mt-8 p-8">
				<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
					<div>
						<div className="data-label text-blue-cyan mb-2">
							Improve Your Matches
						</div>
						<h3 className="font-serif text-lg">
							Complete your Pax AI Deep Dive
						</h3>
						<p className="text-muted-foreground mt-1 max-w-md text-sm">
							Answer 6 core behavioral questions to sharpen match precision and
							verify working-style fit.
						</p>
					</div>
					<button className="btn-primary flex shrink-0 items-center gap-2">
						<Zap className="h-4 w-4" />
						Start Deep Dive
					</button>
				</div>
			</div>
		</div>
	)
}
