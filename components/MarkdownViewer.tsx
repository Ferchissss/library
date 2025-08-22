// components/MarkdownViewer.tsx
"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownViewerProps {
  content: string
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="prose prose-purple max-w-none dark:prose-invert">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Personalización de los componentes de Markdown
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold text-purple-800 mt-6 mb-4 border-b border-purple-200 pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold text-purple-700 mt-5 mb-3 border-b border-purple-100 pb-1" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold text-purple-600 mt-4 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-gray-700 dark:text-gray-300 my-3 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 my-3 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 my-3 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="my-1 text-gray-700 dark:text-gray-300" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote 
                className="border-l-4 border-purple-500 pl-4 my-4 py-2 px-3
                        bg-purple-50 dark:bg-purple-50
                        text-black dark:text-black
                        rounded-r-lg"
                {...props} 
            />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-purple-700 dark:text-purple-300" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-purple-600 dark:text-purple-200" {...props} />
          ),
          del: ({ node, ...props }) => (
            <del className="line-through text-gray-500" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="bg-gray-100 dark:bg-gray-800 rounded p-3 my-3 overflow-x-auto text-sm" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}