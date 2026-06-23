import type { ReactNode } from 'react'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from './sidebar'

export type DashboardRole = 'agent' | 'consumer'

type DashboardShellProps = {
	variant: DashboardRole
	children: ReactNode
}

export function DashboardShell({ variant, children }: DashboardShellProps) {
	return (
		<SidebarProvider>
			<DashboardSidebar variant={variant} />
			<SidebarInset className="overflow-x-hidden">
				<div className="flex min-h-dvh flex-col">
					<main className="flex w-full flex-1 flex-col overflow-x-hidden">
						{children}
					</main>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
