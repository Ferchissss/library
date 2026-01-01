"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  RotateCcw, 
  RotateCw, 
  Heading1,
  Heading2,
  Heading3,
  Type,
  Strikethrough,
  Code,
  Pilcrow
} from 'lucide-react'

export interface TipTapEditorProps {
  initialContent: string
  onSave: (htmlContent: string) => void
  onCancel?: () => void
  isSubmitting?: boolean
  theme?: 'green' | 'purple' | 'blue'
  height?: 'sm' | 'md' | 'lg'
  showCounters?: boolean
  placeholder?: string
}

export function TipTapEditor({ 
  initialContent, 
  onSave, 
  onCancel,
  isSubmitting = false,
  theme = 'green',
  height = 'md',
  showCounters = true,
  placeholder = 'Write your content here...'
}: TipTapEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Client-side only
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Theme configuration
  const themeConfig = {
    green: {
      primary: 'green',
      border: 'green-200',
      toolbarBg: 'green-50/50',
      buttonActive: 'bg-green-600 text-white',
      buttonInactive: 'text-green-600 hover:text-green-800 hover:bg-green-100',
      buttonDisabled: 'text-green-300',
      counterText: 'text-green-600',
      counterBg: 'bg-green-100',
      placeholder: 'text-green-800'
    },
    purple: {
      primary: 'purple',
      border: 'purple-200',
      toolbarBg: 'purple-50/50',
      buttonActive: 'bg-purple-600 text-white',
      buttonInactive: 'text-purple-600 hover:text-purple-800 hover:bg-purple-100',
      buttonDisabled: 'text-purple-300',
      counterText: 'text-purple-600',
      counterBg: 'bg-purple-100',
      placeholder: 'text-purple-800'
    },
    blue: {
      primary: 'blue',
      border: 'blue-200',
      toolbarBg: 'blue-50/50',
      buttonActive: 'bg-blue-600 text-white',
      buttonInactive: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100',
      buttonDisabled: 'text-blue-300',
      counterText: 'text-blue-600',
      counterBg: 'bg-blue-100',
      placeholder: 'text-blue-800'
    }
  }

  const currentTheme = themeConfig[theme]

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { 
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'my-3',
          },
        },
        bulletList: {
          HTMLAttributes: { class: 'list-disc pl-4 my-2' },
        },
        orderedList: {
          HTMLAttributes: { class: 'list-decimal pl-4 my-2' },
        },
        blockquote: {
          HTMLAttributes: { 
            class: `border-l-3 border-${currentTheme.primary}-400 pl-3 my-2 py-1 px-2 bg-${currentTheme.primary}-50/50 text-${currentTheme.primary}-700 rounded-r-md italic` 
          },
        },
        code: {
          HTMLAttributes: {
            class: `bg-${currentTheme.primary}-100 rounded px-1 py-0.5 text-sm font-mono text-${currentTheme.primary}-900`,
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: `bg-${currentTheme.primary}-100 rounded p-2 my-2 overflow-x-auto text-sm text-${currentTheme.primary}-900`,
          },
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: `max-w-none focus:outline-none min-h-[120px] p-3 text-${currentTheme.placeholder} [&_*]:text-${currentTheme.placeholder}`,
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length)
      setCharCount(text.length)

      if (onSave) {
        const html = editor.getHTML()
        onSave(html)
      }
    },
    immediatelyRender: false,
  })

  // Add CSS styles for headings
  useEffect(() => {
    if (!editor || !isMounted) return;

    const style = document.createElement('style');
    style.textContent = `
      .tiptap h1 {
        font-size: 1.875rem !important;
        font-weight: 700 !important;
        line-height: 2.25rem !important;
        margin-top: 1rem !important;
        margin-bottom: 0.75rem !important;
      }
      
      .tiptap h2 {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        line-height: 2rem !important;
        margin-top: 0.875rem !important;
        margin-bottom: 0.625rem !important;
      }
      
      .tiptap h3 {
        font-size: 1.25rem !important;
        font-weight: 600 !important;
        line-height: 1.75rem !important;
        margin-top: 0.75rem !important;
        margin-bottom: 0.5rem !important;
      }
      
      .tiptap p {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
        line-height: 1.625 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [editor, isMounted]);

  // If not on client, show placeholder
  if (!isMounted) {
    return (
      <div className="space-y-3">
        <div className={`h-10 bg-${currentTheme.primary}-100 rounded animate-pulse`}></div>
        <div className={`h-32 bg-${currentTheme.primary}-50 rounded animate-pulse`}></div>
        <div className="flex gap-2">
          <div className={`h-10 w-24 bg-${currentTheme.primary}-600 rounded animate-pulse`}></div>
          <div className={`h-10 w-24 bg-${currentTheme.primary}-100 rounded animate-pulse`}></div>
        </div>
      </div>
    )
  }

  if (!editor) {
    return <div className={`p-4 text-center text-${currentTheme.primary}-600`}>Loading editor...</div>
  }

  const heightClasses = {
    sm: 'min-h-[100px] max-h-[200px]',
    md: 'min-h-[150px] max-h-[300px]',
    lg: 'min-h-[200px] max-h-[400px]'
  }

  return (
    <div className="space-y-3">
      {/* Complete toolbar */}
      <div className={`flex flex-wrap items-center gap-1 p-2 border border-${currentTheme.border} bg-${currentTheme.toolbarBg} rounded-lg`}>
        {/* Text formatting */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('bold') 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('italic') 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('strike') 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Strikethrough (Ctrl+Shift+X)"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
        </div>

        <div className={`w-px h-6 bg-${currentTheme.border} mx-1`}></div>

        {/* Headings */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('heading', { level: 1 }) 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('heading', { level: 2 }) 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('heading', { level: 3 }) 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('paragraph') 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Normal paragraph"
          >
            <Pilcrow className="h-4 w-4" />
          </button>
        </div>

        <div className={`w-px h-6 bg-${currentTheme.border} mx-1`}></div>

        {/* Lists */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('bulletList') 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Bulleted list"
          >
            <List className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('orderedList') 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>

        <div className={`w-px h-6 bg-${currentTheme.border} mx-1`}></div>

        {/* Special blocks */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('blockquote') 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('code') 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Inline code"
          >
            <Code className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('codeBlock') 
                ? currentTheme.buttonActive
                : currentTheme.buttonInactive
            }`}
            title="Code block"
          >
            <Type className="h-4 w-4" />
          </button>
        </div>

        <div className={`w-px h-6 bg-${currentTheme.border} mx-1`}></div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              !editor.can().undo() 
                ? currentTheme.buttonDisabled + ' cursor-not-allowed'
                : currentTheme.buttonInactive
            }`}
            title="Undo (Ctrl+Z)"
            disabled={!editor.can().undo()}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              !editor.can().redo() 
                ? currentTheme.buttonDisabled + ' cursor-not-allowed'
                : currentTheme.buttonInactive
            }`}
            title="Redo (Ctrl+Shift+Z)"
            disabled={!editor.can().redo()}
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className={`border border-${currentTheme.border} rounded-lg overflow-hidden`}>
        <EditorContent 
          editor={editor}
          className={`overflow-y-auto p-3 tiptap ${heightClasses[height]}`}
        />
      </div>

      {/* Counters and help */}
      {showCounters && (
        <div className={`flex justify-between items-center text-sm ${currentTheme.counterText}`}>
          <div className="flex gap-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
          <div className="flex gap-2 text-xs">
            <kbd className={`px-1.5 py-0.5 ${currentTheme.counterBg} rounded`}>Ctrl+B</kbd>
            <kbd className={`px-1.5 py-0.5 ${currentTheme.counterBg} rounded`}>Ctrl+I</kbd>
            <kbd className={`px-1.5 py-0.5 ${currentTheme.counterBg} rounded`}>Ctrl+Z</kbd>
            <kbd className={`px-1.5 py-0.5 ${currentTheme.counterBg} rounded`}>Ctrl+Enter</kbd>
          </div>
        </div>
      )}
    </div>
  )
}