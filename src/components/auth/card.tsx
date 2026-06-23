import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { GoogleIcon } from '@/components/icons/google'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useGoogleSignIn } from '@/hooks/use-google-sign-in'
import { authClient } from '@/lib/auth/client'

type AuthMode = 'sign-in' | 'sign-up'

const DEFAULT_POST_AUTH_REDIRECT = '/consumer/dashboard/matches'

export function AuthCard({
	mode,
	redirect,
	embedded = false,
}: {
	mode: AuthMode
	redirect?: string
	embedded?: boolean
}) {
	const resolvedRedirect =
		redirect && redirect !== '/account' ? redirect : DEFAULT_POST_AUTH_REDIRECT
	const isSignUp = mode === 'sign-up'
	const title = isSignUp ? 'Create your profile' : 'Welcome Back'
	const primaryLabel = isSignUp ? 'Create profile' : 'Sign in'
	const alternateCopy = isSignUp
		? 'Already have an account?'
		: "Don't have an account?"
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const {
		signIn: handleGoogleSignIn,
		isLoading: isGoogleLoading,
		isAvailable: googleAvailable,
	} = useGoogleSignIn({
		fallbackRedirect: resolvedRedirect,
	})

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (isSubmitting) {
			return
		}

		setIsSubmitting(true)

		const callbackURL = new URL(
			resolvedRedirect,
			window.location.origin,
		).toString()

		try {
			if (isSignUp) {
				const { error } = await authClient.signUp.email({
					name: name.trim(),
					email: email.trim(),
					password,
					callbackURL,
				})

				if (error) {
					throw error
				}

				window.location.assign(resolvedRedirect)
				return
			}

			const { data, error } = await authClient.signIn.email({
				email: email.trim(),
				password,
				callbackURL,
			})

			if (error) {
				throw error
			}

			window.location.assign(data?.url ?? resolvedRedirect)
		} catch (error) {
			const message =
				error && typeof error === 'object' && 'message' in error
					? String(error.message)
					: isSignUp
						? 'Unable to create account. Try again.'
						: 'Unable to sign in. Check email and password.'

			toast.error(message)
			console.error(isSignUp ? 'Sign-up failed' : 'Sign-in failed', error)
			setIsSubmitting(false)
		}
	}

	const cardInner = (
		<div className="space-y-6">
			{googleAvailable ? (
				<>
					<Button
						type="button"
						onClick={handleGoogleSignIn}
						disabled={isGoogleLoading || isSubmitting}
						variant="outline"
						className="w-full"
					>
						{isGoogleLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<GoogleIcon className="h-5 w-5" />
						)}
						{isSignUp ? 'Create profile with Google' : 'Sign in with Google'}
					</Button>

					<div className="text-muted-foreground relative py-2 text-center text-xs tracking-[0.2em] uppercase">
						<span className="bg-background relative z-10 px-3">or</span>
						<div className="bg-border absolute top-1/2 left-0 h-px w-full" />
					</div>
				</>
			) : null}

			<form className="space-y-6" onSubmit={handleSubmit}>
				<FieldGroup>
					{isSignUp ? (
						<Field>
							<FieldLabel htmlFor="name">Full name</FieldLabel>
							<Input
								id="name"
								placeholder="Jordan Lee"
								value={name}
								onChange={(event) => setName(event.target.value)}
								disabled={isSubmitting || isGoogleLoading}
								required
							/>
						</Field>
					) : null}
					<Field>
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							disabled={isSubmitting || isGoogleLoading}
							autoComplete="email"
							required
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="password">Password</FieldLabel>
						<Input
							id="password"
							type="password"
							placeholder={isSignUp ? 'Choose password' : 'Enter password'}
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							disabled={isSubmitting || isGoogleLoading}
							autoComplete={isSignUp ? 'new-password' : 'current-password'}
							required
						/>
					</Field>
					<Button
						type="submit"
						disabled={isSubmitting || isGoogleLoading}
						className="w-full"
					>
						{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
						{primaryLabel}
					</Button>
					<p className="text-muted-foreground text-center text-sm">
						{alternateCopy}{' '}
						{isSignUp ? (
							<Link
								to="/login"
								{...(redirect ? { search: { redirect } } : {})}
								className="text-foreground font-medium underline underline-offset-4"
							>
								Sign in
							</Link>
						) : (
							<Link
								to="/consumer/signup"
								search={
									redirect ? { step: 'intro', redirect } : { step: 'intro' }
								}
								className="text-foreground font-medium underline underline-offset-4"
							>
								Create profile
							</Link>
						)}
					</p>
				</FieldGroup>
			</form>
		</div>
	)

	if (embedded) {
		return cardInner
	}

	return (
		<div className="flex h-full w-full flex-1 items-center justify-center px-6 py-12">
			<div className="flex w-full max-w-md flex-col items-center gap-8">
				<div className="text-center">
					<div className="text-muted-foreground mb-3 text-sm">
						{isSignUp ? 'New Profile' : 'Authentication'}
					</div>
					<h1 className="text-3xl">{title}</h1>
				</div>
				<Card className="w-full">
					<CardContent className="pt-6">{cardInner}</CardContent>
				</Card>
			</div>
		</div>
	)
}
