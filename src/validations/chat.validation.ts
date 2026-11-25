import { z } from 'zod'
import { uuidSchema } from './common.validation'

export const conversationIdParamSchema = z.object({
  conversationId: uuidSchema,
})
