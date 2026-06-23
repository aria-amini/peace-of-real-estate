export function isPublicUrl(value: string | null | undefined): boolean {
	return typeof value === 'string' && /^https?:\/\//.test(value)
}

export function resolvePublicOrSignedUrl(
	value: string | null | undefined,
	signedUrl: string | undefined,
): string | undefined {
	if (!value) return undefined
	if (isPublicUrl(value)) return value
	return signedUrl
}
