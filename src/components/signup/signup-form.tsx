import { useNavigate } from '@tanstack/react-router'
import { Lock, Loader2, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

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

type CreateProfileFn = (payload: { data: unknown }) => Promise<unknown>

export type SignupFormProps = {
	idPrefix?: string
	redirect: string
	createProfile: CreateProfileFn
	loadDraft: () => unknown
	clearDraft?: () => void
	submitLabel?: string
	namePlaceholder?: string
	emailPlaceholder?: string
	passwordPlaceholder?: string
	showTerms?: boolean
}

export function SignupForm({
	idPrefix = 'signup',
	redirect,
	createProfile,
	loadDraft,
	clearDraft,
	submitLabel = 'Create my account',
	namePlaceholder = 'Jordan Lee',
	emailPlaceholder = 'you@example.com',
	passwordPlaceholder = 'Choose a password',
	showTerms = true,
}: SignupFormProps) {
	const navigate = useNavigate()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const [googleAvailable, setGoogleAvailable] = useState(true)

	const callbackURL = new URL(redirect, window.location.origin).toString()
	const nameId = `${idPrefix}-name`
	const emailId = `${idPrefix}-email`
	const passwordId = `${idPrefix}-password`

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
				setGoogleAvailable(false)
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

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (isSubmitting) return
		setIsSubmitting(true)

		try {
			const { error } = await authClient.signUp.email({
				name: name.trim(),
				email: email.trim(),
				password,
			})
			if (error) throw error

			const draft = loadDraft()
			if (draft) {
				await createProfile({ data: draft })
				clearDraft?.()
			}

			await navigate({ to: redirect })
		} catch (error) {
			const message =
				error && typeof error === 'object' && 'message' in error
					? String(error.message)
					: 'Unable to create account. Try again.'
			toast.error(message)
			console.error('Sign-up failed', error)
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-3 lg:space-y-5">
			<form className="space-y-3 lg:space-y-4" onSubmit={handleSubmit}>
				<FieldGroup className="gap-2 lg:gap-7">
					<Field>
						<FieldLabel
							htmlFor={nameId}
							className="sr-only lg:not-sr-only lg:text-white/80"
						>
							Full name
						</FieldLabel>
						<div className="relative">
							<User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
							<Input
								id={nameId}
								placeholder={namePlaceholder}
								value={name}
								onChange={(event) => setName(event.target.value)}
								disabled={isSubmitting || isGoogleLoading}
								required
								className="h-9 rounded-xl border-white/20 bg-white/10 pl-10 text-sm text-white placeholder:text-white/40 lg:h-11 lg:text-base"
							/>
						</div>
					</Field>
					<Field>
						<FieldLabel
							htmlFor={emailId}
							className="sr-only lg:not-sr-only lg:text-white/80"
						>
							Email address
						</FieldLabel>
						<div className="relative">
							<Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
							<Input
								id={emailId}
								type="email"
								placeholder={emailPlaceholder}
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								disabled={isSubmitting || isGoogleLoading}
								autoComplete="email"
								required
								className="h-9 rounded-xl border-white/20 bg-white/10 pl-10 text-sm text-white placeholder:text-white/40 lg:h-11 lg:text-base"
							/>
						</div>
					</Field>
					<Field>
						<FieldLabel
							htmlFor={passwordId}
							className="sr-only lg:not-sr-only lg:text-white/80"
						>
							Password
						</FieldLabel>
						<div className="relative">
							<Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
							<Input
								id={passwordId}
								type="password"
								placeholder={passwordPlaceholder}
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								disabled={isSubmitting || isGoogleLoading}
								autoComplete="new-password"
								required
								className="h-9 rounded-xl border-white/20 bg-white/10 pl-10 text-sm text-white placeholder:text-white/40 lg:h-11 lg:text-base"
							/>
						</div>
					</Field>
					<Button
						type="submit"
						disabled={isSubmitting || isGoogleLoading}
						className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 w-full rounded-xl text-sm font-semibold lg:h-11 lg:text-base"
					>
						{isSubmitting ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : null}
						{submitLabel}
					</Button>
				</FieldGroup>
			</form>

			{googleAvailable ? (
				<>
					<div className="relative py-0 text-center text-xs text-white/40 lg:py-1">
						<span className="relative z-10 px-3 text-white/50">or</span>
						<div className="absolute top-1/2 left-0 h-px w-full bg-white/20" />
					</div>

					<Button
						type="button"
						onClick={handleGoogleSignIn}
						disabled={isGoogleLoading || isSubmitting}
						variant="outline"
						className="h-9 w-full rounded-xl border-white bg-white text-sm font-medium text-slate-950 hover:bg-slate-100 hover:text-slate-950 lg:h-11 lg:text-base"
					>
						{isGoogleLoading ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<GoogleIcon className="mr-2 h-5 w-5" />
						)}
						Continue with Google
					</Button>
				</>
			) : null}

			{showTerms ? (
				<p className="text-center text-[10px] leading-snug text-white/50 lg:text-xs">
					By creating an account, you agree to our{' '}
					<a
						href="/terms"
						className="text-white/80 underline underline-offset-2 hover:text-white"
					>
						Terms of Service
					</a>{' '}
					and{' '}
					<a
						href="/privacy"
						className="text-white/80 underline underline-offset-2 hover:text-white"
					>
						Privacy Policy
					</a>
					.
				</p>
			) : null}
		</div>
	)
}
