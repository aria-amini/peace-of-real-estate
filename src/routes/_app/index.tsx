import { redirectAuthenticatedUsers } from '@/lib/auth-guards'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, DollarSign, LockKeyhole, Scale } from 'lucide-react'
import { type ReactNode } from 'react'

import { GetMatchedDialog } from '@/components/get-matched-dialog'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
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
			<ComparisonSection />
		</>
	)
}

function HeroSection() {
	return (
		<section className="min-h-main-content relative flex flex-col items-center gap-5 p-6 md:flex-row md:items-center">
			<div>
				<TypographyH1 className="text-foreground max-w-2xl lg:text-6xl">
					Find your perfect agent
				</TypographyH1>
				<TypographyP className="text-muted-foreground max-w-3xl text-lg">
					Take a simple quiz to find your perfect agent. Free services (Zillow,
					Realtor.com, Homes.com) make money by letting agents bid for your
					attention. We guarantee an equal playing field, for the most expensive
					decision of your life.
				</TypographyP>
			</div>

			<Card className="border-primary/20 mx-12 mt-8 w-full max-w-sm border px-4 py-10 shadow-2xl">
				<CardHeader>
					<CardTitle className="text-2xl">Try it for free</CardTitle>
					<CardDescription>
						<div className="text-muted-foreground mt-3 space-y-2 text-sm leading-5">
							<CtaTrustItem icon={<DollarSign className="h-4 w-4" />}>
								See your fit profile before paying
							</CtaTrustItem>
							<CtaTrustItem icon={<Scale className="h-4 w-4" />}>
								No paid ranking
							</CtaTrustItem>
							<CtaTrustItem icon={<LockKeyhole className="h-4 w-4" />}>
								No lead resale
							</CtaTrustItem>
						</div>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<GetMatchedDialog>
						<Button
							size="lg"
							className="shadow-primary/20 h-12 w-full rounded-lg text-base font-semibold shadow-lg"
						>
							Get Matched
							<ArrowRight className="h-4 w-4" />
						</Button>
					</GetMatchedDialog>
				</CardContent>
			</Card>
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

function CtaTrustItem({
	icon,
	children,
}: {
	icon: ReactNode
	children: ReactNode
}) {
	return (
		<div className="flex items-start gap-2">
			<span className="mt-0.5 shrink-0">{icon}</span>
			<span>{children}</span>
		</div>
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
