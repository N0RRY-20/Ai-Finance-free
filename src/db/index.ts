import { serverEnv } from '#/config/env.server'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export const db = drizzle(serverEnv.DATABASE_URL, { schema })
