import { describe, expect, it } from 'vitest'

import {
	formatPriceCompact,
	formatPriceRange,
	parsePriceRange,
	priceRangeOverlaps,
	serializePriceRange,
} from '@/components/signup/price-range-utils'
import { calculateFitScore } from '@/lib/matching/scoring'
import type { AgentProfile, ConsumerProfile } from '@/lib/matching/profile'

describe('price range utilities', () => {
	it('parses a valid range string', () => {
		expect(parsePriceRange('400000-750000')).toEqual({
			min: 400_000,
			max: 750_000,
		})
	})

	it('falls back to default range for empty input', () => {
		expect(parsePriceRange(null)).toEqual({ min: 400_000, max: 600_000 })
		expect(parsePriceRange('')).toEqual({ min: 400_000, max: 600_000 })
	})

	it('serializes a range', () => {
		expect(serializePriceRange({ min: 300_000, max: 500_000 })).toBe(
			'300000-500000',
		)
	})

	it('formats compact prices', () => {
		expect(formatPriceCompact(0)).toBe('$0k')
		expect(formatPriceCompact(500_000)).toBe('$500k')
		expect(formatPriceCompact(1_500_000)).toBe('$1.5M')
		expect(formatPriceCompact(2_000_000)).toBe('$2M')
	})

	it('formats full ranges', () => {
		expect(formatPriceRange({ min: 400_000, max: 750_000 })).toBe(
			'$400k - $750k',
		)
	})

	it('detects overlapping ranges', () => {
		expect(priceRangeOverlaps('400000-750000', '400kTo750k')).toBe(true)
		expect(priceRangeOverlaps('0-300000', '400kTo750k')).toBe(false)
	})
})

describe('fit scoring', () => {
	it('calculates a fallback score when no consumer is provided', () => {
		const agent = makeAgent({
			representationSide: 'buying',
			typicalPriceRange: '400kTo750k',
			bestClientTypes: ['firstTime'],
			peacePactSigned: true,
		})
		const result = calculateFitScore(agent)
		expect(result.fitScore).toBeGreaterThan(0)
		expect(Object.keys(result.scores)).toEqual([
			'Working Style',
			'Communication',
			'Transparency',
			'Fit',
		])
	})

	it('rewards matching consumer and agent preferences', () => {
		const agent = makeAgent({
			representationSide: 'buying',
			typicalPriceRange: '400kTo750k',
			bestClientTypes: ['firstTime'],
			quickContactStyle: 'text',
			updateDeliveryStyle: 'text',
			communicationCadence: 'scheduled',
			dualAgencyStyle: 'separateBrokerage',
			peacePactSigned: true,
			serviceAreas: ['TX'],
		})
		const consumer = makeConsumer({
			intent: 'buying',
			priceRange: '350000-800000',
			propertyTypes: ['singleFamily'],
			experienceLevel: 'firstTime',
			preferredContactMethod: 'text',
			involvementLevel: 'veryInvolved',
			representationPreference: 'exclusive',
			state: 'TX',
		})
		const result = calculateFitScore(agent, consumer)
		expect(result.fitScore).toBeGreaterThan(80)
	})
})

function makeAgent(overrides: Partial<AgentProfile> = {}): AgentProfile {
	return {
		id: 'agent-1',
		userId: 'user-1',
		status: 'active',
		createdAt: new Date(),
		updatedAt: new Date(),
		bestClientTypes: [],
		serviceAreas: [],
		matchPriorities: [],
		usePaxWriter: true,
		licenseAttested: false,
		peacePactSigned: false,
		averageTransactions: null,
		billingAddress: null,
		brokerageName: null,
		businessAddress: null,
		clientBoundaryStyle: null,
		communicationCadence: null,
		dealStressStyle: null,
		decisionMakingStyle: null,
		dualAgencyStyle: null,
		email: null,
		employmentStatus: null,
		energyStyle: null,
		eoInsuranceStatus: null,
		firstName: null,
		hardNo: null,
		idealClientDescription: null,
		involvementLevel: null,
		lastName: null,
		licenseNumberState: null,
		licenseProof: null,
		negotiationEthic: null,
		notFitFor: null,
		peacePactSignature: null,
		peacePactSignedAt: null,
		phone: null,
		quickContactStyle: null,
		representationPreference: null,
		representationSide: null,
		responseTime: null,
		serviceDepth: null,
		teachingStyle: null,
		transparencyStyle: null,
		typicalDayInDeal: null,
		typicalPriceRange: null,
		clientFirstTerms: null,
		...overrides,
	} satisfies AgentProfile
}

function makeConsumer(
	overrides: Partial<ConsumerProfile> = {},
): ConsumerProfile {
	return {
		id: 'consumer-1',
		userId: 'user-1',
		status: 'active',
		intent: 'buying',
		createdAt: new Date(),
		updatedAt: new Date(),
		propertyTypes: [],
		matchPriorities: [],
		commissionComfort: null,
		estimatedHomeValue: null,
		experienceLevel: null,
		involvementLevel: null,
		location: null,
		matchDetails: null,
		preferredContactMethod: null,
		priceRange: null,
		representationPreference: null,
		state: null,
		...overrides,
	} satisfies ConsumerProfile
}
