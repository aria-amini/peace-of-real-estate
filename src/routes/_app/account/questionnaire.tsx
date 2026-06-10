import { createFileRoute } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ListChecks } from 'lucide-react'
import { buyerQuestionFlow, agentQuestionFlow } from '@/lib/questions'
import { useAccountSettings } from '@/hooks/use-account-settings'
import { CollapsibleQuestionnaire } from '@/components/account/collapsible-questionnaire'

export const Route = createFileRoute('/_app/account/questionnaire')({
	component: AccountQuestionnaire,
})

function AccountQuestionnaire() {
	const { settings, loading, handleAnswersUpdate } = useAccountSettings()

	if (loading) {
		return <div className="flex-1" />
	}

	const role = settings?.role ?? 'consumer'
	const answers = settings?.answers ?? {}
	const questions =
		role === 'consumer'
			? buyerQuestionFlow.questions
			: agentQuestionFlow.questions

	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-12 xl:mx-0 xl:ml-[calc((100vw-48rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Account menu</span>
			</div>
			<div className="space-y-6">
				<Card className="rounded-none border bg-transparent p-8 py-8 shadow-none ring-0">
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<ListChecks className="text-muted-foreground h-5 w-5" />
							<div>
								<div className="text-muted-foreground text-sm">
									Questionnaire
								</div>
								<p className="text-muted-foreground mt-1 text-sm">
									Review and update your responses
								</p>
							</div>
						</div>
					</div>

					<CollapsibleQuestionnaire
						questions={questions}
						answers={answers}
						onSave={handleAnswersUpdate}
					/>
				</Card>
			</div>
		</div>
	)
}
