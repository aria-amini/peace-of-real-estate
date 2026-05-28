import { redirectAuthenticatedUsers } from '@/lib/auth-guards'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { AgentMatchCard } from '@/components/agent-match-card'
import type { AgentMatch } from '@/components/agent-match-card'
import { GetMatchedDialog } from '@/components/get-matched-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	TypographyH1,
	TypographyH2,
	TypographyP,
} from '@/components/typography'

export const Route = createFileRoute('/_app/')({
	beforeLoad: redirectAuthenticatedUsers,
	component: LandingPage,
})

function LandingPage() {
	return (
		<>
			<HeroSection />
			<MarqueeBanner />
			<MatchPreviewSection />
			<ComparisonSection />
		</>
	)
}

function HeroSection() {
	return (
		<section className="relative flex flex-col items-center justify-center gap-6 overflow-hidden px-6 py-16 text-center md:py-24">
			<img
				src="https://images.unsplash.com/photo-1685636916180-fc0ee6ad581b?auto=format&fit=crop&w=1600&q=80"
				alt="A row of houses with a city in the background"
				className="absolute inset-0 h-full w-full object-cover"
			/>
			<div className="absolute inset-0 bg-black/60" />
			<div className="relative z-10 flex max-w-3xl flex-col items-center gap-5">
				<TypographyH1 className="text-4xl text-white drop-shadow-md md:text-5xl lg:text-6xl">
					Find your perfect agent
				</TypographyH1>
				<TypographyP className="max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow-sm">
					Take a simple quiz to find your perfect agent. Free services make
					money by letting agents bid for your attention. We guarantee an equal
					playing field, for the most expensive decision of your life.
				</TypographyP>
				<GetMatchedDialog>
					<Button
						size="lg"
						className="shadow-primary/20 mt-2 h-12 rounded-lg px-8 text-base font-semibold shadow-lg"
					>
						Get Matched
						<ArrowRight className="h-4 w-4" />
					</Button>
				</GetMatchedDialog>
			</div>
		</section>
	)
}

function ComparisonSection() {
	return (
		<section className="min-h-main-content flex flex-col gap-6 p-6">
			<div className="mx-auto max-w-2xl">
				<TypographyH2 className="text-center !text-4xl">
					Free is not neutral.
				</TypographyH2>
				<TypographyP className="text-muted-foreground text-lg">
					If you are not paying for the matching service, someone else is. That
					means agents pay for leads, referral access, or visibility. That
					creates a platform incentive to maximize lead volume and agent spend,
					not your fit.
				</TypographyP>
			</div>

			<ComparisonTable />
		</section>
	)
}

const demoMatch: AgentMatch = {
	id: 1,
	name: 'Sarah Chen',
	agency: 'Horizon Realty Group',
	location: 'Baltimore, MD',
	overall: 4.8,
	scores: {
		Communication: 4.9,
		Transparency: 4.7,
		'Local Knowledge': 4.8,
		Negotiation: 4.6,
	},
	experience: '12 years',
	specialties: ['First-time buyers', 'Waterfront', 'Investors'],
	about:
		'Sarah specializes in helping first-time buyers navigate the Baltimore market with calm, clear guidance. Known for transparent pricing and patient communication.',
	topMatch: true,
}

function MatchPreviewSection() {
	return (
		<section className="relative flex flex-col items-center gap-6 px-6 py-12">
			<div className="text-center">
				<TypographyH2 className="text-2xl md:text-3xl">
					See your matches in minutes
				</TypographyH2>
				<TypographyP className="text-muted-foreground mt-2 max-w-xl">
					Answer a few questions about your preferences and get matched with
					agents who fit your style.
				</TypographyP>
			</div>
			<div className="pointer-events-none relative w-full max-w-3xl opacity-90 select-none">
				<AgentMatchCard match={demoMatch} />
				<div className="from-background absolute inset-0 rounded-xl bg-gradient-to-t via-transparent to-transparent" />
			</div>
		</section>
	)
}

function MarqueeBanner() {
	const companies = [
		{
			name: 'Keller Williams',
			logo: '/brand-logos/keller-williams.svg',
		},
		{
			name: 'Coldwell Banker',
			logo: '/brand-logos/coldwell-banker.svg',
		},
		{
			name: 'RE/MAX',
			logo: '/brand-logos/remax.svg',
		},
		{
			name: 'Century 21',
			logo: '/brand-logos/century-21.svg',
		},
		{
			name: 'Berkshire Hathaway',
			logo: '/brand-logos/berkshire-hathaway.svg',
		},
		{
			name: 'Zillow',
			logo: '/brand-logos/zillow.svg',
		},
		{
			name: 'Opendoor',
			logo: '/brand-logos/opendoor.svg',
		},
	]

	return (
		<section className="bg-muted/50 flex flex-col items-center gap-6 overflow-hidden px-6 py-12">
			<p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
				Trusted by leading real estate brands
			</p>
			<div className="relative w-full max-w-6xl overflow-hidden py-2">
				<div className="animate-marquee flex w-max items-center gap-14">
					{[...companies, ...companies].map((company, i) => (
						<span
							key={i}
							className="flex h-12 min-w-36 items-center justify-center opacity-45 grayscale transition-opacity hover:opacity-70"
						>
							<img
								src={company.logo}
								alt={company.name}
								className="max-h-8 max-w-32 object-contain brightness-0"
							/>
						</span>
					))}
				</div>
			</div>
		</section>
	)
}

function ComparisonTable() {
	const rows = [
		['Who pays?', 'Consumer', 'Agent'],
		['What is optimized?', 'Fit and transparency', 'Lead volume'],
		['Agent incentives', 'Serve aligned clients', 'Win auctioned attention'],
		['Consumer experience', 'Calm guided match', 'Calls, texts, and follow-up'],
	]

	return (
		<Card className="border-primary/15 max-w-full rounded-xl border shadow-xl">
			<CardContent>
				<Table className="text-[11px] sm:text-sm md:text-base">
					<TableHeader>
						<TableRow className="bg-primary/10">
							<TableHead></TableHead>
							<TableHead>Peace of Real Estate</TableHead>
							<TableHead>Lead marketplaces</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map(([label, pre, marketplace]) => (
							<TableRow key={label}>
								<TableCell className="p-2 font-medium md:p-4">
									{label}
								</TableCell>
								<TableCell className="p-2 md:p-4">{pre}</TableCell>
								<TableCell className="p-2 md:p-4">{marketplace}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
