import { redirectUnauthenticatedUsers } from '@/lib/auth-guards'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/account')({
	beforeLoad: async () => {
		const { session } = await redirectUnauthenticatedUsers()
		return { session }
	},
	component: AccountLayout,
})

function AccountLayout() {
	return <Outlet />
}
