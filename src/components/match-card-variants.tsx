import { MapPin, Star, Award, Lock } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
export type MatchStatus = 'pending' | 'accepted' | 'completed' | 'new'

export interface MatchDetails {
	id: string
	name: string
	role: 'agent'
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

export const mockMatch1: MatchDetails = {
	id: 'mock-1',
	name: 'Sarah Chen',
	role: 'agent',
	location: 'Seattle, WA',
	zipCodes: ['98101', '98102'],
	fitScore: 94,
	status: 'new',
	date: '2026-05-28',
	experience: '8 years',
	agency: 'Windermere Real Estate',
	avatar: 'https://i.pravatar.cc/150?u=sarah-chen',
	specialties: ['Luxury Homes', 'First-Time Buyers', 'Investment Properties'],
	about:
		'Sarah specializes in matching clients with properties that fit their lifestyle and investment goals. Known for transparent communication and deep market knowledge.',
	scores: {
		Communication: 4.8,
		Transparency: 4.9,
		'Local Expertise': 4.7,
		Negotiation: 4.6,
	},
	contact: {
		phone: '206-555-0142',
		email: 'sarah.chen@windermere.com',
	},
	stats: {
		transactions: 142,
		avgDays: 18,
		satisfaction: 4.9,
	},
	isTopMatch: true,
}

export const mockMatch2: MatchDetails = {
	id: 'mock-2',
	name: 'Marcus Johnson',
	role: 'agent',
	location: 'Austin, TX',
	zipCodes: ['78701', '78702'],
	fitScore: 89,
	status: 'pending',
	date: '2026-05-27',
	experience: '12 years',
	agency: 'Austin Home Collective',
	avatar: 'https://i.pravatar.cc/150?u=marcus-johnson',
	specialties: ['New Construction', 'Relocations', 'Commercial'],
	about:
		'With over a decade in Austin real estate, Marcus knows every neighborhood. He prides himself on finding off-market deals and negotiating aggressively for his clients.',
	scores: {
		Communication: 4.5,
		Transparency: 4.7,
		'Local Expertise': 5.0,
		Negotiation: 4.9,
	},
	contact: {
		phone: '512-555-0189',
		email: 'marcus@austinhomes.com',
	},
	stats: {
		transactions: 310,
		avgDays: 12,
		satisfaction: 4.8,
	},
	isTopMatch: false,
}

export const mockMatch3: MatchDetails = {
	id: 'mock-3',
	name: 'Elena Rodriguez',
	role: 'agent',
	location: 'Miami, FL',
	zipCodes: ['33101', '33102'],
	fitScore: 91,
	status: 'accepted',
	date: '2026-05-26',
	experience: '6 years',
	agency: 'Coastal Living Realty',
	avatar: 'https://i.pravatar.cc/150?u=elena-rodriguez',
	specialties: ['Waterfront', 'Condos', 'Vacation Homes'],
	about:
		'Elena brings a fresh perspective to Miami real estate. Her background in interior design helps clients envision the potential in every property she shows.',
	scores: {
		Communication: 4.9,
		Transparency: 4.6,
		'Local Expertise': 4.8,
		Negotiation: 4.5,
	},
	contact: {
		phone: '305-555-0134',
		email: 'elena@coastalliving.com',
	},
	stats: {
		transactions: 98,
		avgDays: 22,
		satisfaction: 4.9,
	},
	isTopMatch: true,
}

function ScoreBar({ label, score }: { label: string; score: number }) {
	const percentage = (score / 5) * 100

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between text-xs">
				<span className="text-muted-foreground">{label}</span>
				<span>{score.toFixed(1)}</span>
			</div>
			<div className="bg-border h-1 overflow-hidden">
				<div
					className="bg-primary h-full"
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	)
}

// ─── Design 1: Modern Profile (Refined) ──────────────────────────────

