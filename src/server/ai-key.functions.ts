import { authServerMiddleware } from '#/middleware/auth.middleware'
import {
  deleteUserAiKey,
  getUserAiKeyStatus,
  upsertUserAiKey,
} from '#/services/ai-key.service.server'
import { saveAiKeyInputSchema } from '#/validations/ai-key.validation'
import { createServerFn } from '@tanstack/react-start'

export const getUserAiKeyStatusFn = createServerFn({ method: 'GET' })
  .middleware([authServerMiddleware])
  .handler(async ({ context }) => {
    const user = context.session?.user
    if (!user) {
      throw new Error('Unauthorized')
    }

    return await getUserAiKeyStatus(user.id, 'gemini')
  })

export const saveUserAiKeyFn = createServerFn({ method: 'POST' })
  .middleware([authServerMiddleware])
  .validator(saveAiKeyInputSchema)
  .handler(async ({ context, data }) => {
    const user = context.session?.user
    if (!user) {
      throw new Error('Unauthorized')
    }

    return await upsertUserAiKey(user.id, {
      apiKey: data.apiKey,
      model: data.model,
      provider: 'gemini',
    })
  })

export const deleteUserAiKeyFn = createServerFn({ method: 'POST' })
  .middleware([authServerMiddleware])
  .handler(async ({ context }) => {
    const user = context.session?.user
    if (!user) {
      throw new Error('Unauthorized')
    }

    return await deleteUserAiKey(user.id, 'gemini')
  })
