import { createFileRoute, Link } from '@tanstack/react-router'
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
import { cn } from '@/lib/utils/ui'

export const Route = createFileRoute('/(app)/agent/dashboard/introductions')({
	component: AgentIntroductions,
})

const introductionSteps = [
	{
		label: 'Consumer requests intro',
		description: 'A matched consumer asks to connect with you.',
		icon: Users,
	},
	{
		label: 'Warm handoff',
		description: 'We share fit context so your first reply is useful.',
		icon: Mail,
	},
	{
		label: 'First conversation',
		description: 'Track status and keep the next step visible.',
		icon: MessageSquare,
	},
]

function AgentIntroductions() {
	return (
		<DashboardPage>
			<DashboardPageMobileNav label="Agent menu" />
			<div className="mx-auto w-full max-w-5xl">
				<DashboardPageHeader
					icon={Users}
					eyebrow="Introductions"
					title="Manage your warm handoffs."
					description="Review incoming introduction requests, track accepted handoffs, and keep next steps with each consumer."
					actions={
						<Button disabled>
							Invite a consumer
							<ArrowRight className="size-4" />
						</Button>
					}
				/>

				<div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
					<Card>
						<CardHeader>
							<CardTitle>Introduction Requests</CardTitle>
							<CardDescription>
								Incoming requests from matched consumers.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="rounded-2xl border border-dashed p-6 text-center">
								<Users className="text-muted-foreground mx-auto mb-3 size-8" />
								<h2 className="font-medium">No requests yet</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									New introduction requests will appear here as consumers unlock
									matches.
								</p>
								<Button asChild variant="outline" size="sm" className="mt-4">
									<Link to="/agent/dashboard">Back to dashboard</Link>
								</Button>
							</div>
						</CardContent>
					</Card>

					<div className="space-y-5">
						<Card>
							<CardHeader>
								<CardTitle>How intros work</CardTitle>
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
