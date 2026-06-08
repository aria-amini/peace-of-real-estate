import { MapPin, Star, Award } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { MatchDetails, MatchStatus } from '@/components/match-card'

export { type MatchDetails, type MatchStatus }

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

// ─── Design 1: Modern Profile (Refined) ──────────────────────────────

export function MatchCardModern({
	match,
	disabled = false,
	locked = false,
}: {
	match: MatchDetails
	disabled?: boolean
	locked?: boolean
}) {
	const initials = match.name
		.split(' ')
		.map((n) => n[0])
		.join('')
	const [avatarFailed, setAvatarFailed] = useState(false)
	const showAvatar = Boolean(match.avatar) && !avatarFailed

	return (
		<Card className="overflow-hidden">
			<CardContent className="p-6">
				{/* Header */}
				<div className="flex items-start gap-4">
					<div className="shrink-0">
						{showAvatar ? (
							<img
								src={match.avatar}
								alt={match.name}
								className={cn(
									'h-16 w-16 rounded-2xl object-cover',
									locked && 'blur-md',
								)}
								onError={() => setAvatarFailed(true)}
							/>
						) : (
							<div
								className={cn(
									'bg-secondary flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-medium',
									locked && 'blur-md select-none',
								)}
							>
								{initials}
							</div>
						)}
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-2">
							<div>
								<div className="flex items-center gap-2">
									<h3
										className={cn(
											'text-xl font-bold',
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
							</div>
						</div>
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
				<p className="text-muted-foreground mt-4 text-sm leading-relaxed">
					{match.about}
				</p>

				{/* Specialties */}
				<div className="mt-4 flex flex-wrap gap-1.5">
					{match.specialties.map((s) => (
						<span
							key={s}
							className="bg-secondary rounded-full px-2.5 py-0.5 text-[11px]"
						>
							{s}
						</span>
					))}
				</div>

				{/* Stats */}
				<div className="mt-6 grid grid-cols-4 gap-4">
					<div>
						<div className="text-muted-foreground mb-1 text-xs">Deals</div>
						<div className="text-2xl font-bold">
							{match.stats?.transactions}
						</div>
					</div>
					<div>
						<div className="text-muted-foreground mb-1 text-xs">Days</div>
						<div className="text-2xl font-bold">{match.stats?.avgDays}</div>
					</div>
					<div>
						<div className="text-muted-foreground mb-1 text-xs">Match</div>
						<div className="text-2xl font-bold">{match.fitScore}%</div>
					</div>
					<div>
						<div className="text-muted-foreground mb-1 text-xs">Rating</div>
						<div className="flex items-center gap-1 text-2xl font-bold">
							<Star className="fill-accent text-accent h-5 w-5" />
							{match.stats?.satisfaction}
						</div>
					</div>
				</div>

				{/* Actions */}
				{!locked && (
					<div className="mt-6 flex justify-center">
						<Button
							disabled={disabled}
							className="h-12 rounded-2xl px-12 text-base"
						>
							Accept Match
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
