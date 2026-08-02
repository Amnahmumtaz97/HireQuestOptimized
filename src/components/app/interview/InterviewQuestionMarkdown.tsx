'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  markdown: string
  className?: string
  /** LeetCode-style problem statement typography */
  variant?: 'default' | 'coding'
}

/**
 * Renders interview question copy (may include GFM tables, lists, bold).
 */
export function InterviewQuestionMarkdown({
  markdown,
  className = '',
  variant = 'default',
}: Props) {
  const coding = variant === 'coding'

  return (
    <div
      className={[
        coding
          ? 'interview-question-md interview-question-md--coding text-[13.5px] font-normal leading-[1.65] tracking-[-0.01em] text-foreground md:text-[14px]'
          : 'interview-question-md text-[15px] font-medium leading-relaxed tracking-tight text-foreground md:text-base',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className={coding ? 'mb-3.5 last:mb-0 text-foreground/90' : 'mb-3 last:mb-0'}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul
              className={
                coding
                  ? 'mb-4 list-disc space-y-1.5 pl-5 marker:text-muted-foreground last:mb-0'
                  : 'mb-3 list-disc space-y-1 pl-5 last:mb-0'
              }
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={
                coding
                  ? 'mb-4 list-decimal space-y-1.5 pl-5 marker:text-muted-foreground last:mb-0'
                  : 'mb-3 list-decimal space-y-1 pl-5 last:mb-0'
              }
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-foreground/85">{children}</em>,
          h1: ({ children }) => (
            <h2
              className={
                coding
                  ? 'hq-coding-problem-title mb-4 border-b border-border/80 pb-3 text-[1.35rem] font-semibold tracking-tight text-foreground first:mt-0'
                  : 'mb-2 mt-4 text-base font-semibold first:mt-0'
              }
            >
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2
              className={
                coding
                  ? 'hq-coding-problem-title mb-4 border-b border-border/80 pb-3 text-[1.35rem] font-semibold tracking-tight text-foreground first:mt-0'
                  : 'mb-2 mt-4 text-base font-semibold first:mt-0'
              }
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={
                coding
                  ? 'mb-2 mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground first:mt-0'
                  : 'mb-2 mt-3 text-sm font-semibold first:mt-0'
              }
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4
              className={
                coding
                  ? 'mb-2 mt-5 text-sm font-semibold text-foreground first:mt-0'
                  : 'mb-2 mt-3 text-sm font-semibold first:mt-0'
              }
            >
              {children}
            </h4>
          ),
          hr: () => <hr className="my-5 border-border/70" />,
          blockquote: ({ children }) => (
            <blockquote
              className={
                coding
                  ? 'hq-coding-example my-4 rounded-lg border border-border/80 bg-input/25 px-3.5 py-3 text-[13px] text-foreground/90'
                  : 'my-3 border-l-2 border-border pl-3 text-muted-foreground'
              }
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-4 w-full overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[16rem] border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-input/40">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border last:border-0">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border-r border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-r border-border px-3 py-2 text-foreground last:border-r-0">
              {children}
            </td>
          ),
          code: ({ className: codeClass, children, ...props }) => {
            const isBlock = Boolean(codeClass?.includes('language-'))
            if (isBlock) {
              return (
                <code
                  className={
                    coding
                      ? 'hq-coding-codeblock my-0 block overflow-x-auto p-0 font-mono text-[12.5px] leading-relaxed'
                      : 'my-2 block overflow-x-auto rounded-lg bg-input/30 p-3 text-xs font-sans'
                  }
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code
                className={
                  coding
                    ? 'rounded-[0.3rem] bg-input/45 px-1.5 py-0.5 font-mono text-[0.86em] text-foreground'
                    : 'rounded bg-input/40 px-1 py-0.5 font-sans text-[0.9em]'
                }
                {...props}
              >
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre
              className={
                coding
                  ? 'hq-coding-example my-3 overflow-x-auto rounded-lg border border-border/70 bg-code p-3.5'
                  : 'my-3 overflow-x-auto'
              }
            >
              {children}
            </pre>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
