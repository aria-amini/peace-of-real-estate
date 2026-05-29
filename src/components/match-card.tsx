import { MapPin, Star, Phone, Mail, Award } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export type MatchStatus = 'pending' | 'accepted' | 'completed' | 'new'

export interface MatchDetails {
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

function ScoreDots({ score }: { score: number }) {
	const filled = Math.round((score / 5) * 5)
	return (
		<div className="flex gap-0.5">
			{Array.from({ length: 5 }).map((_, i) => (
				<div
					key={i}
					className={`h-1.5 w-1.5 rounded-full ${
						i < filled ? 'bg-primary' : 'bg-border'
					}`}
				/>
			))}
		</div>
	)
}

export function MatchCard({ match }: { match: MatchDetails }) {
	const initials = match.name
		.split(' ')
		.map((n) => n[0])
		.join('')
	const [avatarFailed, setAvatarFailed] = useState(false)
	const showAvatar = Boolean(match.avatar) && !avatarFailed

	return (
		<Card className="overflow-hidden">
			<CardContent className="p-0">
				<div className="flex">
					{/* Left column: info */}
					<div className="flex-1 p-4">
						{/* Identity */}
						<div className="flex items-start gap-3">
							{showAvatar ? (
								<img
									src={match.avatar}
									alt={match.name}
									className="h-12 w-12 shrink-0 object-cover"
									loading="lazy"
									onError={() => setAvatarFailed(true)}
								/>
							) : (
								<div className="bg-secondary flex h-12 w-12 shrink-0 items-center justify-center text-base font-medium">
									{initials}
								</div>
							)}

							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-1.5">
									<span className="font-heading text-base font-medium">
										{match.name}
									</span>
									{match.isTopMatch && (
										<span className="inline-flex items-center gap-0.5 text-[10px] font-medium">
											<Star className="h-2.5 w-2.5 fill-current" />
											Top
										</span>
									)}
								</div>
								<div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
									{match.agency && (
										<span className="truncate">{match.agency}</span>
									)}
									<span className="flex items-center gap-0.5">
										<MapPin className="h-3 w-3" />
										{match.location}
									</span>
									{match.experience && (
										<span className="flex items-center gap-0.5">
											<Award className="h-3 w-3" />
											{match.experience}
										</span>
									)}
								</div>
							</div>
						</div>

						{/* About */}
						<p className="text-muted-foreground mt-2 text-xs leading-snug">
							{match.about}
						</p>

						{/* Stats + Specialties */}
						<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
							{match.stats && (
								<>
									<span>
										<strong>{match.stats.transactions}</strong> deals
									</span>
									<span className="text-muted-foreground">·</span>
									<span>
										<strong>{match.stats.avgDays}</strong> days
									</span>
									<span className="text-muted-foreground">·</span>
									<span>
										<strong>{match.stats.satisfaction}</strong> rating
									</span>
								</>
							)}
						</div>

						{/* Compatibility */}
						<div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
							{Object.entries(match.scores).map(([label, score]) => (
								<div
									key={label}
									className="flex items-center justify-between gap-2"
								>
									<span className="text-[11px]">{label}</span>
									<div className="flex items-center gap-1.5">
										<ScoreDots score={score} />
										<span className="text-muted-foreground text-[10px] tabular-nums">
											{score.toFixed(1)}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Right column: score + action */}
					<div className="bg-muted/30 flex w-24 shrink-0 flex-col items-center justify-center gap-2 border-l p-4">
						<div className="text-3xl leading-none font-bold">
							{match.fitScore}
						</div>
						<div className="text-muted-foreground text-[10px] tracking-wide uppercase">
							Fit
						</div>
						{match.status === 'new' && (
							<Button size="sm" className="mt-1 h-7 text-xs">
								Accept
							</Button>
						)}
						{match.status === 'pending' && (
							<Button
								size="sm"
								variant="secondary"
								className="mt-1 h-7 text-xs"
							>
								Profile
							</Button>
						)}
						{match.status === 'accepted' && (
							<Button
								size="sm"
								variant="secondary"
								className="mt-1 h-7 text-xs"
							>
								Message
							</Button>
						)}
					</div>
				</div>

				{/* Bottom bar: contact */}
				<div className="flex items-center justify-end border-t px-4 py-2 text-xs">
					<div className="flex items-center gap-1">
						{match.contact?.phone && (
							<Button asChild size="icon" variant="ghost" className="h-6 w-6">
								<a href={`tel:${match.contact.phone}`}>
									<Phone className="h-3 w-3" />
								</a>
							</Button>
						)}
						{match.contact?.email && (
							<Button asChild size="icon" variant="ghost" className="h-6 w-6">
								<a href={`mailto:${match.contact.email}`}>
									<Mail className="h-3 w-3" />
								</a>
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
