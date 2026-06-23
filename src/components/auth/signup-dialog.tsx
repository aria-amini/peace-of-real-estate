import { AuthCard } from '@/components/auth/card'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

export function SignupDialog({
	children,
	open,
	onOpenChange,
	redirect = '/consumer/dashboard/matches',
}: {
	children?: React.ReactNode
	open?: boolean
	onOpenChange?: (open: boolean) => void
	redirect?: string
}) {
	const isControlled = open !== undefined
	const [internalOpen, setInternalOpen] = useState(false)
	const dialogOpen = isControlled ? open : internalOpen
	const handleOpenChange = (nextOpen: boolean) => {
		setInternalOpen(nextOpen)
		onOpenChange?.(nextOpen)
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
			{children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Create your profile</DialogTitle>
					<DialogDescription>
						Create a free profile to unlock your matches and connect with
						agents.
					</DialogDescription>
				</DialogHeader>
				<AuthCard mode="sign-up" embedded redirect={redirect} />
			</DialogContent>
		</Dialog>
	)
}

export function SignupDialogButton({
	className,
	variant = 'default',
}: {
	className?: string
	variant?: React.ComponentProps<typeof Button>['variant']
}) {
	return (
		<SignupDialog>
			<Button className={className} variant={variant}>
				Create Profile
			</Button>
		</SignupDialog>
	)
}
