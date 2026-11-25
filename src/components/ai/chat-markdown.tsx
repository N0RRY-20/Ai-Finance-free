import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from '#/components/ui/code-block'
import { useHighlightedCode } from '#/hooks/use-highlighted-code'
import { streamingMarkdownExtension } from '@tanstack/markdown/extensions/streaming'
import { parseMarkdown } from '@tanstack/markdown/parser'
import type { MarkdownComponents } from '@tanstack/markdown/react'
import { Markdown } from '@tanstack/markdown/react'
import { cn } from 'cn'
import { isValidElement, useMemo } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

const STREAMING_EXTENSIONS = [streamingMarkdownExtension()]

function extractNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map((item) => extractNodeText(item)).join('')
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractNodeText(node.props.children)
  }

  return ''
}

type MarkdownPreProps = ComponentPropsWithoutRef<'pre'> & {
  'data-lang'?: string
  'data-filename'?: string
  'data-code-title'?: string
}

function MarkdownPre({
  children,
  'data-lang': dataLang,
  'data-filename': dataFilename,
}: MarkdownPreProps) {
  const language = dataLang || 'plaintext'
  const rawCode = extractNodeText(children)
  const lines = useHighlightedCode(rawCode, language)
  const headerTitle = dataFilename || language

  return (
    <CodeBlock size="sm" className="my-2 bg-background/80 dark:bg-background/60">
      <CodeBlockHeader>
        <CodeBlockTitle className="font-mono text-muted-foreground">
          {headerTitle}
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={rawCode} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent wrap className="max-h-80">
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  )
}

const MARKDOWN_COMPONENTS = {
  h1: ({ className, ...props }) => (
    <h1
      {...props}
      className={cn(
        'mt-3 mb-1.5 text-base font-bold tracking-tight first:mt-0',
        className,
      )}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      {...props}
      className={cn(
        'mt-3 mb-1.5 text-[15px] font-semibold tracking-tight first:mt-0',
        className,
      )}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      {...props}
      className={cn(
        'mt-2.5 mb-1 text-sm font-semibold first:mt-0',
        className,
      )}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      {...props}
      className={cn('mt-2 mb-1 text-sm font-medium first:mt-0', className)}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      {...props}
      className={cn(
        'mt-2 mb-1 text-xs font-semibold tracking-wide uppercase first:mt-0',
        className,
      )}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      {...props}
      className={cn(
        'mt-2 mb-1 text-xs font-medium text-muted-foreground first:mt-0',
        className,
      )}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      {...props}
      className={cn('my-1.5 leading-relaxed first:mt-0 last:mb-0', className)}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      {...props}
      className={cn(
        'my-1.5 list-disc space-y-1 pl-5 first:mt-0 last:mb-0',
        className,
      )}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      {...props}
      className={cn(
        'my-1.5 list-decimal space-y-1 pl-5 first:mt-0 last:mb-0',
        className,
      )}
    />
  ),
  li: ({ className, ...props }) => (
    <li
      {...props}
      className={cn('leading-relaxed [&>p]:my-0.5', className)}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      {...props}
      className={cn(
        'my-2 border-l-2 border-primary/40 pl-3 text-muted-foreground italic first:mt-0 last:mb-0',
        className,
      )}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr {...props} className={cn('my-3 border-border', className)} />
  ),
  strong: ({ className, ...props }) => (
    <strong
      {...props}
      className={cn('font-semibold text-foreground', className)}
    />
  ),
  em: ({ className, ...props }) => (
    <em {...props} className={cn('italic', className)} />
  ),
  del: ({ className, ...props }) => (
    <del {...props} className={cn('line-through opacity-75', className)} />
  ),
  code: ({ className, ...props }) => (
    <code
      {...props}
      className={cn(
        'rounded-md border border-border/70 bg-background/80 px-1.5 py-0.5 font-mono text-[0.82em] break-words text-foreground',
        className,
      )}
    />
  ),
  pre: MarkdownPre,
  a: ({ className, href, rel, target, ...props }) => {
    const isExternal =
      href?.startsWith('http://') || href?.startsWith('https://')
    return (
      <a
        {...props}
        href={href}
        target={isExternal ? '_blank' : target}
        rel={isExternal ? 'nofollow noopener noreferrer' : rel}
        className={cn(
          'font-medium text-primary underline underline-offset-4 hover:opacity-80',
          className,
        )}
      />
    )
  },
  table: ({ className, ...props }) => (
    <div className="my-2 w-full overflow-x-auto rounded-lg border border-border/80 bg-background/60">
      <table
        {...props}
        className={cn('w-full border-collapse text-left text-xs', className)}
      />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead
      {...props}
      className={cn('border-b border-border/80 bg-muted/60', className)}
    />
  ),
  tbody: ({ className, ...props }) => (
    <tbody
      {...props}
      className={cn('divide-y divide-border/60', className)}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      {...props}
      className={cn('transition-colors hover:bg-muted/30', className)}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      {...props}
      className={cn(
        'px-2.5 py-1.5 font-semibold whitespace-nowrap text-foreground',
        className,
      )}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      {...props}
      className={cn('px-2.5 py-1.5 align-top text-foreground/90', className)}
    />
  ),
  img: ({ className, ...props }) => (
    <img
      {...props}
      className={cn(
        'my-2 max-w-full rounded-lg border border-border/60',
        className,
      )}
    />
  ),
  figure: ({ className, ...props }) => (
    <figure {...props} className={cn('my-2', className)} />
  ),
  figcaption: ({ className, ...props }) => (
    <figcaption
      {...props}
      className={cn('mb-1 text-xs font-medium text-muted-foreground', className)}
    />
  ),
} satisfies MarkdownComponents

interface ChatMarkdownProps {
  content: string
  isStreaming?: boolean
  className?: string
}

/**
 * Renders assistant chat content as safe, stream-friendly Markdown using @tanstack/markdown.
 */
export function ChatMarkdown({
  content,
  isStreaming = false,
  className,
}: ChatMarkdownProps) {
  const document = useMemo(
    () =>
      parseMarkdown(content, {
        frontmatter: false,
        headingIds: false,
        extensions: isStreaming ? STREAMING_EXTENSIONS : undefined,
      }),
    [content, isStreaming],
  )

  return (
    <div
      className={cn('min-w-0 max-w-full text-sm break-words', className)}
    >
      <Markdown components={MARKDOWN_COMPONENTS}>{document}</Markdown>
    </div>
  )
}
