import { ENV } from 'varlock/env'
import type { PublicTypedEnvSchema, TypedEnvSchema } from 'varlock/env'

export const env: TypedEnvSchema = ENV
export const publicEnv: PublicTypedEnvSchema = ENV

export function isProductionRuntime() {
	return env.APP_ENV === 'production' || env.APP_ENV === 'staging'
}
