import { redirectAuthenticatedUsers } from '@/lib/auth-guards'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
	ArrowRight,
	CheckCircle2,
	ClipboardList,
	MessageSquare,
	Search,
} from 'lucide-react'

import { GetMatchedDialog } from '@/components/get-matched-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/_app/')({
	beforeLoad: redirectAuthenticatedUsers,
	component: LandingPage,
})

function LandingPage() {
	return (
		<>
			<HeroSection />
			<HowItWorksSection />
			<FeaturesSection />
		</>
	)
}

function HeroSection() {
	return (
		<section className="bg-background relative w-full overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 md:flex-row md:gap-8">
				{/* Left: Text content */}
				<div className="flex max-w-xl flex-col items-start gap-6 md:gap-8">
					<h1 className="font-heading text-4xl leading-[1.1] font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
						Perfect Agent,
						<br />
						<span className="text-sky">Perfect Home.</span>
					</h1>

					<p className="text-muted-foreground max-w-md text-lg leading-relaxed">
						The most expensive decision of your life starts with one choice —
						the right agent. PRE is the first platform built to make sure that
						choice is actually right — matched on working style, communication
						expectations, and fit. Built for the consumer and the transparent,
						authentic agent simultaneously.
					</p>

					<div className="flex flex-wrap gap-4">
						<GetMatchedDialog>
							<Button
								size="lg"
								className="h-12 cursor-pointer rounded-xl px-8 text-base font-semibold"
							>
								I'm looking to buy
							</Button>
						</GetMatchedDialog>
						<Button
							variant="outline"
							size="lg"
							className="h-12 cursor-pointer rounded-xl px-8 text-base font-semibold"
							asChild
						>
							<Link to="/agent">I'm an agent</Link>
						</Button>
					</div>

					{/* Social proof */}
					<div className="flex items-center gap-4">
						<div className="flex -space-x-2">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="bg-secondary border-background flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium"
								>
									{i === 1 ? 'J' : i === 2 ? 'M' : 'S'}
								</div>
							))}
						</div>
						<p className="text-muted-foreground text-sm">
							Join{' '}
							<span className="text-foreground font-semibold">
								8,000+ buyers
							</span>{' '}
							who found their match
						</p>
					</div>
				</div>

				{/* Right: Illustration placeholder */}
				<div className="relative flex w-full max-w-lg items-center justify-center md:w-1/2">
					<div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-pink-300">
						<span className="text-sm font-medium text-pink-800">
							Hero Illustration
						</span>
					</div>
				</div>
			</div>
		</section>
	)
}

const howItWorksSteps = [
	{
		id: 1,
		title: 'Tell us what you need',
		description:
			'Share a few details about your goals, preferences, and location.',
		icon: ClipboardList,
	},
	{
		id: 2,
		title: 'We find your match',
		description:
			'Our smart matching algorithm connects you with the best-fit agents.',
		icon: Search,
	},
	{
		id: 3,
		title: 'Connect & move forward',
		description:
			'Chat, interview, and choose the agent you feel most comfortable with.',
		icon: MessageSquare,
	},
]

function HowItWorksSection() {
	return (
		<section className="bg-secondary/30 w-full py-16 md:py-24">
			<div className="mx-auto max-w-6xl px-6">
				<div className="mb-12 text-center md:mb-16">
					<h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
						How it works
					</h2>
				</div>

				<div className="relative grid gap-8 md:grid-cols-3 md:gap-12">
					{/* Dashed arrows between steps - desktop only */}
					<div className="pointer-events-none absolute top-16 left-1/3 hidden w-1/6 -translate-x-1/2 md:block">
						<svg viewBox="0 0 120 24" fill="none" className="w-full">
							<path
								d="M0 12 Q60 0, 120 12"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeDasharray="6 4"
								className="text-border"
							/>
						</svg>
					</div>
					<div className="pointer-events-none absolute top-16 right-1/3 hidden w-1/6 translate-x-1/2 md:block">
						<svg viewBox="0 0 120 24" fill="none" className="w-full">
							<path
								d="M0 12 Q60 0, 120 12"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeDasharray="6 4"
								className="text-border"
							/>
						</svg>
					</div>

					{howItWorksSteps.map((step) => {
						const Icon = step.icon
						return (
							<div
								key={step.id}
								className="relative flex flex-col items-center text-center"
							>
								{/* Icon with number badge */}
								<div className="relative mb-6">
									<div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full">
										<Icon className="text-primary h-8 w-8" />
									</div>
									<div className="bg-primary text-primary-foreground absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold">
										{step.id}
									</div>
								</div>

								<h3 className="font-heading mb-2 text-lg font-semibold">
									{step.title}
								</h3>
								<p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
									{step.description}
								</p>
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}

const featureItems = [
	'Personalized matches based on your unique needs',
	'Access to top-performing agents in your area',
	'No pressure. No obligation.',
	'100% free for buyers',
]

function FeaturesSection() {
	return (
		<section className="bg-background w-full py-16 md:py-24">
			<div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 md:flex-row md:gap-16">
				{/* Left: Agent card placeholder */}
				<div className="w-full max-w-md md:w-1/2">
					<Card className="bg-card ring-foreground/5 overflow-hidden rounded-2xl border-0 shadow-lg ring-1">
						<CardContent className="p-6">
							<div className="mb-4 flex items-center justify-between">
								<h4 className="font-heading text-sm font-semibold">
									Top match for you
								</h4>
								<div className="bg-sky text-sky-foreground flex h-6 w-6 items-center justify-center rounded-full">
									<svg
										className="h-3.5 w-3.5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
									</svg>
								</div>
							</div>

							<div className="mb-4 overflow-hidden rounded-xl">
								<img
									src="/match.png"
									alt="Agent match preview"
									className="h-auto w-full object-contain"
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right: Feature list */}
				<div className="flex w-full flex-col gap-6 md:w-1/2">
					<p className="text-sky text-xs font-semibold tracking-wider uppercase">
						Built for buyers
					</p>
					<h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
						More than agents.
						<br />
						Real partners.
					</h2>

					<ul className="flex flex-col gap-4">
						{featureItems.map((item) => (
							<li key={item} className="flex items-start gap-3">
								<div className="bg-primary/10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
									<CheckCircle2 className="text-primary h-3.5 w-3.5" />
								</div>
								<span className="text-sm leading-relaxed">{item}</span>
							</li>
						))}
					</ul>

					<Link
						to="/"
						className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
					>
						Learn more for buyers
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>
		</section>
	)
}