export function MatchCardModern({
	match,
	disabled = false,
	locked = false,
	showScoreBreakdown = false,
	actionLabel,
	onUnlock,
}: {
	match: MatchDetails
	disabled?: boolean
	locked?: boolean
	showScoreBreakdown?: boolean
	actionLabel?: string
	onUnlock?: () => void
}) {
	const initials = match.name
		.split(' ')
		.map((n) => n[0])
		.join('')
	const [avatarFailed, setAvatarFailed] = useState(false)
	const showAvatar = Boolean(match.avatar) && !avatarFailed

	return (
		<Card className="mx-auto max-w-xl overflow-hidden">
			<CardContent className="p-5">
				{/* Header: Avatar + Info */}
				<div className="flex items-start gap-4">
					<div className="shrink-0">
						{showAvatar ? (
							<img
								src={match.avatar}
								alt={match.name}
								className={cn(
									'h-14 w-14 rounded-xl object-cover',
									locked && 'blur-md',
								)}
								onError={() => setAvatarFailed(true)}
							/>
						) : (
							<div
								className={cn(
									'bg-secondary flex h-14 w-14 items-center justify-center rounded-xl text-base font-medium',
									locked && 'blur-md select-none',
								)}
							>
								{initials}
							</div>
						)}
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<h3
								className={cn(
									'text-lg font-bold',
									locked && 'blur-sm select-none',
								)}
							>
								{match.name}
							</h3>
							{match.isTopMatch && (
								<span className="bg-accent/15 text-accent-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium">
									<Star className="h-3 w-3 fill-current" />
									Top
								</span>
							)}
						</div>
						<p className="text-muted-foreground text-sm">{match.agency}</p>
						<div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
							<span className="flex items-center gap-1">
								<MapPin className="h-3 w-3" />
								{match.location}
							</span>
							<span className="flex items-center gap-1">
								<Award className="h-3 w-3" />
								{match.experience}
							</span>
						</div>
					</div>
				</div>

				{/* Bio */}
				<p className="text-muted-foreground mt-3 text-sm leading-relaxed">
					{match.about}
				</p>

				{/* Specialties */}
				<div className="mt-3 flex flex-wrap gap-1.5">
					{match.specialties.map((s) => (
						<span
							key={s}
							className="bg-secondary rounded-full px-2.5 py-0.5 text-[11px]"
						>
							{s}
						</span>
					))}
				</div>

				{/* Stats Row */}
				{match.stats && (
					<div className="mt-4 flex items-center gap-3 border-t pt-3 text-sm">
						<div className="flex items-center gap-1.5">
							<span className="text-muted-foreground text-xs">Deals</span>
							<span className="font-semibold">{match.stats.transactions}</span>
						</div>
						<div className="bg-border h-3.5 w-px" />
						<div className="flex items-center gap-1.5">
							<span className="text-muted-foreground text-xs">Days</span>
							<span className="font-semibold">{match.stats.avgDays}</span>
						</div>
						<div className="bg-border h-3.5 w-px" />
						<div className="flex items-center gap-1">
							<Star className="fill-accent text-accent h-3.5 w-3.5" />
							<span className="font-semibold">{match.stats.satisfaction}</span>
						</div>
					</div>
				)}

				{/* Score Breakdown */}
				{showScoreBreakdown && (
					<div className="mt-4 border-t pt-4">
						<div className="text-muted-foreground mb-3 text-sm">
							Fit Breakdown
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{Object.entries(match.scores).map(([label, score]) => (
								<ScoreBar key={label} label={label} score={score} />
							))}
						</div>
					</div>
				)}

				{/* Actions */}
				{locked ? (
					onUnlock ? (
						<div className="mt-4">
							<Button
								className="h-11 w-full rounded-xl text-base"
								onClick={onUnlock}
							>
								<Lock className="mr-2 h-4 w-4" />
								Unlock Matches
							</Button>
						</div>
					) : null
				) : (
					<div className="mt-4">
						<Button
							disabled={disabled}
							className="h-11 w-full rounded-xl text-base"
						>
							{actionLabel ?? 'Accept Match'}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
