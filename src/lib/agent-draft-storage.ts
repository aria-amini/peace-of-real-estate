import type { RepresentationSide } from '@/lib/matching/profile.types'
import type { Answers } from '@/lib/matching/questions'

const STORAGE_KEY = 'pre-agent-draft'

export type AgentDraft = {
	// Identity
	firstName?: string
	lastName?: string
	brokerageName?: string
	email?: string
	phone?: string
	businessAddress?: string
	licenseNumberState?: string
	licenseProof?: string
	yearsLicensed?: string
	averageTransactions?: string
	employmentStatus?: string

	// Market
	city?: string
	state?: string
	zipCodes?: string[]
	serviceAreas?: string[]
	representationSide?: RepresentationSide
	typicalPriceRange?: string
	bestClientTypes?: string[]
	notFitFor?: string

	// Compliance / peace pact
	licenseAttested?: boolean
	eoInsuranceStatus?: string
	peacePactSigned?: boolean
	peacePactSignature?: string
	clientFirstTerms?: string

	// Deep profile — subjective
	communicationCadence?: string
	quickContactStyle?: string
	updateDeliveryStyle?: string
	responseTime?: string
	transparencyStyle?: string
	clientBoundaryStyle?: string
	negotiationEthic?: string
	dualAgencyStyle?: string
	energyStyle?: string
	teachingStyle?: string
	dealStressStyle?: string
	decisionMakingStyle?: string
	serviceDepth?: string
	involvementLevel?: string
	representationPreference?: string
	matchPriorities?: string[]

	// Deep profile — narrative
	valueProposition?: string
	idealClientDescription?: string
	whyIStarted?: string
	typicalDayInDeal?: string
	hardNo?: string
	valueBeyondTransaction?: string

	// Legacy answers from old flow (kept for compatibility)
	answers?: Answers
}

export function loadAgentDraft(): AgentDraft | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (!raw) return null
		const parsed = JSON.parse(raw) as unknown
		if (parsed && typeof parsed === 'object') {
			return parsed as AgentDraft
		}
		return null
	} catch {
		return null
	}
}

export function saveAgentDraft(draft: AgentDraft) {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function clearAgentDraft() {
	if (typeof window === 'undefined') return
	window.localStorage.removeItem(STORAGE_KEY)
}

export function draftToAgentProfileUpdate(draft: AgentDraft) {
	return {
		firstName: draft.firstName,
		lastName: draft.lastName,
		brokerageName: draft.brokerageName,
		email: draft.email,
		phone: draft.phone,
		businessAddress: draft.businessAddress,
		licenseNumberState: draft.licenseNumberState,
		licenseProof: draft.licenseProof,
		yearsLicensed: draft.yearsLicensed,
		averageTransactions: draft.averageTransactions,
		employmentStatus: draft.employmentStatus,
		serviceAreas: draft.serviceAreas,
		representationSide: draft.representationSide,
		typicalPriceRange: draft.typicalPriceRange,
		bestClientTypes: draft.bestClientTypes,
		notFitFor: draft.notFitFor,
		licenseAttested: draft.licenseAttested,
		eoInsuranceStatus: draft.eoInsuranceStatus,
		peacePactSigned: draft.peacePactSigned,
		peacePactSignature: draft.peacePactSignature,
		clientFirstTerms: draft.clientFirstTerms,
		communicationCadence: draft.communicationCadence,
		quickContactStyle: draft.quickContactStyle,
		updateDeliveryStyle: draft.updateDeliveryStyle,
		responseTime: draft.responseTime,
		transparencyStyle: draft.transparencyStyle,
		clientBoundaryStyle: draft.clientBoundaryStyle,
		negotiationEthic: draft.negotiationEthic,
		dualAgencyStyle: draft.dualAgencyStyle,
		energyStyle: draft.energyStyle,
		teachingStyle: draft.teachingStyle,
		dealStressStyle: draft.dealStressStyle,
		decisionMakingStyle: draft.decisionMakingStyle,
		serviceDepth: draft.serviceDepth,
		involvementLevel: draft.involvementLevel,
		representationPreference: draft.representationPreference,
		matchPriorities: draft.matchPriorities,
		valueProposition: draft.valueProposition,
		idealClientDescription: draft.idealClientDescription,
		whyIStarted: draft.whyIStarted,
		typicalDayInDeal: draft.typicalDayInDeal,
		hardNo: draft.hardNo,
		valueBeyondTransaction: draft.valueBeyondTransaction,
	}
}
