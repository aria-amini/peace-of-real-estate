import { createFileRoute } from '@tanstack/react-router'

import { MatchCardModern, mockMatch1 } from '@/components/match-card-variants'

export const Route = createFileRoute('/demo')({
	component: DemoPage,
})

function DemoPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
			<div className="w-full max-w-md">
				<MatchCardModern match={mockMatch1} />
			</div>
		</div>
	)
}
