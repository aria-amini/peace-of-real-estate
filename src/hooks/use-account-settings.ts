import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type {
	AgentProfileUpdate,
	ConsumerProfileUpdate,
} from '@/lib/matching/profile.types'
import {
	loadAgentProfile,
	loadConsumerProfile,
	saveAgentProfile,
	saveConsumerProfile,
} from '@/lib/matching/profile.db'

const consumerProfileKey = ['consumer-profile']
const agentProfileKey = ['agent-profile']

export function useAccountSettings() {
	const queryClient = useQueryClient()

	const consumerQuery = useQuery({
		queryKey: consumerProfileKey,
		queryFn: loadConsumerProfile,
	})

	const agentQuery = useQuery({
		queryKey: agentProfileKey,
		queryFn: loadAgentProfile,
	})

	const showSaveToast = (status: 'saved' | 'error', message?: string) => {
		if (status === 'saved') {
			toast.success('Changes saved successfully')
		} else {
			toast.error(message ?? 'Error saving. Try again.')
		}
	}

	const saveConsumerMutation = useMutation<
		void,
		Error,
		ConsumerProfileUpdate,
		unknown
	>({
		mutationFn: saveConsumerProfile,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: consumerProfileKey })
			showSaveToast('saved')
		},
		onError: () => showSaveToast('error', 'Save failed. Please try again.'),
	})

	const saveAgentMutation = useMutation<
		void,
		Error,
		AgentProfileUpdate,
		unknown
	>({
		mutationFn: saveAgentProfile,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: agentProfileKey })
			showSaveToast('saved')
		},
		onError: () => showSaveToast('error', 'Save failed. Please try again.'),
	})

	const saveConsumer = async (update: ConsumerProfileUpdate) => {
		try {
			await saveConsumerMutation.mutateAsync(update)
			return true
		} catch {
			return false
		}
	}

	const saveAgent = async (update: AgentProfileUpdate) => {
		try {
			await saveAgentMutation.mutateAsync(update)
			return true
		} catch {
			return false
		}
	}

	return {
		consumerProfile: consumerQuery.data ?? null,
		agentProfile: agentQuery.data ?? null,
		loading: consumerQuery.isLoading || agentQuery.isLoading,
		saveConsumer,
		saveAgent,
	}
}
