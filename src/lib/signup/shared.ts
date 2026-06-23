export const SKIPPED_ANSWER = '__skipped__'

export function parseCityState(
	location: string,
): { city: string; state: string } | undefined {
	const [cityName, rest] = location.split(',').map((part) => part.trim())
	if (!cityName || !rest) return undefined
	const state = rest.split(/\s+/)[0]
	if (!state || state.length !== 2) return undefined
	return { city: cityName, state: state.toUpperCase() }
}

export function isValidZipCode(zipCode: string) {
	return /^\d{5}$/.test(zipCode)
}
