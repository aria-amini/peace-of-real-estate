import { DashboardShell } from '@/components/dashboard/shell'
import type { ReactNode } from 'react'

export function ConsumerSidebarShell({ children }: { children: ReactNode }) {
	return <DashboardShell variant="consumer">{children}</DashboardShell>
}
