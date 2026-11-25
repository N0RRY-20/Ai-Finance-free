import { ChatMarkdown } from '#/components/ai/chat-markdown'
import { Bubble, BubbleContent } from '#/components/ui/bubble'
import { CodeBlock, CodeBlockContent } from '#/components/ui/code-block'
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from '#/components/ui/trace'
import type { UIMessage } from '@tanstack/ai-react'
import type { LucideIcon } from 'lucide-react'
import {
  BrainIcon,
  ListFilterIcon,
  PencilIcon,
  PieChartIcon,
  ReceiptTextIcon,
  Trash2Icon,
  WrenchIcon,
} from 'lucide-react'

type MessagePart = UIMessage['parts'][number]
type ThinkingMessagePart = Extract<MessagePart, { type: 'thinking' }>
type ToolCallMessagePart = Extract<MessagePart, { type: 'tool-call' }>

interface ToolMeta {
  icon: LucideIcon
  runningLabel: string
  doneLabel: string
  errorLabel: string
}

function getToolMeta(toolName: string): ToolMeta {
  switch (toolName) {
    case 'record_transaction':
      return {
        icon: ReceiptTextIcon,
        runningLabel: 'Mencatat transaksi...',
        doneLabel: 'Transaksi dicatat',
        errorLabel: 'Gagal mencatat transaksi',
      }
    case 'list_transactions':
      return {
        icon: ListFilterIcon,
        runningLabel: 'Memuat daftar transaksi...',
        doneLabel: 'Daftar transaksi dimuat',
        errorLabel: 'Gagal memuat transaksi',
      }
    case 'get_transaction_summary':
      return {
        icon: PieChartIcon,
        runningLabel: 'Menghitung ringkasan keuangan...',
        doneLabel: 'Ringkasan keuangan dihitung',
        errorLabel: 'Gagal menghitung ringkasan',
      }
    case 'update_transaction':
      return {
        icon: PencilIcon,
        runningLabel: 'Memperbarui transaksi...',
        doneLabel: 'Transaksi diperbarui',
        errorLabel: 'Gagal memperbarui transaksi',
      }
    case 'delete_transaction':
      return {
        icon: Trash2Icon,
        runningLabel: 'Menghapus transaksi...',
        doneLabel: 'Transaksi dihapus',
        errorLabel: 'Gagal menghapus transaksi',
      }
    default:
      return {
        icon: WrenchIcon,
        runningLabel: `Menjalankan ${toolName}...`,
        doneLabel: `${toolName} selesai`,
        errorLabel: `${toolName} gagal`,
      }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getToolDescription(part: ToolCallMessagePart): string | undefined {
  if (!isRecord(part.output)) return undefined

  if (
    isRecord(part.output.transaction) &&
    typeof part.output.transaction.amountFormatted === 'string'
  ) {
    return part.output.transaction.amountFormatted
  }

  if (typeof part.output.count === 'number') {
    return `${part.output.count} item`
  }

  if (
    isRecord(part.output.summary) &&
    typeof part.output.summary.balanceFormatted === 'string'
  ) {
    return part.output.summary.balanceFormatted
  }

  return undefined
}

function formatToolOutput(output: unknown): string {
  if (typeof output === 'string') {
    return output
  }
  try {
    return JSON.stringify(output, null, 2)
  } catch {
    return String(output)
  }
}

function ThinkingTraceItem({
  part,
  isRunning,
}: {
  part: ThinkingMessagePart
  isRunning: boolean
}) {
  return (
    <TraceCollapsible defaultOpen={isRunning}>
      <TraceCollapsibleTrigger>
        <TraceLine status={isRunning ? 'running' : undefined}>
          <TraceIcon>
            <BrainIcon />
          </TraceIcon>
          <TraceTitle>
            {isRunning ? 'Sedang berpikir...' : 'Proses berpikir'}
          </TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <p className="text-xs whitespace-pre-wrap">{part.content}</p>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

function ToolCallTraceItem({ part }: { part: ToolCallMessagePart }) {
  const meta = getToolMeta(part.name)
  const Icon = meta.icon
  const outputFailed = isRecord(part.output) && part.output.success === false
  const isError = part.state === 'error' || outputFailed
  const isComplete = part.state === 'complete'
  const status: 'running' | 'error' | undefined = isError
    ? 'error'
    : isComplete
      ? undefined
      : 'running'

  const title = isError
    ? meta.errorLabel
    : isComplete
      ? meta.doneLabel
      : meta.runningLabel
  const description = getToolDescription(part)

  const line = (
    <TraceLine status={status}>
      <TraceIcon>
        <Icon />
      </TraceIcon>
      <TraceTitle>{title}</TraceTitle>
      {description ? <TraceDescription>{description}</TraceDescription> : null}
    </TraceLine>
  )

  if (part.output === undefined) {
    return line
  }

  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <CodeBlock size="sm" variant={isError ? 'destructive' : 'default'}>
          <CodeBlockContent wrap className="max-h-64">
            {formatToolOutput(part.output)}
          </CodeBlockContent>
        </CodeBlock>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

export function ChatMessageParts({
  message,
  isStreaming,
}: {
  message: UIMessage
  isStreaming: boolean
}) {
  const isUser = message.role === 'user'

  if (message.parts.length === 0 && isStreaming && !isUser) {
    return (
      <span className="shimmer px-3.5 text-sm text-muted-foreground">
        Sedang memproses...
      </span>
    )
  }

  type RenderGroup =
    | { kind: 'trace'; parts: Array<ThinkingMessagePart | ToolCallMessagePart> }
    | { kind: 'text'; content: string }

  const groups: RenderGroup[] = []

  for (const part of message.parts) {
    if (part.type === 'thinking' || part.type === 'tool-call') {
      const last = groups.at(-1)
      if (last && last.kind === 'trace') {
        last.parts.push(part)
      } else {
        groups.push({ kind: 'trace', parts: [part] })
      }
    } else if (part.type === 'text' && part.content) {
      groups.push({ kind: 'text', content: part.content })
    }
  }

  if (groups.length === 0 && isStreaming && !isUser) {
    return (
      <span className="shimmer px-3.5 text-sm text-muted-foreground">
        Sedang memproses...
      </span>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {groups.map((group, groupIndex) => {
        if (group.kind === 'trace') {
          return (
            <Trace key={`trace-${groupIndex}`} className="px-1">
              {group.parts.map((part, partIndex) => {
                if (part.type === 'thinking') {
                  const hasLaterGroups = groupIndex < groups.length - 1
                  const hasLaterParts = partIndex < group.parts.length - 1
                  const isRunning =
                    isStreaming && !hasLaterGroups && !hasLaterParts
                  return (
                    <ThinkingTraceItem
                      key={`thinking-${partIndex}`}
                      part={part}
                      isRunning={isRunning}
                    />
                  )
                }

                return <ToolCallTraceItem key={part.id} part={part} />
              })}
            </Trace>
          )
        }

        if (isUser) {
          return (
            <Bubble
              key={`text-${groupIndex}`}
              variant="default"
              align="end"
            >
              <BubbleContent className="whitespace-pre-wrap">
                {group.content}
              </BubbleContent>
            </Bubble>
          )
        }

        const isStreamingGroup = isStreaming && groupIndex === groups.length - 1

        return (
          <Bubble
            key={`text-${groupIndex}`}
            variant="muted"
            align="start"
            className="max-w-[90%]"
          >
            <BubbleContent>
              <ChatMarkdown
                content={group.content}
                isStreaming={isStreamingGroup}
              />
            </BubbleContent>
          </Bubble>
        )
      })}
    </div>
  )
}
