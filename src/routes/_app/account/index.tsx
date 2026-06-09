import { authClient } from '@/lib/auth-client'
import { Card } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { User, MapPin, Award, FileText } from 'lucide-react'
import { useAccountSettings } from '@/hooks/use-account-settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/account/')({
	component: AccountProfile,
})

function AccountProfile() {
	const { data: session } = authClient.useSession()
	const { settings, loading } = useAccountSettings()

	if (loading) {
		return <div className="flex-1" />
	}

	const role = settings?.role ?? 'consumer'
	const agentProfile = settings?.agentProfile ?? {
		experience: '',
		zipCodes: '',
		services: [],
	}
	const isConsumer = role === 'consumer'

	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-12 xl:mx-0 xl:ml-[calc((100vw-48rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Account menu</span>
			</div>
			<div className="space-y-6">
				<Card className="rounded-none border bg-transparent p-8 py-8 shadow-none ring-0">
					<div className="mb-6 flex items-center gap-4">
						<div className="border-border bg-secondary flex h-12 w-12 items-center justify-center border">
							<User className="h-6 w-6" />
						</div>
						<div>
							<div className="text-muted-foreground mb-1 text-sm">Account</div>
							<h1 className="text-2xl">
								{session?.user?.name ?? 'Your account'}
							</h1>
						</div>
					</div>
					<div className="grid gap-4 text-sm sm:grid-cols-2">
						<div>
							<p className="text-muted-foreground mb-1">Email</p>
							<p className="font-medium">{session?.user?.email}</p>
						</div>
						<div>
							<p className="text-muted-foreground mb-1">Role</p>
							<p className="font-medium capitalize">{role}</p>
						</div>
					</div>

					{!isConsumer && (
						<div className="border-border mt-6 border-t pt-6">
							<div className="grid gap-4 text-sm sm:grid-cols-2">
								<div>
									<p className="text-muted-foreground mb-1">
										<Award className="mr-1 inline h-3.5 w-3.5" />
										Experience
									</p>
									<p className="font-medium">
										{agentProfile.experience || 'Not set'}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1">
										<MapPin className="mr-1 inline h-3.5 w-3.5" />
										Zip Codes Served
									</p>
									<p className="font-medium">
										{agentProfile.zipCodes || 'Not set'}
									</p>
								</div>
							</div>
							<div className="mt-4">
								<p className="text-muted-foreground mb-2 text-sm">
									<FileText className="mr-1 inline h-3.5 w-3.5" />
									Services
								</p>
								<div className="flex flex-wrap gap-2">
									{agentProfile.services.length > 0 ? (
										agentProfile.services.map((s) => (
											<span key={s} className="border px-3 py-1 text-xs">
												{s}
											</span>
										))
									) : (
										<span className="text-muted-foreground text-xs">
											No services selected
										</span>
									)}
								</div>
							</div>
						</div>
					)}
				</Card>
			</div>
		</div>
	)
}
