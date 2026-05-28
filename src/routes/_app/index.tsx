import { redirectAuthenticatedUsers } from '@/lib/auth-guards'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { MatchCardModern } from '@/components/match-card-variants'
import type { MatchDetails } from '@/components/match-card-variants'
import { mockMatch2 } from '@/components/match-card-variants'
import { GetMatchedDialog } from '@/components/get-matched-dialog'
import { FeatureShowcase } from '@/components/feature-showcase'
import { Button } from '@/components/ui/button'
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
			<div className="flex min-h-[calc(100dvh-var(--app-header-height))] flex-col">
				<HeroSection />
				<MarqueeBanner />
			</div>
			<FeatureShowcase />
			<ComparisonSection />
		</>
	)
}

function HeroSection() {
	return (
		<section className="from-background via-background to-muted/30 relative flex w-full flex-1 flex-col items-center justify-start gap-8 overflow-hidden bg-gradient-to-b pt-10 pb-8 text-center md:pt-14 md:pb-12">
			<div className="relative z-10 flex max-w-3xl flex-col items-center gap-5 px-6">
				<TypographyH1 className="text-4xl md:text-5xl lg:text-6xl">
					Find your perfect agent
				</TypographyH1>
				<TypographyP className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
					Take a simple quiz to find your perfect agent. Free services make
					money by letting agents bid for your attention. We guarantee an equal
					playing field, for the most expensive decision of your life.
				</TypographyP>
				<GetMatchedDialog>
					<Button
						size="lg"
						className="mt-2 h-14 cursor-pointer rounded-full bg-[#FFB86A] px-10 text-lg font-semibold text-neutral-900 shadow-lg shadow-[#FFB86A]/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FFB86A]/30"
					>
						Get Matched
						<ArrowRight className="h-5 w-5" />
					</Button>
				</GetMatchedDialog>
			</div>

			<div className="relative z-10 mt-4 w-full max-w-lg px-6 md:mt-6">
				<FloatingMatchPreview />
			</div>
		</section>
	)
}

function FloatingMatchPreview() {
	return (
		<div className="relative mx-auto w-full max-w-md">
			{/* Back card for depth */}
			<div className="absolute top-4 left-1/2 w-[92%] -translate-x-1/2 scale-[0.92] opacity-40 blur-[1px]">
				<MatchCardModern match={mockMatch2} />
			</div>
			{/* Main card */}
			<div className="relative shadow-2xl">
				<MatchCardModern match={demoMatch} />
			</div>
		</div>
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

const demoMatch: MatchDetails = {
	id: 'demo-1',
	name: 'Sarah Chen',
	role: 'agent',
	agency: 'Horizon Realty Group',
	location: 'Baltimore, MD',
	zipCodes: ['21201', '21202'],
	fitScore: 94,
	status: 'new',
	date: '2026-05-28',
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
	stats: {
		transactions: 142,
		avgDays: 18,
		satisfaction: 4.9,
	},
	isTopMatch: true,
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
		<section className="border-border flex flex-col items-center gap-3 overflow-hidden border-y px-6 py-6">
			<p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
				Trusted by Baltimore's Top Realtors
			</p>
			<div
				className="relative w-full max-w-6xl overflow-hidden py-2"
				style={{
					maskImage:
						'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
					WebkitMaskImage:
						'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
				}}
			>
				<div className="animate-marquee flex w-max items-center gap-14">
					{[...companies, ...companies].map((company, i) => (
						<span
							key={i}
							className="flex h-12 min-w-36 items-center justify-center opacity-60 transition-opacity hover:opacity-100"
						>
							<img
								src={company.logo}
								alt={company.name}
								className="max-h-8 max-w-32 object-contain"
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
		<Table className="border-border rounded-xl border text-[11px] sm:text-sm md:text-base">
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
						<TableCell className="p-2 font-medium md:p-4">{label}</TableCell>
						<TableCell className="p-2 md:p-4">{pre}</TableCell>
						<TableCell className="p-2 md:p-4">{marketplace}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
