import { Eye, Heart, MessageCircle, Star } from 'lucide-react'

import type { CategoryWeights } from '@/lib/user-settings'

export const categoryWeightOptions = [
	{
		id: 'working-style',
		label: 'Working Style',
		icon: Heart,
		color: 'navy',
		description: 'How hands-on or independent you prefer your agent to be',
	},
	{
		id: 'communication',
		label: 'Communication',
		icon: MessageCircle,
		color: 'amber',
		description: 'Frequency, channels, and style of updates',
	},
	{
		id: 'transparency',
		label: 'Transparency',
		icon: Eye,
		color: 'success',
		description: 'Clarity on fees, process, and expectations',
	},
	{
		id: 'fit',
		label: 'Overall Fit',
		icon: Star,
		color: 'warning',
		description: 'The intangible chemistry that makes it click',
	},
] satisfies ReadonlyArray<{
	id: keyof CategoryWeights
	label: string
	icon: typeof Heart
	color: string
	description: string
}>
