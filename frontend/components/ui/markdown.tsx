'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-xl font-serif font-semibold text-foreground mt-4 mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-serif font-semibold text-foreground mt-4 mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-serif font-semibold text-foreground mt-3 mb-1.5">{children}</h3>,
        h4: ({ children }) => <h4 className="text-sm font-serif font-semibold text-foreground mt-2 mb-1">{children}</h4>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80 break-all">{children}</a>,
        p: ({ children }) => <p className="text-sm text-foreground leading-relaxed mb-2 last:mb-0 overflow-hidden">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
        ul: ({ children }) => <ul className="list-disc list-outside ml-5 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-outside ml-5 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-sm text-foreground leading-relaxed">{children}</li>,
        hr: () => <hr className="border-border my-3" />,
        code: ({ children }) => <code className="bg-secondary/60 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
        blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/30 pl-3 italic text-muted-foreground my-2">{children}</blockquote>,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
