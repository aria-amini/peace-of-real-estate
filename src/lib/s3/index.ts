import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { serverEnv as env } from '@/env.server'

let storageClient: S3Client | undefined

export function getStorageClient(): S3Client {
	storageClient ??= new S3Client({
		region: env.AWS_REGION ?? 'auto',
		endpoint: env.AWS_ENDPOINT_URL ?? '',
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
		},
		forcePathStyle: true,
	})
	return storageClient
}

export async function getSignedDownloadUrl(
	bucket: string | undefined,
	key: string | null | undefined,
	options: { expiresIn?: number } = {},
): Promise<string | undefined> {
	if (!bucket || !key) return undefined

	const client = getStorageClient()
	const command = new GetObjectCommand({ Bucket: bucket, Key: key })
	return getSignedUrl(client, command, {
		expiresIn: options.expiresIn ?? 60 * 60,
	})
}

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
