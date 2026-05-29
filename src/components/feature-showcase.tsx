import { CheckCircle2, ClipboardList, MessageSquare, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MatchCardModern } from '@/components/match-card-variants'
import { mockMatch1 } from '@/components/match-card-variants'

const steps = [
	{
		id: 1,
		title: 'Take a 3-minute quiz',
		description:
			'Answer a few simple questions about your preferences, communication style, and what matters most to you in an agent. No endless forms — just the details that actually matter for fit.',
		icon: ClipboardList,
		imagePosition: 'right' as const,
	},
	{
		id: 2,
		title: 'Look through your matches',
		description:
			'See agents ranked by fit, not by who paid the most for your contact info. Each match card shows their working style, specialties, and how they align with what you care about.',
		icon: Users,
		imagePosition: 'left' as const,
	},
	{
		id: 3,
		title: 'Introduce yourself',
		description:
			'When you are ready, unlock your matches and reach out. No cold calls, no lead auctions — just a warm introduction to an agent who actually fits how you want to work.',
		icon: MessageSquare,
		imagePosition: 'right' as const,
	},
]

export function FeatureShowcase() {
	return (
		<section className="relative w-full overflow-hidden py-16 md:py-24">
			<div className="mx-auto max-w-6xl px-6">
				<div className="mb-16 text-center">
					<h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
						How it works
					</h2>
					<p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
						Three simple steps to find an agent who fits your style.
					</p>
				</div>

				<div className="relative">
					{/* Vertical timeline line - desktop only */}
					<div className="bg-border absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 md:block" />

					<div className="space-y-16 md:space-y-24">
						{steps.map((step) => (
							<FeatureStep key={step.id} step={step} />
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

function FeatureStep({ step }: { step: (typeof steps)[number] }) {
	const Icon = step.icon
	const isReversed = step.imagePosition === 'left'

	return (
		<div
			className={cn(
				'relative grid items-center gap-8 md:grid-cols-2 md:gap-16',
				isReversed && 'md:direction-rtl',
			)}
		>
			{/* Timeline dot - desktop only */}
			<div className="border-primary bg-background absolute top-1/2 left-1/2 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 md:flex">
				<span className="text-primary text-sm font-semibold">{step.id}</span>
			</div>

			{/* Text content */}
			<div
				className={cn(
					'flex flex-col gap-4',
					isReversed ? 'md:order-2 md:pl-12' : 'md:order-1 md:pr-12',
				)}
			>
				<div className="flex items-center gap-3">
					<div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl md:hidden">
						<Icon className="text-primary h-5 w-5" />
					</div>
					<div className="bg-primary/10 hidden h-10 w-10 items-center justify-center rounded-xl md:flex">
						<Icon className="text-primary h-5 w-5" />
					</div>
					<div className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
						Step {step.id}
					</div>
				</div>
				<h3 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
					{step.title}
				</h3>
				<p className="text-muted-foreground max-w-md text-base leading-relaxed">
					{step.description}
				</p>
			</div>

			{/* Image / mockup */}
			<div
				className={cn(
					isReversed ? 'md:order-1 md:pr-12' : 'md:order-2 md:pl-12',
				)}
			>
				<StepMockup stepId={step.id} />
			</div>
		</div>
	)
}

function StepMockup({ stepId }: { stepId: number }) {
	if (stepId === 1) {
		return <QuizMockup />
	}
	if (stepId === 2) {
		return <MatchesMockup />
	}
	return <IntroMockup />
}

function QuizMockup() {
	const selected = 1

	return (
		<div className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-lg">
			<div className="space-y-4 p-5">
				{/* Progress bar */}
				<div className="space-y-2">
					<div className="text-muted-foreground flex items-center justify-between text-[10px]">
						<span>Question 2 of 8</span>
						<span>25%</span>
					</div>
					<div className="bg-border h-1.5 overflow-hidden rounded-full">
						<div
							className="bg-primary h-full rounded-full"
							style={{ width: '25%' }}
						/>
					</div>
				</div>

				{/* Question */}
				<h4 className="text-sm font-medium">
					How do you prefer to communicate with your agent?
				</h4>

				{/* Options */}
				<div className="space-y-2">
					{[
						'Text or email — quick and efficient',
						'Phone calls — I like real-time conversation',
						'Mixed — depends on the situation',
					].map((option, i) => (
						<button
							key={option}
							type="button"
							disabled
							className={cn(
								'flex w-full items-center gap-3 rounded-lg border p-3 text-left text-xs disabled:pointer-events-none',
								selected === i
									? 'border-primary bg-primary/5'
									: 'border-border',
							)}
						>
							<div
								className={cn(
									'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors',
									selected === i
										? 'border-primary bg-primary text-primary-foreground'
										: 'border-muted-foreground/30',
								)}
							>
								{selected === i && <CheckCircle2 className="h-3 w-3" />}
							</div>
							<span>{option}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

function MatchesMockup() {
	return (
		<div className="pointer-events-none scale-[0.85] select-none">
			<MatchCardModern match={mockMatch1} disabled />
		</div>
	)
}

function IntroMockup() {
	return (
		<div className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-lg">
			<div className="space-y-4 p-5">
				<div className="flex items-center gap-3">
					<div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
						SC
					</div>
					<div>
						<div className="text-sm font-medium">Sarah Chen</div>
						<div className="text-muted-foreground text-xs">
							Horizon Realty Group
						</div>
					</div>
					<div className="ml-auto">
						<span className="bg-accent/15 text-accent-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium">
							94% Match
						</span>
					</div>
				</div>

				<div className="bg-muted/50 space-y-3 rounded-xl p-4">
					<div className="flex gap-3">
						<div className="bg-primary mt-1 h-2 w-2 shrink-0 rounded-full" />
						<p className="text-muted-foreground text-xs leading-relaxed">
							Hi Sarah! I am looking for an agent who communicates clearly and
							does not rush me through decisions. I saw we are a 94% fit — would
							love to chat about working together.
						</p>
					</div>
				</div>

				<div className="flex gap-2">
					<button
						type="button"
						disabled
						className="bg-primary text-primary-foreground flex-1 rounded-lg py-2 text-xs font-medium disabled:pointer-events-none disabled:opacity-50"
					>
						Send Introduction
					</button>
					<button
						type="button"
						disabled
						className="border-border flex-1 rounded-lg border py-2 text-xs font-medium disabled:pointer-events-none disabled:opacity-50"
					>
						View Full Profile
					</button>
				</div>
			</div>
		</div>
	)
}
