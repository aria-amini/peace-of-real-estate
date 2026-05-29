declare module 'zipcodes' {
	type ZipCodeRecord = {
		zip: string
		city: string
		state: string
		country: string
		latitude?: number
		longitude?: number
	}

	export const codes: Record<string, ZipCodeRecord>
	export const states: {
		full: Record<string, string>
		abbr: Record<string, string>
		normalize(state: string): string | undefined
	}

	export function lookup(zip: string | number): ZipCodeRecord | undefined
	export function lookupByName(city: string, state: string): ZipCodeRecord[]
	export function lookupByState(state: string): ZipCodeRecord[]
}
