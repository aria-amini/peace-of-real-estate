import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
	getUserSettings,
	getDefaultSettings,
	saveUserSettings,
	updateAnswers,
	updateAgentProfile,
	type UserSettings,
	type QuestionnaireAnswers,
} from '@/lib/matching/settings'
import {
	clearStoredIntakeDraft,
	getStoredIntakeDraft,
} from '@/lib/matching/intake-draft'

export function useAccountSettings() {
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		void (async () => {
			const draft = getStoredIntakeDraft()
			try {
				if (draft) {
					await saveUserSettings(draft)
					clearStoredIntakeDraft()
				}
				const storedSettings = await getUserSettings()
				setSettings(storedSettings ?? draft ?? getDefaultSettings())
			} catch {
				setSettings(draft ?? getDefaultSettings())
			} finally {
				setLoading(false)
			}
		})()
	}, [])

	const showSaveToast = useCallback(
		(status: 'saved' | 'error', message?: string) => {
			if (status === 'saved') {
				toast.success('Changes saved successfully')
			} else {
				toast.error(message ?? 'Error saving. Try again.')
			}
		},
		[],
	)

	const handleAnswersUpdate = useCallback(
		async (answers: QuestionnaireAnswers) => {
			try {
				await updateAnswers(answers)
				setSettings((prev) => (prev ? { ...prev, answers } : prev))
				showSaveToast('saved')
				return true
			} catch {
				showSaveToast('error', 'Save failed. Please try again.')
				return false
			}
		},
		[showSaveToast],
	)

	const handleAgentProfileUpdate = useCallback(
		async (profile: {
			experience: string
			zipCodes: string
			services: string[]
		}) => {
			try {
				await updateAgentProfile(profile)
				setSettings((prev) =>
					prev ? { ...prev, agentProfile: profile } : prev,
				)
				showSaveToast('saved')
			} catch {
				showSaveToast('error')
			}
		},
		[showSaveToast],
	)

	return {
		settings,
		loading,
		handleAnswersUpdate,
		handleAgentProfileUpdate,
	}
}
