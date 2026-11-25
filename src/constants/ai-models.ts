import type { GeminiChatModelId } from '#/types/ai'

export const AI_PROVIDERS = ['gemini'] as const

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash' as const

export const GEMINI_CHAT_MODEL_OPTIONS = [
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    description: 'Cepat, stabil, dan hemat biaya untuk pencatatan harian.',
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    description: 'Penalaran lebih mendalam untuk analisis keuangan kompleks.',
  },
  {
    id: 'gemini-2.5-flash-lite',
    label: 'Gemini 2.5 Flash-Lite',
    description: 'Paling ringan dan ekonomis untuk respons instan.',
  },
  {
    id: 'gemini-3-flash-preview',
    label: 'Gemini 3 Flash Preview',
    description: 'Model generasi baru yang cepat dengan tool calling bawaan.',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash-Lite',
    description: 'Model ringan generasi terbaru untuk percakapan efisien.',
  },
] as const

export const GEMINI_CHAT_MODEL_IDS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
] as const satisfies readonly [GeminiChatModelId, ...GeminiChatModelId[]]
