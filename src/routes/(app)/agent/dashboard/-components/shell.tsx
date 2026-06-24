import { DashboardShell, DashboardSidebar } from '@/components/dashboard'
import type { ReactNode } from 'react'

export function AgentSidebarShell({ children }: { children: ReactNode }) {
	return (
		<DashboardShell
			sidebar={<DashboardSidebar items={[]} profileLabel="Agent dashboard" />}
		>
			{children}
		</DashboardShell>
	)
}
