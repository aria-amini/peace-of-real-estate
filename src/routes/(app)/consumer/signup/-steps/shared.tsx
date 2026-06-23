import type { Icon } from '@phosphor-icons/react'
import {
	ArrowsLeftRightIcon,
	BarnIcon,
	BuildingApartmentIcon,
	BuildingIcon,
	ClockIcon,
	HouseLineIcon,
	MapPinIcon,
	QuestionIcon,
	TagIcon,
	UserIcon,
} from '@phosphor-icons/react'

import {
	consumerQuestionFlow,
	propertyTypeOptions,
	type QuestionFlow as MatchingQuestionFlow,
} from '@/lib/matching/questions'
import type { RepresentationSide } from '@/lib/matching/profile'

export type ConsumerFlowStep = 'intro' | 'intent' | 'home' | 'quiz' | 'preview'

export const consumerFlowSteps: {
	id: ConsumerFlowStep
	label: string
	icon: Icon
}[] = [
	{ id: 'intro', label: 'Situation', icon: ClockIcon },
	{ id: 'intent', label: 'Location', icon: MapPinIcon },
	{ id: 'home', label: 'Home', icon: HouseLineIcon },
	{ id: 'quiz', label: 'Preferences', icon: UserIcon },
]

export const stepOrder: ConsumerFlowStep[] = ['intro', 'intent', 'home', 'quiz']

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

export const timelineOptions = [
	{ slug: 'exploring', label: 'Just exploring' },
	{ slug: '1month', label: '1 month' },
	{ slug: '2months', label: '2 months' },
	{ slug: '3months', label: '3 months' },
	{ slug: '4months', label: '4 months' },
	{ slug: '5months', label: '5 months' },
	{ slug: '6months', label: '6 months' },
	{ slug: '7months', label: '7 months' },
	{ slug: '8months', label: '8 months' },
	{ slug: '9months', label: '9 months' },
	{ slug: '10months', label: '10 months' },
	{ slug: '11months', label: '11 months' },
	{ slug: '12monthsPlus', label: '12+ months' },
] as const

export const consumerConfig = {
	basePath: '/consumer',
	label: 'Consumer',
	intentOptions: ['buying', 'selling', 'both'],
	timelineOptions: [...timelineOptions],
	propertyPrompt: 'What type of home are you looking for?',
	propertyOptions: Object.keys(propertyTypeOptions),
	questionFlow: consumerQuestionFlow,
	accent: 'navy',
} satisfies {
	basePath: '/consumer'
	label: 'Consumer'
	intentOptions: RepresentationSide[]
	timelineOptions: { slug: string; label: string }[]
	propertyPrompt: string
	propertyOptions: string[]
	questionFlow: MatchingQuestionFlow
	accent: 'navy' | 'amber'
}

export function getPropertyIcon(slug: string): Icon {
	if (slug === 'singleFamily') return HouseLineIcon
	if (slug === 'condoTownhome') return BuildingIcon
	if (slug === 'land') return BarnIcon
	if (slug === 'multiFamily') return BuildingApartmentIcon
	return QuestionIcon
}

export function getIntentIcon(intent: RepresentationSide): Icon {
	if (intent === 'buying') return HouseLineIcon
	if (intent === 'selling') return TagIcon
	if (intent === 'both') return ArrowsLeftRightIcon
	return QuestionIcon
}

export function getIntentLabel(intent: RepresentationSide) {
	if (intent === 'buying') return 'Buy'
	if (intent === 'selling') return 'Sell'
	return 'Buy then Sell'
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
