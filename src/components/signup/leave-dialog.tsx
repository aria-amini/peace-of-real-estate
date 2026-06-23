import { TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

type LeaveDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
}

export function LeaveDialog({
	open,
	onOpenChange,
	onConfirm,
}: LeaveDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TriangleAlert className="text-destructive h-5 w-5" />
						Leave this page?
					</DialogTitle>
					<DialogDescription>
						Your answers are saved in this browser, but you will leave the quiz.
						You can come back and continue any time.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Keep going
					</Button>
					<Button variant="destructive" onClick={onConfirm}>
						Leave
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
