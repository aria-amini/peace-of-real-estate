import { getSignedDownloadUrl, resolvePublicOrSignedUrl } from '@/lib/s3'
import { env } from '@/env'

export async function getSignedVideoUrl(
	videoKey: string | null | undefined,
): Promise<string | undefined> {
	const signedUrl = await getSignedDownloadUrl(env.VIDEO_BUCKET, videoKey)
	return resolvePublicOrSignedUrl(videoKey, signedUrl)
}
