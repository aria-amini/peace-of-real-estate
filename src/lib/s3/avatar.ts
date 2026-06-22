import { getSignedDownloadUrl, resolvePublicOrSignedUrl } from '@/lib/s3'
import { serverEnv as env } from '@/env.server'

export async function getAvatarUrl(
	image: string | null | undefined,
): Promise<string | undefined> {
	const signedUrl = await getSignedDownloadUrl(env.AVATAR_BUCKET, image)
	return resolvePublicOrSignedUrl(image, signedUrl)
}
