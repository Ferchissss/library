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
  Save, 
  X, 
  Heading1,
  Heading2,
  Heading3,
  Type,
  Strikethrough,
  Code,
  Pilcrow
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuoteTipTapEditorProps {
  initialContent: string
  onSave: (htmlContent: string) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function QuoteTipTapEditor({ 
  initialContent, 
  onSave, 
  onCancel,
  isSubmitting = false 
}: QuoteTipTapEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Client-side only
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
            class: 'border-l-3 border-green-400 pl-3 my-2 py-1 px-2 bg-green-50/50 text-green-700 rounded-r-md italic' 
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-green-100 rounded px-1 py-0.5 text-sm font-mono text-green-900',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-green-100 rounded p-2 my-2 overflow-x-auto text-sm text-green-900',
          },
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your quote here...',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'max-w-none focus:outline-none min-h-[120px] p-3 text-green-800 [&_*]:text-green-800',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length)
      setCharCount(text.length)
    },
    immediatelyRender: false,
  })

  // Add CSS styles for headings
  useEffect(() => {
    if (!editor || !isMounted) return;

    // Inject styles for headings
    const style = document.createElement('style');
    style.textContent = `
      .tiptap h1 {
        font-size: 1.875rem !important;
        font-weight: 700 !important;
        line-height: 2.25rem !important;
        color: #065f46 !important;
        margin-top: 1rem !important;
        margin-bottom: 0.75rem !important;
      }
      
      .tiptap h2 {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        line-height: 2rem !important;
        color: #059669 !important;
        margin-top: 0.875rem !important;
        margin-bottom: 0.625rem !important;
      }
      
      .tiptap h3 {
        font-size: 1.25rem !important;
        font-weight: 600 !important;
        line-height: 1.75rem !important;
        color: #10b981 !important;
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

  const handleSave = () => {
    if (editor) {
      const html = editor.getHTML()
      onSave(html)
    }
  }

  // If not on client, show placeholder
  if (!isMounted) {
    return (
      <div className="space-y-3">
        <div className="h-10 bg-green-100 rounded animate-pulse"></div>
        <div className="h-32 bg-green-50 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-green-600 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-green-100 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!editor) {
    return <div className="p-4 text-center text-green-600">Loading editor...</div>
  }

  return (
    <div className="space-y-3">
      {/* Complete toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border border-green-200 bg-green-50/50 rounded-lg">
        {/* Text formatting */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('bold') 
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
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
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
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
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
            }`}
            title="Strikethrough (Ctrl+Shift+X)"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-green-200 mx-1"></div>

        {/* Headings */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('heading', { level: 1 }) 
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
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
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
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
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
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
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
            }`}
            title="Normal paragraph"
          >
            <Pilcrow className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-green-200 mx-1"></div>

        {/* Lists */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('bulletList') 
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
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
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
            }`}
            title="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-green-200 mx-1"></div>

        {/* Special blocks */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              editor.isActive('blockquote') 
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
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
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
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
                ? 'bg-green-600 text-white' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
            }`}
            title="Code block"
          >
            <Type className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-green-200 mx-1"></div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-colors ${
              !editor.can().undo() 
                ? 'text-green-300 cursor-not-allowed' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
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
                ? 'text-green-300 cursor-not-allowed' 
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
            }`}
            title="Redo (Ctrl+Shift+Z)"
            disabled={!editor.can().redo()}
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="border border-green-200 rounded-lg overflow-hidden">
        <EditorContent 
          editor={editor}
          className="min-h-[150px] max-h-[300px] overflow-y-auto p-3 tiptap"
        />
      </div>

      {/* Counters and help */}
      <div className="flex justify-between items-center text-sm text-green-600">
        <div className="flex gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex gap-2 text-xs">
          <kbd className="px-1.5 py-0.5 bg-green-100 rounded">Ctrl+B</kbd>
          <kbd className="px-1.5 py-0.5 bg-green-100 rounded">Ctrl+I</kbd>
          <kbd className="px-1.5 py-0.5 bg-green-100 rounded">Ctrl+Z</kbd>
          <kbd className="px-1.5 py-0.5 bg-green-100 rounded">Ctrl+Enter</kbd>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          disabled={isSubmitting || !editor.getText().trim()}
        >
          <Save className="h-4 w-4" />
          Save changes
        </Button>
        
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-green-200 text-green-700 hover:bg-green-50 flex items-center gap-2"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  )
}