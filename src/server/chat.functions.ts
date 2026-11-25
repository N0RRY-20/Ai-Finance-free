import { authServerMiddleware } from '#/middleware/auth.middleware'
import {
  getConversationUiMessages,
  listUserConversations,
  softDeleteConversation,
} from '#/services/chat.service.server'
import { conversationIdParamSchema } from '#/validations/chat.validation'
import { createServerFn } from '@tanstack/react-start'

export const listConversationsFn = createServerFn({ method: 'GET' })
  .middleware([authServerMiddleware])
  .handler(async ({ context }) => {
    const user = context.session?.user
    if (!user) {
      throw new Error('Unauthorized')
    }

    return await listUserConversations(user.id)
  })

export const getConversationMessagesFn = createServerFn({
  method: 'GET',
  strict: { output: false },
})
  .middleware([authServerMiddleware])
  .validator(conversationIdParamSchema)
  .handler(async ({ context, data }) => {
    const user = context.session?.user
    if (!user) {
      throw new Error('Unauthorized')
    }

    return await getConversationUiMessages(user.id, data.conversationId)
  })

export const deleteConversationFn = createServerFn({ method: 'POST' })
  .middleware([authServerMiddleware])
  .validator(conversationIdParamSchema)
  .handler(async ({ context, data }) => {
    const user = context.session?.user
    if (!user) {
      throw new Error('Unauthorized')
    }

    return await softDeleteConversation(user.id, data.conversationId)
  })
