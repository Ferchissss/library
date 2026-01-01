"use client"

import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface HtmlViewerProps {
  content: string
  className?: string
  truncate?: boolean
  theme?: 'green' | 'purple'
  emptyMessage?: string
}

export function HtmlViewer({ 
  content, 
  className = "",
  truncate = false,
  theme = 'green',
  emptyMessage = "No content available"
}: HtmlViewerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Sanitize HTML
  const cleanHtml = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'mark',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre', 'span',
      'a', 'img'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'],
  })

  // Theme configuration
  const themeClasses = {
    green: `
      prose-green
      [&_h1]:text-green-800 [&_h2]:text-green-700 [&_h3]:text-green-600
      [&_p]:text-green-800 [&_li]:text-green-800
      [&_blockquote]:border-green-400 [&_blockquote]:bg-green-50/50 [&_blockquote]:text-green-700
      [&_strong]:text-green-900 [&_em]:text-green-700 [&_del]:text-green-500
      [&_code]:bg-green-100 [&_code]:text-green-900
      [&_pre]:bg-green-100 [&_pre]:text-green-900
      [&_a]:text-green-600
    `,
    purple: `
      prose-purple
      [&_h1]:text-purple-800 [&_h2]:text-purple-700 [&_h3]:text-purple-600
      [&_p]:text-purple-800 [&_li]:text-purple-800
      [&_blockquote]:border-purple-400 [&_blockquote]:bg-purple-50/50 [&_blockquote]:text-purple-700
      [&_strong]:text-purple-900 [&_em]:text-purple-700 [&_del]:text-purple-500
      [&_code]:bg-purple-100 [&_code]:text-purple-900
      [&_pre]:bg-purple-100 [&_pre]:text-purple-900
      [&_a]:text-purple-600
    `
  }

  // Base CSS classes
  const baseClasses = cn(
    "prose max-w-none",
    themeClasses[theme],
    "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-2",
    "[&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1",
    "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1",
    "[&_p]:my-2 [&_p]:leading-relaxed",
    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:space-y-1",
    "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ol]:space-y-1",
    "[&_li]:my-1",
    "[&_blockquote]:border-l-3 [&_blockquote]:pl-3 [&_blockquote]:my-2",
    "[&_blockquote]:py-1 [&_blockquote]:px-2 [&_blockquote]:rounded-r-md [&_blockquote]:italic",
    "[&_strong]:font-bold",
    "[&_em]:italic",
    "[&_del]:line-through",
    "[&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono",
    "[&_pre]:rounded [&_pre]:p-2 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:text-sm",
    "[&_a]:hover:underline",
    truncate && "line-clamp-3",
    className
  )

  // If no content
  if (!cleanHtml || cleanHtml.trim() === '<p></p>') {
    return (
      <div className={cn(baseClasses, "italic text-sm opacity-70")}>
        {emptyMessage}
      </div>
    )
  }

  // For SSR, show simplified content first
  if (!isMounted) {
    return (
      <div className={baseClasses}>
        <div className="opacity-70">
          {content.replace(/<[^>]*>/g, ' ').substring(0, 150)}
          {content.length > 150 ? '...' : ''}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={baseClasses}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}