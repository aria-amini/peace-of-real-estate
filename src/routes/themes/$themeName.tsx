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
import './links-minimal.css'

export const Route = createFileRoute('/themes/$themeName')({
	component: ThemeShowcase,
})

function ThemeShowcase() {
	const { themeName } = Route.useParams()
	const { data: session, isPending } = authClient.useSession()

	if (themeName !== 'links-minimal') {
		return (
			<div className="flex flex-1 items-center justify-center">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-light">Theme not found</h1>
					<p className="text-[#9E9386]">
						“{themeName}” has not been implemented yet.
					</p>
				</div>
			</div>
		)
	}

	if (isPending) {
		return <div className="flex-1" />
	}

	if (session) {
		return <Navigate to="/match-activity" />
	}

	return (
		<div className="links-minimal lm-grain flex flex-col">
			{/* Hero + Cards — Split layout on large screens */}
			<section className="border-b border-[#D8D0C8]">
				<div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-24">
					<div className="grid items-start gap-10 xl:grid-cols-2 xl:gap-16">
						{/* Left: Hero */}
						<div className="flex flex-col justify-center pt-2 xl:pt-8">
							<h1 className="mb-8 text-4xl leading-[1.05] font-normal tracking-tight text-balance sm:text-5xl lg:text-6xl">
								The most expensive decision
								<br />
								of your life,{' '}
								<span className="text-[#8BA89B]">made right.</span>
							</h1>
							<p className="mb-10 max-w-xl text-lg leading-relaxed text-balance text-[#9E9386]">
								PRE matches consumers with agents based on working style,
								communication expectations, transparency, and fit — not just
								availability.
							</p>
							<div className="flex flex-col gap-4 sm:flex-row">
								<Link
									to="/consumer/priorities"
									className="inline-flex items-center gap-2 rounded-sm bg-[#3D3832] px-6 py-3 text-sm font-semibold tracking-wide text-[#F5F2EE] uppercase transition-colors hover:bg-[#5A534A]"
								>
									Find Your Agent
									<ArrowRight className="h-4 w-4" />
								</Link>
								<Link
									to="/agent/priorities"
									className="inline-flex items-center gap-2 rounded-sm border border-[#C9C0B6] bg-[#EDE8E0] px-6 py-3 text-sm font-semibold tracking-wide text-[#3D3832] uppercase transition-colors hover:border-[#3D3832]"
								>
									I'm an Agent
									<ArrowUpRight className="h-4 w-4" />
								</Link>
							</div>
						</div>

						{/* Right: Journey Cards */}
						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:gap-5">
							{/* Consumer Card */}
							<div className="flex flex-col rounded-sm border border-[#D8D0C8] bg-[#F5F2EE] p-6 shadow-sm xl:p-8">
								<div className="mb-4 text-xs font-semibold tracking-[0.15em] text-[#8BA89B] uppercase">
									Consumer Journey
								</div>
								<div className="mb-4 flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center border border-[#8BA89B] bg-[#8BA89B]/10">
										<Heart className="h-4 w-4 text-[#8BA89B]" />
									</div>
									<h3 className="text-xl font-normal">For Consumers</h3>
								</div>
								<p className="mb-6 text-sm leading-relaxed text-[#9E9386]">
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
											<CheckCircle2 className="h-4 w-4 shrink-0 text-[#8BA89B]" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>

							{/* Agent Card */}
							<div className="flex flex-col rounded-sm border border-[#D8D0C8] bg-[#F5F2EE] p-6 shadow-sm xl:p-8">
								<div className="mb-4 text-xs font-semibold tracking-[0.15em] text-[#9E9386] uppercase">
									Agent Journey
								</div>
								<div className="mb-4 flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center border border-[#9E9386] bg-[#9E9386]/10">
										<Shield className="h-4 w-4 text-[#9E9386]" />
									</div>
									<h3 className="text-xl font-normal">For Agents</h3>
								</div>
								<p className="mb-6 text-sm leading-relaxed text-[#9E9386]">
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
											<CheckCircle2 className="h-4 w-4 shrink-0 text-[#9E9386]" />
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
			<section className="border-b border-[#D8D0C8]">
				<div className="mx-auto max-w-7xl px-6 py-20">
					<div className="mb-16 grid gap-8 lg:grid-cols-12">
						<div className="lg:col-span-4">
							<div className="mb-3 text-xs font-semibold tracking-[0.15em] text-[#9E9386] uppercase">
								01 — Framework
							</div>
							<h2 className="text-3xl font-normal tracking-tight md:text-4xl">
								Built on Transparency
							</h2>
						</div>
						<div className="lg:col-span-8">
							<p className="max-w-2xl text-lg leading-relaxed text-[#9E9386]">
								Four pillars of a great working relationship. Each dimension is
								weighted and scored bilaterally.
							</p>
						</div>
					</div>

					<div className="grid gap-px bg-[#D8D0C8] sm:grid-cols-2 lg:grid-cols-4">
						{[
							{
								icon: Heart,
								title: 'Working Style',
								desc: 'How you prefer to work together, from hands-on to hands-off.',
								color: '#8BA89B',
							},
							{
								icon: MessageCircle,
								title: 'Communication',
								desc: 'Frequency, channels, and style that work for both sides.',
								color: '#9E9386',
							},
							{
								icon: Eye,
								title: 'Transparency',
								desc: 'Clear expectations around fees, process, and timeline.',
								color: '#C9C0B6',
							},
							{
								icon: Star,
								title: 'Overall Fit',
								desc: 'The holistic chemistry that makes a partnership succeed.',
								color: '#3D3832',
							},
						].map((pillar) => {
							const Icon = pillar.icon
							return (
								<div key={pillar.title} className="bg-[#F5F2EE] p-8">
									<div
										className="mb-6 flex h-10 w-10 items-center justify-center border"
										style={{
											borderColor: pillar.color,
											backgroundColor: `${pillar.color}14`,
										}}
									>
										<Icon className="h-5 w-5" style={{ color: pillar.color }} />
									</div>
									<h4 className="mb-3 text-lg">{pillar.title}</h4>
									<p className="text-sm leading-relaxed text-[#9E9386]">
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
					<div className="mx-auto max-w-3xl rounded-sm border border-[#D8D0C8] bg-[#F5F2EE] p-12 shadow-sm md:p-16">
						<div className="text-center">
							<div className="mb-6 text-xs font-semibold tracking-[0.15em] text-[#9E9386] uppercase">
								Get Started
							</div>
							<h2 className="mb-6 text-3xl font-normal tracking-tight md:text-4xl">
								Ready to find your match?
							</h2>
							<p className="mx-auto mb-10 max-w-lg leading-relaxed text-[#9E9386]">
								Join the first platform that cares as much about fit as you do
								about finding the right property.
							</p>
							<Link
								to="/consumer/priorities"
								className="inline-flex items-center gap-2 rounded-sm bg-[#3D3832] px-6 py-3 text-sm font-semibold tracking-wide text-[#F5F2EE] uppercase transition-colors hover:bg-[#5A534A]"
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
