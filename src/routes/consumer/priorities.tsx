import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import {
	ConsumerPriorities,
	consumerConfig,
} from '@/components/consumer-flow-pages'

export const Route = createFileRoute('/consumer/priorities')({
	component: PrioritiesRoute,
})

function PrioritiesRoute() {
	const [state, setState] = useState({
		answers: {},
		matchPriorities: [] as string[],
	})

	return (
		<ConsumerPriorities
			config={consumerConfig}
			state={state}
			onUpdate={(patch) => setState((current) => ({ ...current, ...patch }))}
		/>
	)
}
