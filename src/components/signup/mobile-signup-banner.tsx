import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import { SignupForm, type SignupFormProps } from './signup-form'

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			/>
		</svg>
	)
}

type MobileSignupBannerProps = SignupFormProps & {
	title: string
	subtitle: string
	ctaLabel?: string
	googleLabel?: string
}

export function MobileSignupBanner({
	title,
	subtitle,
	ctaLabel = 'Create account',
	googleLabel = 'Google',
	...signupFormProps
}: MobileSignupBannerProps) {
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const redirect = signupFormProps.redirect
	const callbackURL =
		typeof window !== 'undefined'
			? new URL(redirect, window.location.origin).toString()
			: redirect

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true)
		try {
			const { data, error } = await authClient.signIn.social({
				provider: 'google',
				callbackURL,
			})
			if (error) throw error
			window.location.assign(data?.url ?? redirect)
		} catch (error) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				error.code === 'PROVIDER_NOT_FOUND'
			) {
				toast.error(
					'Google login is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.development.',
				)
			} else {
				toast.error('Google sign-in failed. Try again.')
			}
			console.error('Google sign-in failed', error)
			setIsGoogleLoading(false)
		}
	}

	return (
		<Sheet>
			<div className="bg-primary fixed inset-x-0 bottom-0 z-30 rounded-t-3xl px-4 pt-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] text-white shadow-2xl shadow-slate-950/30 lg:hidden">
				<div className="mx-auto w-full max-w-md space-y-3">
					<div>
						<h2 className="font-heading text-xl leading-tight font-bold text-white">
							{title}
						</h2>
						<p className="mt-1 text-sm leading-snug text-white/70">
							{subtitle}
						</p>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<SheetTrigger asChild>
							<Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-11 rounded-xl px-4 text-sm font-semibold">
								{ctaLabel}
							</Button>
						</SheetTrigger>
						<Button
							type="button"
							onClick={handleGoogleSignIn}
							disabled={isGoogleLoading}
							variant="outline"
							className="h-11 rounded-xl border-white bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-100 hover:text-slate-950"
							aria-label="Continue with Google"
						>
							{isGoogleLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<GoogleIcon className="mr-2 h-5 w-5" />
							)}
							{googleLabel}
						</Button>
					</div>
				</div>
			</div>

			<SheetContent
				side="bottom"
				className="bg-primary max-h-[92dvh] overflow-y-auto rounded-t-3xl border-white/10 px-4 pt-5 pb-[calc(1rem+env(safe-area-inset-bottom))] text-white lg:hidden"
			>
				<SheetHeader className="px-0 pt-0 pb-4 text-left">
					<SheetTitle className="font-heading pr-10 text-2xl tracking-tight text-white">
						Create your profile
					</SheetTitle>
					<SheetDescription className="text-white/70">
						Save your profile and start matching.
					</SheetDescription>
				</SheetHeader>
				<SignupForm {...signupFormProps} idPrefix="mobile-signup" />
			</SheetContent>
		</Sheet>
	)
}
