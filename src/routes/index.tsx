import { authClient } from '@/lib/auth-client'
import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import {
	ArrowRight,
	Shield,
	MessageCircle,
	Heart,
	Eye,
	Star,
	CheckCircle2,
	ArrowUpRight,
} from 'lucide-react'

export const Route = createFileRoute('/')({
	component: Home,
})

function Home() {
	const { data: session, isPending } = authClient.useSession()

	if (isPending) {
		return <div className="flex-1" />
	}

	if (session) {
		return <Navigate to="/match-activity" />
	}

	return (
		<div className="flex flex-col">
			{/* Hero + Cards — Split layout on large screens */}
			<section className="border-border relative border-b">
				<div className="warm-gradient absolute inset-0" />
				<div className="grid-pattern absolute inset-0 opacity-[0.35]" />
				<div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-24">
					<div className="grid items-start gap-10 xl:grid-cols-2 xl:gap-16">
						{/* Left: Hero */}
						<div className="flex flex-col justify-center pt-2 xl:pt-8">
							<h1 className="mb-8 font-serif text-4xl leading-[1.05] font-normal tracking-tight text-balance sm:text-5xl lg:text-6xl">
								The most expensive decision
								<br />
								of your life,{' '}
								<span className="text-blue-cyan-muted">made right.</span>
							</h1>
							<p className="text-muted-foreground mb-10 max-w-xl text-lg leading-relaxed text-balance">
								PRE matches consumers with agents based on working style,
								communication expectations, transparency, and fit — not just
								availability.
							</p>
							<div className="flex flex-col gap-4 sm:flex-row">
								<Link
									to="/consumer/priorities"
									className="btn-primary inline-flex items-center gap-2"
								>
									Find Your Agent
									<ArrowRight className="h-4 w-4" />
								</Link>
								<Link
									to="/agent/priorities"
									className="btn-secondary !bg-background inline-flex items-center gap-2"
								>
									I'm an Agent
									<ArrowUpRight className="h-4 w-4" />
								</Link>
							</div>
						</div>

						{/* Right: Journey Cards */}
						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:gap-5">
							{/* Consumer Card */}
							<div className="bg-card card-institutional flex flex-col p-6 xl:p-8">
								<div className="data-label text-blue-cyan mb-4">
									Consumer Journey
								</div>
								<div className="mb-4 flex items-center gap-3">
									<div className="border-blue-cyan bg-blue-cyan-tint flex h-9 w-9 items-center justify-center border">
										<Heart className="text-blue-cyan h-4 w-4" />
									</div>
									<h3 className="font-serif text-xl font-normal">
										For Consumers
									</h3>
								</div>
								<p className="text-muted-foreground mb-6 text-sm leading-relaxed">
									Answer 16 questions across working style, communication,
									transparency, and fit. Get a ranked list of matched agents.
									Free.
								</p>
								<ul className="space-y-2">
									{[
										'Free compatibility assessment',
										'Ranked agent matches',
										'Optional $19.99 AI Deep Dive',
										'Peace Pact transparency',
									].map((item) => (
										<li key={item} className="flex items-center gap-2 text-sm">
											<CheckCircle2 className="text-blue-cyan h-4 w-4 shrink-0" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>

							{/* Agent Card */}
							<div className="bg-card card-institutional flex flex-col p-6 xl:p-8">
								<div className="data-label text-terracotta mb-4">
									Agent Journey
								</div>
								<div className="mb-4 flex items-center gap-3">
									<div className="border-terracotta bg-terracotta-tint flex h-9 w-9 items-center justify-center border">
										<Shield className="text-terracotta h-4 w-4" />
									</div>
									<h3 className="font-serif text-xl font-normal">For Agents</h3>
								</div>
								<p className="text-muted-foreground mb-6 text-sm leading-relaxed">
									Create your profile, complete 12 questions, and get introduced
									to consumers who actually fit how you work. No subscription
									during pilot.
								</p>
								<ul className="space-y-2">
									{[
										'No pilot subscription fee',
										'Pay only on accepted match ($199–$399)',
										'Bilateral fit scoring',
										'Peace Pact signature',
									].map((item) => (
										<li key={item} className="flex items-center gap-2 text-sm">
											<CheckCircle2 className="text-terracotta h-4 w-4 shrink-0" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Four Pillars — Table-like grid */}
			<section className="border-border border-b">
				<div className="mx-auto max-w-7xl px-6 py-20">
					<div className="mb-16 grid gap-8 lg:grid-cols-12">
						<div className="lg:col-span-4">
							<div className="data-label mb-3">01 — Framework</div>
							<h2 className="font-serif text-3xl font-normal tracking-tight md:text-4xl">
								Built on Transparency
							</h2>
						</div>
						<div className="lg:col-span-8">
							<p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
								Four pillars of a great working relationship. Each dimension is
								weighted and scored bilaterally.
							</p>
						</div>
					</div>

					<div className="bg-border grid gap-px sm:grid-cols-2 lg:grid-cols-4">
						{[
							{
								icon: Heart,
								title: 'Working Style',
								desc: 'How you prefer to work together, from hands-on to hands-off.',
								color: 'blue-cyan',
							},
							{
								icon: MessageCircle,
								title: 'Communication',
								desc: 'Frequency, channels, and style that work for both sides.',
								color: 'terracotta',
							},
							{
								icon: Eye,
								title: 'Transparency',
								desc: 'Clear expectations around fees, process, and timeline.',
								color: 'olive',
							},
							{
								icon: Star,
								title: 'Overall Fit',
								desc: 'The holistic chemistry that makes a partnership succeed.',
								color: 'ochre',
							},
						].map((pillar) => {
							const Icon = pillar.icon
							const colorClass = pillar.color as
								| 'blue-cyan'
								| 'terracotta'
								| 'olive'
								| 'ochre'
							return (
								<div key={pillar.title} className="bg-card p-8">
									<div
										className={`border-${colorClass} bg-${colorClass}-tint mb-6 flex h-10 w-10 items-center justify-center border`}
									>
										<Icon className={`text-${colorClass} h-5 w-5`} />
									</div>
									<h4 className="mb-3 font-serif text-lg">{pillar.title}</h4>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{pillar.desc}
									</p>
								</div>
							)
						})}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section>
				<div className="mx-auto max-w-7xl px-6 py-20">
					<div className="border-border bg-card card-institutional mx-auto max-w-3xl p-12 md:p-16">
						<div className="text-center">
							<div className="data-label mb-6">Get Started</div>
							<h2 className="mb-6 font-serif text-3xl font-normal tracking-tight md:text-4xl">
								Ready to find your match?
							</h2>
							<p className="text-muted-foreground mx-auto mb-10 max-w-lg leading-relaxed">
								Join the first platform that cares as much about fit as you do
								about finding the right property.
							</p>
							<Link
								to="/consumer/priorities"
								className="btn-primary inline-flex items-center gap-2"
							>
								Get Started Free
								<ArrowRight className="h-4 w-4" />
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
