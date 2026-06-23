import type { Icon } from '@phosphor-icons/react'
import {
	BriefcaseIcon,
	ChartLineIcon,
	MapPinIcon,
	ScrollIcon,
	ShieldCheckIcon,
	UserIcon,
	UsersIcon,
} from '@phosphor-icons/react'

import {
	agentQuestionFlow,
	questionOptionSlugs,
	type QuestionFlow as MatchingQuestionFlow,
} from '@/lib/matching/questions'
import type { RepresentationSide } from '@/lib/matching/profile'

export type AgentFlowStep =
	| 'welcome'
	| 'identity'
	| 'market'
	| 'compliance'
	| 'peacePact'
	| 'preview'

export const agentFlowSteps: {
	id: AgentFlowStep
	label: string
	icon: Icon
}[] = [
	{ id: 'welcome', label: 'Start', icon: UserIcon },
	{ id: 'identity', label: 'Identity', icon: UserIcon },
	{ id: 'market', label: 'Market', icon: MapPinIcon },
	{ id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
	{ id: 'peacePact', label: 'Peace Pact', icon: ScrollIcon },
]

export const stepOrder: AgentFlowStep[] = [
	'welcome',
	'identity',
	'market',
	'compliance',
	'peacePact',
]

export const SKIPPED_ANSWER = '__skipped__'

export function parseCityState(
	location: string,
): { city: string; state: string } | undefined {
	const [cityName, rest] = location.split(',').map((part) => part.trim())
	if (!cityName || !rest) return undefined
	const state = rest.split(/\s+/)[0]
	if (!state || state.length !== 2) return undefined
	return { city: cityName, state: state.toUpperCase() }
}

export function isValidZipCode(zipCode: string) {
	return /^\d{5}$/.test(zipCode)
}

export const yearsLicensedOptions = [
	{ slug: '0-2', label: '0-2 years' },
	{ slug: '3-5', label: '3-5 years' },
	{ slug: '6-10', label: '6-10 years' },
	{ slug: '10+', label: '10+ years' },
] as const

export const averageTransactionsOptions = [
	{ slug: '0-5', label: '0-5 per year' },
	{ slug: '6-15', label: '6-15 per year' },
	{ slug: '16-30', label: '16-30 per year' },
	{ slug: '30+', label: '30+ per year' },
] as const

export const bestClientTypesQuestion = agentQuestionFlow.questions.find(
	(q) => q.id === 'bestClientTypes',
)!

export const agentConfig = {
	basePath: '/agent',
	label: 'Agent',
	intentOptions: ['buying', 'selling', 'both'] as RepresentationSide[],
	clientOptions: questionOptionSlugs(bestClientTypesQuestion),
	questionFlow: {
		...agentQuestionFlow,
		questions: agentQuestionFlow.questions.filter(
			(q) =>
				![
					'representationSide',
					'typicalPriceRange',
					'bestClientTypes',
				].includes(q.id),
		),
	},
	accent: 'amber',
} satisfies {
	basePath: '/agent'
	label: string
	intentOptions: RepresentationSide[]
	clientOptions: string[]
	questionFlow: MatchingQuestionFlow
	accent: 'amber'
}

export function getRepresentationIcon(side: RepresentationSide): Icon {
	if (side === 'buying') return UsersIcon
	if (side === 'selling') return ChartLineIcon
	return BriefcaseIcon
}

export function getRepresentationLabel(side: RepresentationSide) {
	if (side === 'buying') return 'Buyers'
	if (side === 'selling') return 'Sellers'
	return 'Both'
}

export function StepHeader({
	stepNumber,
	totalSteps,
	title,
	icon: Icon,
}: {
	stepNumber: number
	totalSteps: number
	title: string
	icon?: Icon
}) {
	return (
		<div className="space-y-1">
			<p className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
				Step {stepNumber} of {totalSteps}
			</p>
			<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
				{Icon ? <Icon className="h-4 w-4" weight="duotone" /> : null}
				{title}
			</p>
		</div>
	)
}
