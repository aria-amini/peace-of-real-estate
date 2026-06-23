import { useState } from 'react'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth/client'

export type UseGoogleSignInOptions = {
	callbackURL: string
	fallbackRedirect: string
}

export function useGoogleSignIn({
	callbackURL,
	fallbackRedirect,
}: UseGoogleSignInOptions) {
	const [isLoading, setIsLoading] = useState(false)
	const [isAvailable, setIsAvailable] = useState(true)

	const signIn = async () => {
		setIsLoading(true)

		try {
			const { data, error } = await authClient.signIn.social({
				provider: 'google',
				callbackURL,
			})

			if (error) {
				throw error
			}

			window.location.assign(data?.url ?? fallbackRedirect)
		} catch (error) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				error.code === 'PROVIDER_NOT_FOUND'
			) {
				setIsAvailable(false)
				toast.error(
					'Google login is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.development.',
				)
			} else {
				toast.error('Google sign-in failed. Try again.')
			}

			setIsLoading(false)
		}
	}

	return { signIn, isLoading, isAvailable }
}
