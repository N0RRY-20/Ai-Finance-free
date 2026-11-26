import type { GeminiChatModelId } from '#/types/ai'

export const AI_PROVIDERS = ['gemini'] as const

export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite' as const

export const GEMINI_CHAT_MODEL_OPTIONS = [
  {
    id: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash-Lite',
    description:
      'Tercepat, paling hemat kuota, dan direkomendasikan untuk pencatatan harian.',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash-Lite',
    description: 'Model ringan stabil untuk percakapan harian yang efisien.',
  },
  {
    id: 'gemini-3.6-flash',
    label: 'Gemini 3.6 Flash',
    description:
      'Seimbang antara kecepatan dan akurasi untuk tugas keuangan multi-langkah.',
  },
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    description:
      'Penalaran paling mendalam di seri Flash untuk analisis keuangan kompleks.',
  },
] as const

export const GEMINI_CHAT_MODEL_IDS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
] as const satisfies readonly [GeminiChatModelId, ...GeminiChatModelId[]]
