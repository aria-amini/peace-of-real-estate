import { redirectUnauthenticatedUsers, isUserPremium } from '@/lib/auth-guards'
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/account')({
	beforeLoad: async () => {
		const { session } = await redirectUnauthenticatedUsers()
		const premium = await isUserPremium()
		if (!premium) {
			throw redirect({ to: '/upgrade' })
		}
		return { session }
	},
	component: AccountLayout,
})

function AccountLayout() {
	return <Outlet />
}
