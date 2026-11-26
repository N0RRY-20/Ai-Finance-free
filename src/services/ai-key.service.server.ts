import { DEFAULT_GEMINI_MODEL } from '#/constants/ai-models'
import { userAiApiKeyRepository } from '#/db/repositories'
import { decryptSecret, encryptSecret } from '#/utils/crypto.server'
import type {
  AiProvider,
  DecryptedUserAiCredentials,
  DeleteResult,
  GeminiChatModelId,
  UpsertUserAiKeyInput,
  UserAiKeyStatus,
} from '#/types/ai'
import { geminiChatModelIdSchema } from '#/validations/ai-key.validation'
import { maskKey } from '@tanstack/ai/byok'

function normalizeChatModel(
  model: string | null | undefined,
): GeminiChatModelId {
  const parsed = geminiChatModelIdSchema.safeParse(model)
  return parsed.success ? parsed.data : DEFAULT_GEMINI_MODEL
}

export async function getUserAiKeyStatus(
  userId: string,
  provider: AiProvider = 'gemini',
): Promise<UserAiKeyStatus> {
  const row = await userAiApiKeyRepository.findStatusByUserAndProvider(
    userId,
    provider,
  )

  if (!row) {
    return {
      hasKey: false,
      provider,
      keyHint: null,
      model: DEFAULT_GEMINI_MODEL,
      updatedAt: null,
    }
  }

  return {
    hasKey: true,
    provider,
    keyHint: row.keyHint,
    model: normalizeChatModel(row.model),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function getDecryptedUserAiCredentials(
  userId: string,
  provider: AiProvider = 'gemini',
): Promise<DecryptedUserAiCredentials | null> {
  const row = await userAiApiKeyRepository.findCredentialsByUserAndProvider(
    userId,
    provider,
  )

  if (!row) {
    return null
  }

  return {
    apiKey: decryptSecret(row.encryptedApiKey),
    model: normalizeChatModel(row.model),
  }
}

export async function upsertUserAiKey(
  userId: string,
  input: UpsertUserAiKeyInput,
): Promise<UserAiKeyStatus> {
  const provider = input.provider ?? 'gemini'
  const trimmedKey = input.apiKey?.trim()

  if (trimmedKey) {
    const encryptedApiKey = encryptSecret(trimmedKey)
    const keyHint = `••••${maskKey(trimmedKey)}`

    const saved = await userAiApiKeyRepository.upsert({
      userId,
      provider,
      encryptedApiKey,
      keyHint,
      model: input.model,
    })

    return {
      hasKey: true,
      provider,
      keyHint: saved?.keyHint ?? keyHint,
      model: normalizeChatModel(saved?.model ?? input.model),
      updatedAt: saved?.updatedAt.toISOString() ?? new Date().toISOString(),
    }
  }

  const updated = await userAiApiKeyRepository.updateModel(
    userId,
    provider,
    input.model,
  )

  if (!updated) {
    throw new Error('Masukkan API Key Gemini terlebih dahulu.')
  }

  return {
    hasKey: true,
    provider,
    keyHint: updated.keyHint,
    model: normalizeChatModel(updated.model),
    updatedAt: updated.updatedAt.toISOString(),
  }
}

export async function deleteUserAiKey(
  userId: string,
  provider: AiProvider = 'gemini',
): Promise<DeleteResult> {
  const deleted = await userAiApiKeyRepository.deleteByUserAndProvider(
    userId,
    provider,
  )

  return { deleted }
}
