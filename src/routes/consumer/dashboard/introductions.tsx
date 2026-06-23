import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
	ArrowRight,
	CalendarClock,
	CheckCircle2,
	Mail,
	MessageSquare,
	Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { loadAgentMatches } from '@/lib/matching/server'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/consumer/dashboard/introductions')({
	component: Introductions,
})

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
		<div className="mx-auto w-full max-w-5xl px-6 py-10 xl:mx-0 xl:ml-[calc((100vw-64rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Account menu</span>
			</div>

			<div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-3">
					<div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl">
						<Users className="size-5" />
					</div>
					<div>
						<p className="text-muted-foreground text-sm font-medium">
							Introductions
						</p>
						<h1 className="font-heading text-3xl font-semibold tracking-tight">
							Turn strong matches into warm conversations.
						</h1>
						<p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
							This is the first pass at your introduction hub. Soon this will
							track requested intros, accepted handoffs, and next steps with
							each agent.
						</p>
					</div>
				</div>
				<Button disabled>
					Request new introduction
					<ArrowRight className="size-4" />
				</Button>
			</div>

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
	)
}

function StatusRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between rounded-xl border px-3 py-2.5">
			<div className="flex items-center gap-2">
				<CheckCircle2 className="text-muted-foreground size-4" />
				<span>{label}</span>
			</div>
			<span className="font-semibold">{value}</span>
		</div>
	)
}
