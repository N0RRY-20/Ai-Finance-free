const DEFAULT_SERVER_ERROR_MESSAGE =
  'Terjadi kesalahan pada server. Silakan coba lagi.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getStringProp(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key]
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  if (typeof value === 'number') {
    return String(value)
  }
  return undefined
}

function formatErrorNode(node: unknown): string | null {
  if (!isRecord(node)) {
    return typeof node === 'string' && node.trim().length > 0
      ? node.trim()
      : null
  }

  const name = node instanceof Error ? node.name : getStringProp(node, 'name')
  const message =
    node instanceof Error ? node.message : getStringProp(node, 'message')
  const code = getStringProp(node, 'code')
  const detail = getStringProp(node, 'detail')
  const hint = getStringProp(node, 'hint')

  const header =
    name && message ? `${name}: ${message}` : (message ?? name ?? undefined)

  const extras = [
    code ? `code=${code}` : undefined,
    detail ? `detail=${detail}` : undefined,
    hint ? `hint=${hint}` : undefined,
  ].filter((item): item is string => Boolean(item))

  if (!header && extras.length === 0) {
    return null
  }

  if (header && extras.length > 0) {
    return `${header} (${extras.join(', ')})`
  }

  return header ?? extras.join(', ')
}

/**
 * Menelusuri rantai `cause` dan `sourceError` (misalnya dari Drizzle / NeonDbError)
 * untuk mendapatkan ringkasan penyebab error.
 */
export function extractErrorCauseChain(error: unknown): string | null {
  if (!isRecord(error)) {
    return null
  }

  const visited = new Set<unknown>([error])
  const parts: string[] = []
  let currentNodes: unknown[] = [error.cause, error.sourceError]

  for (let depth = 0; depth < 5 && currentNodes.length > 0; depth++) {
    const nextNodes: unknown[] = []

    for (const node of currentNodes) {
      if (node === undefined || node === null || visited.has(node)) {
        continue
      }
      visited.add(node)

      const formatted = formatErrorNode(node)
      if (formatted) {
        parts.push(formatted)
      }

      if (isRecord(node)) {
        nextNodes.push(node.cause, node.sourceError)
      }
    }

    currentNodes = nextNodes
  }

  return parts.length > 0 ? parts.join(' -> ') : null
}

/**
 * Mencatat error server beserta rantai `cause`-nya ke log server dan melempar
 * error yang aman untuk dikembalikan ke client.
 */
export function handleServerError(
  scope: string,
  error: unknown,
  fallbackMessage = DEFAULT_SERVER_ERROR_MESSAGE,
): never {
  if (error instanceof Error && error.message === 'Unauthorized') {
    throw error
  }

  const baseMessage = error instanceof Error ? error.message : String(error)
  const causeChain = extractErrorCauseChain(error)

  console.error(`[${scope}] Failed:`, {
    message: baseMessage,
    cause: causeChain,
    error,
  })

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(
      causeChain ? `${baseMessage}\nCause: ${causeChain}` : baseMessage,
    )
  }

  throw new Error(fallbackMessage)
}
