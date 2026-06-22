import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { ConsumerPriorities, consumerConfig } from './-components/flow-pages'
import type { ConsumerDraft } from '@/lib/drafts'

export const Route = createFileRoute('/consumer/priorities')({
	component: PrioritiesRoute,
})

function PrioritiesRoute() {
	const [state, setState] = useState<ConsumerDraft>({
		answers: {},
		matchPriorities: [],
	})

	return (
		<ConsumerPriorities
			config={consumerConfig}
			state={state}
			onUpdate={(patch) => setState((current) => ({ ...current, ...patch }))}
		/>
	)
}
