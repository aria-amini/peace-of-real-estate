import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { AgentPriorities, agentConfig } from '@/components/agent-flow-pages'

export const Route = createFileRoute('/agent/priorities')({
	component: PrioritiesRoute,
})

function PrioritiesRoute() {
	const [state, setState] = useState({
		answers: {},
		matchPriorities: [] as string[],
	})

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12 xl:py-16">
			<AgentPriorities
				config={agentConfig}
				state={state}
				onUpdate={(patch) => setState((current) => ({ ...current, ...patch }))}
			/>
		</div>
	)
}
