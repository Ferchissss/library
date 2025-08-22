// components/MarkdownEditor.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Eye, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarkdownViewer } from "@/components/MarkdownViewer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [activeTab, setActiveTab] = useState("edit")

  // Función para manejar atajos de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Atajo para negrita: Ctrl/Cmd + B
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      wrapSelection("**", "**")
    }
    // Atajo para cursiva: Ctrl/Cmd + I
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault()
      wrapSelection("*", "*")
    }
    // Atajo para tachado: Ctrl/Cmd + Shift + X
    else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'X') {
      e.preventDefault()
      wrapSelection("~~", "~~")
    }
    // Atajo para cita: Ctrl/Cmd + Shift + >
    else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '.') {
      e.preventDefault()
      wrapSelection("> ", "")
    }
  }

  const wrapSelection = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return

    const { selectionStart, selectionEnd } = textareaRef.current
    const text = value
    const before = text.substring(0, selectionStart)
    const selected = text.substring(selectionStart, selectionEnd)
    const after = text.substring(selectionEnd)

    if (selectionStart !== selectionEnd) {
      onChange(`${before}${prefix}${selected}${suffix}${after}`)
    } else {
      onChange(`${before}${prefix}${suffix}${after}`)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = selectionStart + prefix.length
          textareaRef.current.selectionEnd = selectionStart + prefix.length
        }
      }, 0)
    }

    textareaRef.current.focus()
  }

  const addHeading = (level: number) => {
    const prefix = `${"#".repeat(level)} `
    wrapSelection(prefix)
  }

  const addList = (ordered: boolean) => {
    const prefix = ordered ? "1. " : "- "
    wrapSelection(prefix)
  }

  return (
    <div className={`border rounded-lg ${isFocused ? "border-purple-400 ring-1 ring-purple-200" : "border-gray-300"}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 rounded-t-lg">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addHeading(1)}
          className="h-8 w-8 p-0 text-gray-600 hover:text-purple-700"
          title="Título 1 (Ctrl+Alt+1)"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addHeading(2)}
          className="h-8 w-8 p-0 text-gray-600 hover:text-purple-700"
          title="Título 2 (Ctrl+Alt+2)"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addHeading(3)}
          className="h-8 w-8 p-0 text-gray-600 hover:text-purple-700"
          title="Título 3 (Ctrl+Alt+3)"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => wrapSelection("**", "**")}
          className="h-8 w-8 p-0 text-gray-600 hover:text-purple-700"
          title="Negrita (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => wrapSelection("*", "*")}
          className="h-8 w-8 p-0 text-gray-600 hover:text-purple-700"
          title="Cursiva (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => wrapSelection("~~", "~~")}
          className="h-8 w-8 p-0 text-gray-600 hover:text-purple-700"
          title="Tachado (Ctrl+Shift+X)"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addList(false)}
          className="h-8 w-8 p-0 text-gray-600 hover:text-purple-700"
          title="Lista no ordenada"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addList(true)}
          className="h-8 w-8 p-0 text-gray-600 hover:text-purple-700"
          title="Lista ordenada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => wrapSelection("> ", "")}
          className="h-8 w-8 p-0 text-gray-600 hover:text-purple-700"
          title="Cita (Ctrl+Shift+>)"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor y Preview con pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-50">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> Editar
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> Vista previa
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="p-0">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-3 min-h-[150px] focus:outline-none resize-y rounded-b-lg"
          />
        </TabsContent>
        <TabsContent value="preview" className="p-3 min-h-[150px]">
          {value ? (
            <MarkdownViewer content={value} />
          ) : (
            <p className="text-gray-400 italic">Escribe algo para ver la vista previa...</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}