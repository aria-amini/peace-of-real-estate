import { FormEvent, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Bot, MessageSquare, Send, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils/ui'

export const Route = createFileRoute(
	'/(app)/consumer/dashboard/practice-negotiating',
)({
	component: PracticeNegotiating,
})

type ChatMessage = {
	id: string
	role: 'user' | 'assistant'
	content: string
}

const starterPrompts = [
	'Ask for seller credits',
	'Handle a multiple-offer situation',
	'Request repairs after inspection',
]

function PracticeNegotiating() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: 'welcome',
			role: 'assistant',
			content: 'Hello',
		},
	])
	const [input, setInput] = useState('')

	const sendMessage = (content: string) => {
		const trimmed = content.trim()
		if (!trimmed) return

		setMessages((current) => [
			...current,
			{
				id: crypto.randomUUID(),
				role: 'user',
				content: trimmed,
			},
			{
				id: crypto.randomUUID(),
				role: 'assistant',
				content: 'Hello',
			},
		])
		setInput('')
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		sendMessage(input)
	}

	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-6 py-10 xl:mx-0 xl:ml-[calc((100vw-64rem)/2-var(--sidebar-width))]">
			<div className="mb-6 flex items-center gap-2 md:hidden">
				<SidebarTrigger />
				<span className="text-sm font-medium">Account menu</span>
			</div>

			<div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-3">
					<div className="flex size-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
						<MessageSquare className="size-5" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<p className="text-muted-foreground text-sm font-medium">
								Practice Negotiating
							</p>
							<span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-sky-700 uppercase dark:bg-sky-950 dark:text-sky-300">
								beta
							</span>
						</div>
						<h1 className="font-heading text-3xl font-semibold tracking-tight">
							Rehearse before the real conversation.
						</h1>
						<p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
							First iteration placeholder. The chat shell is wired, but the AI
							is intentionally hardcoded to respond with only “Hello”.
						</p>
					</div>
				</div>
			</div>

			<div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[0.7fr_1.3fr]">
				<Card className="h-fit">
					<CardHeader>
						<CardTitle>Practice Scenarios</CardTitle>
						<CardDescription>
							Use a starter or type your own negotiation situation.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{starterPrompts.map((prompt) => (
							<button
								key={prompt}
								type="button"
								onClick={() => sendMessage(prompt)}
								className="hover:border-primary/40 hover:bg-muted/30 w-full rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition"
							>
								{prompt}
							</button>
						))}
					</CardContent>
				</Card>

				<Card className="min-h-[520px]">
					<CardHeader>
						<CardTitle>Negotiation Coach</CardTitle>
						<CardDescription>
							Dummy chat mode. Every assistant response is “Hello”.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex min-h-[410px] flex-col gap-4">
						<div className="bg-muted/20 min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl border p-4">
							{messages.map((message) => (
								<div
									key={message.id}
									className={cn(
										'flex gap-2',
										message.role === 'user' && 'justify-end',
									)}
								>
									{message.role === 'assistant' ? (
										<span className="bg-background flex size-8 shrink-0 items-center justify-center rounded-full border">
											<Bot className="size-4" />
										</span>
									) : null}
									<div
										className={cn(
											'max-w-[78%] rounded-2xl px-3 py-2 text-sm',
											message.role === 'user'
												? 'bg-primary text-primary-foreground'
												: 'bg-background border',
										)}
									>
										{message.content}
									</div>
									{message.role === 'user' ? (
										<span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
											<UserRound className="size-4" />
										</span>
									) : null}
								</div>
							))}
						</div>

						<form onSubmit={handleSubmit} className="flex gap-2">
							<Input
								value={input}
								onChange={(event) => setInput(event.target.value)}
								placeholder="Try: How do I ask for closing cost help?"
								className="h-11"
							/>
							<Button type="submit" className="h-11">
								<Send className="size-4" />
								Send
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
