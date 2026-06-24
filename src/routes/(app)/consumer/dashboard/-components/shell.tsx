import { DashboardShell, DashboardSidebar } from '@/components/dashboard'
import type { ReactNode } from 'react'

export function ConsumerSidebarShell({ children }: { children: ReactNode }) {
	return (
		<DashboardShell
			sidebar={<DashboardSidebar items={[]} profileLabel="Your account" />}
		>
			{children}
		</DashboardShell>
	)
}
