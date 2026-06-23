import { DashboardShell } from '@/components/dashboard/shell'
import type { ReactNode } from 'react'

export function AgentSidebarShell({ children }: { children: ReactNode }) {
	return <DashboardShell variant="agent">{children}</DashboardShell>
}
