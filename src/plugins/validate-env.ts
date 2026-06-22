import { serverEnv } from '@/env.server'
import type { NitroAppPlugin } from 'nitro/types'

const validateEnvPlugin: NitroAppPlugin = () => {
	// Trigger lazy zod parse so the server fails fast on startup if required env is missing.
	Object.keys(serverEnv)
}

export default validateEnvPlugin
