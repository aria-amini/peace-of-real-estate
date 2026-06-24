import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
	ArrowRight,
	CalendarClock,
	Mail,
	MessageSquare,
	Users,
} from 'lucide-react'

import {
	DashboardPage,
	DashboardPageHeader,
	DashboardPageMobileNav,
	StatusRow,
} from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { loadAgentMatches } from '@/lib/matching/profile'
import { cn } from '@/lib/utils/ui'

export const Route = createFileRoute('/(app)/consumer/dashboard/introductions')(
	{
		component: Introductions,
	},
)

const introductionSteps = [
	{
		label: 'Request intro',
		description: 'Choose a match and ask PRE to make the connection.',
		icon: Users,
	},
	{
		label: 'Warm handoff',
		description: 'We package your fit context so the first reply is useful.',
		icon: Mail,
	},
	{
		label: 'First conversation',
		description: 'Track status and keep the next step visible.',
		icon: MessageSquare,
	},
]

function Introductions() {
	const { data: matches = [], isLoading } = useQuery({
		queryKey: ['agent-matches'],
		queryFn: loadAgentMatches,
	})
	const introductionCandidates = matches.slice(0, 3)

	return (
		<DashboardPage>
			<DashboardPageMobileNav label="Account menu" />
			<div className="mx-auto w-full max-w-5xl">
				<DashboardPageHeader
					icon={Users}
					eyebrow="Introductions"
					title="Turn strong matches into warm conversations."
					description="This is the first pass at your introduction hub. Soon this will track requested intros, accepted handoffs, and next steps with each agent."
					actions={
						<Button disabled>
							Request new introduction
							<ArrowRight className="size-4" />
						</Button>
					}
				/>

				<div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
					<Card>
						<CardHeader>
							<CardTitle>Ready for Introduction</CardTitle>
							<CardDescription>
								Top matches that can become warm intros once the flow is live.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{isLoading ? (
								<div className="text-muted-foreground rounded-2xl border p-4 text-sm">
									Loading introduction candidates...
								</div>
							) : introductionCandidates.length > 0 ? (
								introductionCandidates.map((match, index) => (
									<div
										key={match.id}
										className="flex items-center gap-4 rounded-2xl border p-4"
									>
										<div className="bg-muted flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-semibold">
											{match.avatar ? (
												<img
													src={match.avatar}
													alt=""
													className="size-full object-cover"
												/>
											) : (
												match.name
													.split(/\s+/)
													.slice(0, 2)
													.map((part) => part[0])
													.join('')
											)}
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<h2 className="truncate text-sm font-semibold">
													{match.name}
												</h2>
												<span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
													{match.fitScore}% fit
												</span>
											</div>
											<p className="text-muted-foreground truncate text-sm">
												{match.agency ?? 'Independent agent'} · {match.location}
											</p>
										</div>
										<div className="hidden text-right sm:block">
											<p className="text-muted-foreground text-xs uppercase">
												Queue
											</p>
											<p className="text-sm font-medium">#{index + 1}</p>
										</div>
									</div>
								))
							) : (
								<div className="rounded-2xl border border-dashed p-6 text-center">
									<Users className="text-muted-foreground mx-auto mb-3 size-8" />
									<h2 className="font-medium">No matches ready yet</h2>
									<p className="text-muted-foreground mt-1 text-sm">
										Complete search preferences to improve introduction quality.
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					<div className="space-y-5">
						<Card>
							<CardHeader>
								<CardTitle>How intros will work</CardTitle>
								<CardDescription>
									A simple workflow for first conversations.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{introductionSteps.map((step, index) => {
									const Icon = step.icon

									return (
										<div key={step.label} className="flex gap-3">
											<div
												className={cn(
													'flex size-8 shrink-0 items-center justify-center rounded-xl border',
													index === 0
														? 'border-primary/30 bg-primary/10 text-primary'
														: 'bg-muted text-muted-foreground',
												)}
											>
												<Icon className="size-4" />
											</div>
											<div>
												<h3 className="text-sm font-medium">{step.label}</h3>
												<p className="text-muted-foreground text-sm">
													{step.description}
												</p>
											</div>
										</div>
									)
								})}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CalendarClock className="size-4" />
									Status
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-sm">
								<StatusRow label="Requested" value="0" />
								<StatusRow label="Accepted" value="0" />
								<StatusRow label="Needs follow-up" value="0" />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</DashboardPage>
	)
}
