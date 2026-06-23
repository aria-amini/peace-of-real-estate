import { describe, expect, it } from 'vitest'

import { isValidZipCode, parseCityState } from '@/lib/zip-codes'

describe('zip code helpers', () => {
	it('parses city and state', () => {
		expect(parseCityState('Austin, TX')).toEqual({
			city: 'Austin',
			state: 'TX',
		})
		expect(parseCityState('austin, tx')).toEqual({
			city: 'austin',
			state: 'TX',
		})
		expect(parseCityState('Austin')).toBeUndefined()
		expect(parseCityState('Austin, Texas')).toBeUndefined()
	})

	it('validates zip codes', () => {
		expect(isValidZipCode('78701')).toBe(true)
		expect(isValidZipCode('7870')).toBe(false)
		expect(isValidZipCode('78701-1234')).toBe(false)
		expect(isValidZipCode('hello')).toBe(false)
	})
})
