import { redirectAuthenticatedUsers } from '@/lib/auth-guards'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

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
			<div className="min-h-main-content flex flex-col">
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
		<section className="bg-card relative flex w-full flex-1 flex-col items-center justify-start gap-8 overflow-hidden pt-10 pb-8 text-center md:pt-14 md:pb-12">
			{/* Portrait background */}
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat"
				style={{
					backgroundImage:
						'url(https://images.unsplash.com/photo-1685636916180-fc0ee6ad581b?auto=format&fit=crop&w=1600&q=80)',
				}}
			/>
			{/* Subtle overlay: light at top for dark text, stronger at bottom for depth */}
			<div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/60" />

			<div className="relative z-10 flex max-w-3xl flex-col items-center gap-5 px-6">
				<div className="flex flex-col items-center gap-6 rounded-3xl border border-white/30 bg-white/70 p-10 shadow-xl backdrop-blur-md md:p-12">
					<TypographyH1 className="text-foreground text-4xl tracking-tight md:text-5xl lg:text-6xl">
						Find your perfect agent
					</TypographyH1>
					<TypographyP className="text-foreground/70 max-w-xl text-lg leading-relaxed">
						Take a simple quiz to find your perfect agent. Free services make
						money by letting agents bid for your attention. We guarantee an
						equal playing field, for the most expensive decision of your life.
					</TypographyP>
					<GetMatchedDialog>
						<Button
							size="lg"
							className="mt-2 h-14 cursor-pointer rounded-full bg-linear-to-r from-slate-800 to-slate-900 px-10 text-lg font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:from-slate-700 hover:to-slate-800 hover:shadow-xl hover:shadow-slate-900/30"
						>
							Get Matched
							<ArrowRight className="h-5 w-5" />
						</Button>
					</GetMatchedDialog>
				</div>
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
		<section className="flex flex-col items-center gap-3 overflow-hidden border-y-2 bg-white px-6 py-6 backdrop-blur-sm">
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
							className="flex h-12 min-w-36 items-center justify-center opacity-50 transition-opacity hover:opacity-100"
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
		<Table className="border-border round border text-[11px] sm:text-sm md:text-base">
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
