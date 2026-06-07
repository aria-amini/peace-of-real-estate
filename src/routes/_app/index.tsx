import { redirectAuthenticatedUsers } from '@/lib/auth-guards'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { GetMatchedDialog } from '@/components/get-matched-dialog'
import { Button } from '@/components/ui/button'

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
		<section className="bg-card relative w-full overflow-hidden pt-12 pb-10 md:pt-20 md:pb-12">
			<div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-8 lg:px-10">
				<div className="flex max-w-xl flex-col items-start gap-6 md:gap-8">
					<h1 className="font-heading text-5xl leading-[0.98] font-semibold tracking-tight text-balance md:text-6xl lg:text-7xl">
						Perfect Agent,
						<br />
						<span className="text-sky">Perfect Home.</span>
					</h1>

					<p className="text-muted-foreground max-w-lg text-base leading-8 md:text-lg">
						The most expensive decision of your life starts with one choice —
						the right agent. PRE is the first platform built to make sure that
						choice is actually right — matched on working style, communication
						expectations, and fit. Built for the consumer and the transparent,
						authentic agent simultaneously.
					</p>

					<div className="flex flex-wrap gap-4 pt-1">
						<GetMatchedDialog>
							<Button
								size="lg"
								className="h-12 cursor-pointer rounded-xl px-8 text-base font-semibold shadow-md"
							>
								I'm a buyer/seller
							</Button>
						</GetMatchedDialog>
						<Button
							variant="outline"
							size="lg"
							className="bg-card h-12 cursor-pointer rounded-xl px-8 text-base font-semibold"
							asChild
						>
							<Link to="/agent">I'm an agent</Link>
						</Button>
					</div>
				</div>

				<div className="relative flex w-full items-end justify-center md:justify-end">
					<div className="bg-sky/10 absolute right-0 bottom-4 left-12 h-2/3 rounded-[3rem] blur-3xl" />
					<img
						src="/hero.png"
						alt="Buyer and real estate agent shaking hands outside a home"
						className="relative z-10 w-full max-w-2xl object-contain md:max-w-none"
					/>
				</div>
			</div>
		</section>
	)
}

const howItWorksSteps = [
	{
		id: 1,
		title: 'Tell us what matters',
		description:
			'Answer a quick questionnaire about your needs, style, and deal-breakers.',
		image: '/step1.png',
	},
	{
		id: 2,
		title: 'See your verified matches',
		description:
			'Get ranked agent matches with a detailed fit rationale — no guessing.',
		image: '/step2.png',
	},
	{
		id: 3,
		title: 'Request your intro',
		description: 'Choose your agent and we handle the warm introduction. Done.',
		image: '/step3.png',
	},
]

function HowItWorksSection() {
	return (
		<section
			id="how-it-works"
			className="bg-secondary/40 w-full py-16 md:py-20"
		>
			<div className="mx-auto max-w-6xl px-6 lg:px-10">
				<div className="mb-12 text-center md:mb-16">
					<h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
						How Peace of Real Estate works
					</h2>
				</div>

				<div className="relative grid gap-10 md:grid-cols-3 md:gap-12">
					<div className="pointer-events-none absolute top-14 left-1/3 hidden w-1/6 -translate-x-1/2 md:block">
						<svg viewBox="0 0 120 24" fill="none" className="w-full">
							<path
								d="M0 12 Q60 0, 120 12"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeDasharray="6 4"
								className="text-sky"
							/>
						</svg>
					</div>
					<div className="pointer-events-none absolute top-14 right-1/3 hidden w-1/6 translate-x-1/2 md:block">
						<svg viewBox="0 0 120 24" fill="none" className="w-full">
							<path
								d="M0 12 Q60 0, 120 12"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeDasharray="6 4"
								className="text-sky"
							/>
						</svg>
					</div>

					{howItWorksSteps.map((step) => (
						<div
							key={step.id}
							className="relative flex flex-col items-center text-center"
						>
							<img
								src={step.image}
								alt=""
								className="mb-5 h-28 w-28 object-contain md:h-32 md:w-32"
							/>

							<h3 className="font-heading mb-3 text-lg font-semibold">
								{step.title}
							</h3>
							<p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

const featureItems = [
	'Matched to agents based on your communication style, price range, goals, and needs',
	'Peace Pact agents who commit to transparency and putting your interests first',
	'Clear fit rationale before you commit, so you can choose with confidence',
	'Commission coaching, tips, and scripts to help you ask the right questions upfront',
	'Backup matches ready if your first pick is not available',
]

function FeaturesSection() {
	return (
		<section id="buyers" className="bg-card w-full py-16 md:py-20">
			<div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2 md:gap-16 lg:px-10">
				<div className="relative flex w-full justify-center md:justify-start">
					<div className="bg-sky/10 absolute inset-x-8 top-14 bottom-10 rounded-full blur-3xl" />
					<img
						src="/match.png"
						alt="Agent match preview on a phone"
						className="relative z-10 w-full max-w-lg rounded-[2rem] object-contain"
					/>
				</div>

				<div className="flex w-full flex-col gap-6">
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
