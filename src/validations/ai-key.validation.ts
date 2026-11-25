import { GEMINI_CHAT_MODEL_IDS } from '#/constants/ai-models'
import { z } from 'zod'

export const geminiChatModelIdSchema = z.enum(GEMINI_CHAT_MODEL_IDS)

function validateOptionalApiKey(
  apiKey: string | undefined,
  ctx: z.RefinementCtx,
): void {
  if (!apiKey || apiKey.length === 0) return

  if (apiKey.length < 10) {
    ctx.addIssue({
      code: 'custom',
      path: ['apiKey'],
      message: 'API Key minimal 10 karakter.',
    })
  }

  if (/\s/.test(apiKey)) {
    ctx.addIssue({
      code: 'custom',
      path: ['apiKey'],
      message: 'API Key tidak boleh mengandung spasi.',
    })
  }
}

export const saveAiKeyInputSchema = z
  .object({
    apiKey: z.string().trim().max(512).optional(),
    model: geminiChatModelIdSchema,
  })
  .superRefine((data, ctx) => {
    validateOptionalApiKey(data.apiKey, ctx)
  })

/**
 * Skema form API Key Gemini untuk client yang menyesuaikan aturan wajib saat key belum tersimpan.
 */
export function createSaveAiKeyFormSchema(hasExistingKey: boolean) {
  return z
    .object({
      apiKey: z.string().trim().max(512),
      model: geminiChatModelIdSchema,
    })
    .superRefine((data, ctx) => {
      if (!hasExistingKey && data.apiKey.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['apiKey'],
          message: 'Masukkan API Key Gemini Anda terlebih dahulu.',
        })
        return
      }

      validateOptionalApiKey(data.apiKey, ctx)
    })
}
