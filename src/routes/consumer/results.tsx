import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Lock, Trophy } from 'lucide-react'

import { FlowPageShell } from '@/components/flow-page-shell'
import { AgentMatchCard, type AgentMatch } from '@/components/agent-match-card'

export const Route = createFileRoute('/consumer/results')({
	component: ConsumerResults,
})

const matches: AgentMatch[] = [
	{
		id: 1,
		name: 'Sarah Chen',
		agency: 'Horizon Realty Group',
		location: 'Austin, TX',
		overall: 4.8,
		scores: {
			'Working Style': 4.9,
			Communication: 4.7,
			Transparency: 4.8,
			Fit: 4.9,
		},
		experience: '12 years',
		specialties: ['First-time buyers', 'Luxury homes', 'Investment properties'],
		about:
			'Known for patient guidance and transparent communication. Specializes in helping buyers find homes that truly fit their lifestyle.',
		topMatch: true,
	},
	{
		id: 2,
		name: 'Marcus Johnson',
		agency: 'Urban Nest Properties',
		location: 'Austin, TX',
		overall: 4.5,
		scores: {
			'Working Style': 4.6,
			Communication: 4.4,
			Transparency: 4.5,
			Fit: 4.4,
		},
		experience: '8 years',
		specialties: ['Condos', 'Urban properties', 'Relocation'],
		about:
			'Efficient, data-driven agent who respects your time. Great for busy professionals who want results without endless back-and-forth.',
		topMatch: false,
	},
	{
		id: 3,
		name: 'Elena Rodriguez',
		agency: 'Green Leaf Real Estate',
		location: 'Austin, TX',
		overall: 4.3,
		scores: {
			'Working Style': 4.2,
			Communication: 4.5,
			Transparency: 4.4,
			Fit: 4.1,
		},
		experience: '15 years',
		specialties: [
			'Eco-friendly homes',
			'Family neighborhoods',
			'School districts',
		],
		about:
			'Passionate about sustainable living and family-friendly communities. Takes time to understand what truly matters to you.',
		topMatch: false,
	},
]

function ConsumerResults() {
	return (
		<FlowPageShell
			backTo="/consumer/quiz"
			backLabel="Back to questions"
			title="Your Matches"
			subtitle="Step 3 of 4 — Review your ranked agent matches"
			icon={Trophy}
			iconClassName="border-blue-cyan bg-blue-cyan-tint text-blue-cyan"
		>
			<h2 className="mx-auto max-w-xl text-center font-serif text-2xl font-normal tracking-tight md:text-3xl">
				Your top agents are ready
			</h2>
			<p className="text-muted-foreground mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed md:text-base">
				We scored your responses and prepared ranked matches. Sign up to see who
				fits your working style, communication needs, and transparency
				expectations.
			</p>
			<div className="mt-8 flex items-center justify-center">
				<Link
					to="/signup"
					search={{ redirect: '/match-activity' }}
					className="btn-primary inline-flex items-center justify-center gap-2"
				>
					Sign up
					<ArrowRight className="h-4 w-4" />
				</Link>
			</div>
			<div className="border-border mt-10 border-t pt-6">
				<div className="data-label mb-4 flex items-center justify-center gap-2 text-center">
					<Lock className="h-3.5 w-3.5" />
					Locked until signup
				</div>
				<div className="pointer-events-none max-h-[14rem] space-y-4 overflow-hidden blur-[6px]">
					{matches.slice(0, 2).map((match, i) => (
						<AgentMatchCard key={match.id} match={match} index={i} />
					))}
				</div>
			</div>
		</FlowPageShell>
	)
}
