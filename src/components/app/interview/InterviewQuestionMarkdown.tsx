'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  markdown: string
  className?: string
}

/**
 * Renders interview question copy (may include GFM tables, lists, bold).
 */
export function InterviewQuestionMarkdown({ markdown, className = '' }: Props) {
  return (
    <div className={['interview-question-md text-[15px] font-medium leading-relaxed tracking-tight text-foreground md:text-base', className].filter(Boolean).join(' ')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h3>,
          h2: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h3>,
          h3: ({ children }) => <h4 className="mb-2 mt-3 text-sm font-semibold first:mt-0">{children}</h4>,
          table: ({ children }) => (
            <div className="my-4 w-full overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[16rem] border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-input/40">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
          th: ({ children }) => (
            <th className="border-r border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-r border-border px-3 py-2 text-foreground last:border-r-0">{children}</td>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className?.includes('language-'))
            if (isBlock) {
              return (
                <code className="my-2 block overflow-x-auto rounded-lg bg-input/30 p-3 text-xs font-mono" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code className="rounded bg-input/40 px-1 py-0.5 font-mono text-[0.9em]" {...props}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => <pre className="my-3 overflow-x-auto">{children}</pre>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
