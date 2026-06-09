import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

export function Modal({
	children,
	onClose,
	title,
	subtitle,
	large = false,
}: {
	children: React.ReactNode
	onClose: () => void
	title: string
	subtitle?: string
	large?: boolean
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 backdrop-blur-sm">
			<Card
				className={`bg-card border-border relative w-full border shadow-2xl ${
					large ? 'max-w-3xl' : 'max-w-xl'
				}`}
			>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					onClick={onClose}
					className="text-muted-foreground hover:text-foreground absolute top-4 right-4"
					aria-label="Close"
				>
					<X className="h-5 w-5" />
				</Button>
				<div className="p-8">
					<div className="mb-6">
						<h2 className="text-xl">{title}</h2>
						{subtitle && (
							<p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
						)}
					</div>
					{children}
				</div>
			</Card>
		</div>
	)
}
