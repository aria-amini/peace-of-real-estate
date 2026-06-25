import { createFileRoute } from '@tanstack/react-router'

import { WipMessage } from '@/components/wip-message'

export const Route = createFileRoute(
	'/(app)/consumer/dashboard/search-preferences',
)({
	component: SearchPreferences,
})

function SearchPreferences() {
	return <WipMessage title="Search Preferences" />
}
