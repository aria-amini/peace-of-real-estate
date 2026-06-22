import { ConsumerSidebar } from './sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import type { ReactNode } from 'react'

export function ConsumerSidebarShell({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<ConsumerSidebar />
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
