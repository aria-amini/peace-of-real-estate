import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/consumer/')({
	component: ConsumerIndex,
})

function ConsumerIndex() {
	return <Navigate to="/consumer/priorities" />
}
