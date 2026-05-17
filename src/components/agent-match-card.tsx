import { Award, MapPin, MessageCircle, Shield, Star } from 'lucide-react'

export type AgentMatch = {
	id: number
	name: string
	agency: string
	location: string
	overall: number
	scores: Record<string, number>
	experience: string
	specialties: string[]
	about: string
	topMatch: boolean
}

const categoryColors: Record<string, string> = {
	'Working Style': 'bg-blue-cyan',
	Communication: 'bg-terracotta',
	Transparency: 'bg-olive',
	Fit: 'bg-ochre',
}

function ScoreBar({ label, score }: { label: string; score: number }) {
	const percentage = (score / 5) * 100
	const barClass = categoryColors[label] ?? 'bg-foreground'

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between text-xs">
				<span className="text-muted-foreground">{label}</span>
				<span className="data-number font-medium">{score.toFixed(1)}</span>
			</div>
			<div className="bg-border h-1 overflow-hidden">
				<div
					className={`${barClass} h-full transition-all duration-700`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	)
}

export function AgentMatchCard({
	match,
	index,
}: {
	match: AgentMatch
	index: number
}) {
	return (
		<div
			className="bg-card card-institutional hover:border-foreground/30 overflow-hidden transition-all"
			style={{ animationDelay: `${(index + 1) * 150}ms` }}
		>
			{match.topMatch ? (
				<div className="bg-blue-cyan text-blue-cyan-foreground flex items-center gap-2 px-6 py-2 text-xs font-semibold">
					<Star className="h-3 w-3 fill-current" />
					Top Match
				</div>
			) : null}

			<div className="p-8">
				<div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start">
					<div className="border-blue-cyan bg-blue-cyan-tint text-blue-cyan flex h-16 w-16 shrink-0 items-center justify-center border text-2xl font-bold">
						{match.name
							.split(' ')
							.map((n) => n[0])
							.join('')}
					</div>

					<div className="flex-1">
						<div className="mb-1 flex items-center gap-3">
							<h3 className="font-serif text-xl">{match.name}</h3>
							<span className="text-muted-foreground text-sm">
								{match.agency}
							</span>
						</div>

						<div className="text-muted-foreground mb-4 flex flex-wrap items-center gap-4 text-sm">
							<span className="flex items-center gap-1">
								<MapPin className="h-3.5 w-3.5" />
								{match.location}
							</span>
							<span className="flex items-center gap-1">
								<Award className="h-3.5 w-3.5" />
								{match.experience}
							</span>
						</div>

						<p className="text-muted-foreground mb-4 text-sm leading-relaxed">
							{match.about}
						</p>

						<div className="flex flex-wrap gap-2">
							{match.specialties.map((specialty) => (
								<span
									key={specialty}
									className="border-border bg-secondary text-secondary-foreground border px-3 py-1 text-xs font-medium"
								>
									{specialty}
								</span>
							))}
						</div>
					</div>

					<div className="flex flex-col items-center gap-1 md:items-end">
						<div className="border-ochre bg-ochre-tint text-ochre flex h-16 w-16 items-center justify-center border text-2xl font-bold">
							{match.overall.toFixed(1)}
						</div>
						<span className="text-muted-foreground text-xs">Overall Fit</span>
					</div>
				</div>

				<div className="border-border border-t pt-6">
					<div className="data-label mb-4">Fit Breakdown</div>
					<div className="grid gap-4 sm:grid-cols-2">
						{Object.entries(match.scores).map(([label, score]) => (
							<ScoreBar key={label} label={label} score={score} />
						))}
					</div>
				</div>

				<div className="border-border mt-6 flex items-center justify-between border-t pt-6">
					<div className="text-muted-foreground flex items-center gap-2 text-xs">
						<Shield className="h-3.5 w-3.5" />
						Peace Pact signed
					</div>
					<button className="btn-primary flex items-center gap-2">
						<MessageCircle className="h-4 w-4" />
						Select Agent
					</button>
				</div>
			</div>
		</div>
	)
}
