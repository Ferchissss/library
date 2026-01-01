"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, X, Check, Trash2, ChevronUp, ChevronDown, Save } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Quote } from "@/lib/types"
import { getQuoteCategoryColor } from "@/lib/colors"
import { BookOpen } from "lucide-react"
import { toast } from "sonner"
import { DeleteQuote } from "./DeleteQuote"
import { QuoteTipTapEditor } from "./QuoteTipTapEditor"
import { QuoteHtmlViewer } from "./QuoteHtmlViewer"
import { MultiSelect } from "../MultiSelect"

type EditQuoteProps = {
  quote: Quote
  onQuoteUpdated: (quote: Quote) => void
  onQuoteDeleted: (quoteId: number) => void
}

export function EditQuote({ quote, onQuoteUpdated, onQuoteDeleted }: EditQuoteProps) {
  const [isEditingText, setIsEditingText] = useState(false)
  const [isEditingType, setIsEditingType] = useState(false)
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [isEditingPage, setIsEditingPage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentEditorContent, setCurrentEditorContent] = useState(quote.text)
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([])  
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([])

  const [editValues, setEditValues] = useState({
    text: quote.text,
    type: quote.type || "",
    category: quote.category || "",
    page: quote.page?.toString() || "",
  })

  const textRef = useRef<HTMLTextAreaElement>(null)
  const typeRef = useRef<HTMLInputElement>(null)
  const categoryRef = useRef<HTMLInputElement>(null)
  const pageRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditingText) textRef.current?.focus()
  }, [isEditingText])

  useEffect(() => {
    if (isEditingType) typeRef.current?.focus()
  }, [isEditingType])

  useEffect(() => {
    if (isEditingCategory) categoryRef.current?.focus()
  }, [isEditingCategory])

  useEffect(() => {
    if (isEditingPage) pageRef.current?.focus()
  }, [isEditingPage])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/quotes')
        if (!response.ok) throw new Error('Error loading options')
        const data: Quote[] = await response.json()
        
        // Extraer tipos únicos
        const types = [...new Set(data
          .map((q) => q.type)
          .filter((type): type is string => Boolean(type && type.trim() !== ""))
        )].sort()
        
        // Extraer categorías únicas
        const categories = [...new Set(data
          .map((q) => q.category)
          .filter((category): category is string => Boolean(category && category.trim() !== ""))
        )].sort()
        
        setTypeOptions(types.map(type => ({ value: type, label: type })))
        setCategoryOptions(categories.map(category => ({ value: category, label: category })))
      } catch (error) {
        console.error("Error fetching options:", error)
      }
    }
    
    fetchOptions()
  }, [])

  //Determine whether the quote needs truncation
  const needsTruncation = editValues.text.length > 200 || editValues.text.split('\n').length > 3

  const handleSaveField = async (field: string, value: string) => {
    try {
      setIsSubmitting(true)

      const updateData: Record<string, any> = {
        text: field === "text" ? value : editValues.text,
        type: field === "type" ? value : editValues.type,
        category: field === "category" ? (value.trim() ? value : "Uncategorized") : editValues.category,
        page:
          field === "page"
            ? value
              ? Number.parseInt(value)
              : null
            : editValues.page
              ? Number.parseInt(editValues.page)
              : null,
        favorite: quote.favorite,
        book_id: null,
      }

      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Error updating")
      }

      const updatedQuote = await response.json()
      setEditValues({
        text: updatedQuote.text,
        type: updatedQuote.type || "",
        category: updatedQuote.category || "",
        page: updatedQuote.page?.toString() || "",
      })
      onQuoteUpdated(updatedQuote)

      // Close editing mode
      setIsEditingText(false)
      setIsEditingType(false)
      setIsEditingCategory(false)
      setIsEditingPage(false)

      toast.success("Successfully updated")
    } catch (error) {
      console.error("Error updating quote:", error)
      toast.error("Error updating")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFavorite = async () => {
    try {
      setIsSubmitting(true)

      const updateData = {
        text: editValues.text,
        type: editValues.type,
        category: editValues.category,
        page: editValues.page ? Number.parseInt(editValues.page) : null,
        favorite: !quote.favorite, // Change state
        book_id: null,
      }

      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Error updating favorite")
      }

      const updatedQuote = await response.json()
      onQuoteUpdated(updatedQuote)
      
      toast.success(updatedQuote.favorite ? "Added to favorites!" : "Removed from favorites")
    } catch (error) {
      console.error("Error updating favorite:", error)
      toast.error("Error updating favorite")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = (field: string) => {
    if (field === "text") {
      setEditValues((prev) => ({ ...prev, text: quote.text }))
      setIsEditingText(false)
    } else if (field === "type") {
      setEditValues((prev) => ({ ...prev, type: quote.type || "" }))
      setIsEditingType(false)
    } else if (field === "category") {
      setEditValues((prev) => ({ ...prev, category: quote.category || "" }))
      setIsEditingCategory(false)
    } else if (field === "page") {
      setEditValues((prev) => ({ ...prev, page: quote.page?.toString() || "" }))
      setIsEditingPage(false)
    }
  }

  const categoryColor = getQuoteCategoryColor(quote.category || "")

  return (
    <div className="group relative flex gap-2">
      <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 relative overflow-visible flex-1">
        <Button
          variant="ghost"
          size="sm"
          className={`absolute -top-1 right-2 z-10 h-7 w-7 p-0 transition-all ${
            quote.favorite 
              ? "text-red-500 hover:text-red-600 hover:bg-red-50" 
              : "text-gray-400 hover:text-red-500 hover:bg-red-50"
          }`}
          onClick={handleToggleFavorite}
          disabled={isSubmitting}
        >
          <Heart className={`h-4 w-4 ${quote.favorite ? "fill-red-500" : ""}`} />
        </Button>

        <CardContent className="p-1 overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-visible">
            <div className="lg:col-span-2">
              {isEditingText ? (
                <div className="space-y-3">
                  <QuoteTipTapEditor
                    initialContent={editValues.text}
                    onSave={(content) => setCurrentEditorContent(content)}
                    onCancel={() => handleCancel("text")}
                    isSubmitting={isSubmitting}
                  />
                  {/* Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleSaveField("text", currentEditorContent)} 
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        disabled={isSubmitting}
                      >
                        <Save className="h-4 w-4" />
                        Save changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCancel("text")}
                        className="border-green-200 text-green-700 hover:bg-green-50 flex items-center gap-2"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                </div>
              ) : (
                <div>
                  <blockquote
                    onClick={() => setIsEditingText(true)}
                    className={`cursor-pointer hover:bg-green-50 p-2 rounded transition-colors border-l-4 border-green-300 pl-4 ${
                      !isExpanded && needsTruncation ? 'line-clamp-3' : ''
                    }`}
                  >
                    <QuoteHtmlViewer
                      content={editValues.text} 
                      truncate={!isExpanded && needsTruncation}
                    />
                  </blockquote>
                  
                  {/* Expand/Collapse button – ONLY for long quotes */}
                  {needsTruncation && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent blockquote onClick from firing
                        setIsExpanded(!isExpanded)
                      }}
                      className="mt-1 ml-4 text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show more
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 overflow-visible">
              <div className="space-y-1 overflow-visible">
                <div className="flex items-center gap-2">
                  {quote.book?.title && <BookOpen className="h-4 w-4 text-green-600" />}
                  <span className="font-semibold text-green-700">{quote.book?.title || ""}</span>
                </div>
                {quote.book?.author && <p className="text-sm text-green-600">by {quote.book.author.name}</p>}

                {/* Container for category and type in the same line */}
                <div className="flex items-center gap-2">
                  {isEditingCategory ? (
                    <div className="flex gap-2 items-center relative z-50">
                      <div className="min-w-[120px]">
                        <MultiSelect
                          options={categoryOptions}
                          selected={editValues.category ? [editValues.category] : []}
                          onChange={(selected) => setEditValues((prev) => ({ ...prev, category: selected[0] || "" }))}
                          placeholder="Select category"
                          singleSelect
                          creatable
                          className="text-xs h-6"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSaveField("category", editValues.category)}
                        className="h-6 w-6 p-1 bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel("category")}
                        className="h-6 w-6 p-1 border-green-200 text-green-700 hover:bg-green-50"
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingCategory(true)}
                      className="cursor-pointer hover:scale-105 transition-transform"
                    >
                      {editValues.category && (
                        <Badge
                          variant="secondary"
                          className={`${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} border`}
                        >
                          {editValues.category}
                        </Badge>
                      )}
                    </div>
                  )}

                  {isEditingType ? (
                    <div className="flex gap-2 items-center relative z-50">
                      <div className="min-w-[120px]">
                        <MultiSelect
                          options={typeOptions}
                          selected={editValues.type ? [editValues.type] : []}
                          onChange={(selected) => setEditValues((prev) => ({ ...prev, type: selected[0] || "" }))}
                          placeholder="Select type"
                          singleSelect
                          creatable
                          className="text-xs h-6"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSaveField("type", editValues.type)}
                        className="h-6 w-6 p-1 bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel("type")}
                        className="h-6 w-6 p-1 border-green-200 text-green-700 hover:bg-green-50"
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-green-300 text-green-600 cursor-pointer hover:bg-green-50"
                      onClick={() => setIsEditingType(true)}
                    >
                      {editValues.type || "No type"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        {isEditingPage ? (
          <div className="absolute bottom-1 right-1 flex gap-1 items-center z-50 bg-white/90 backdrop-blur-sm p-1 rounded-md border shadow-sm">
            <Input
              ref={pageRef}
              type="number"
              value={editValues.page}
              onChange={(e) => setEditValues((prev) => ({ ...prev, page: e.target.value }))}
              className="h-6 w-16 text-xs border-green-300 focus:border-green-500 focus:ring-green-400"
              disabled={isSubmitting}
              min="1"
              placeholder="Page"
            />
            <Button
              size="sm"
              onClick={() => handleSaveField("page", editValues.page)}
              className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCancel("page")}
              className="h-6 w-6 p-0 border-green-200 text-green-700 hover:bg-green-50"
              disabled={isSubmitting}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="absolute bottom-1 right-2 cursor-pointer z-10">
            {/* IF exist page: it always show  */}
            {editValues.page ? (
              <div className="flex items-center">
                <span 
                  className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                  onClick={() => setIsEditingPage(true)}
                >
                  Page {editValues.page}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingPage(true)}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                >
                  Edit
                </Button>
              </div>
            ) : (
              /* if there isn't: buttom in hover*/
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingPage(true)}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm border"
              >
                + Add page
              </Button>
            )}
          </div>
        )}
      </Card>
       {/* Delete button outside the card */}
      <div className="w-0 opacity-0 group-hover:w-8 group-hover:opacity-100 transition-all duration-300 flex items-start pt-2">
        <DeleteQuote 
          quote={quote}
          onQuoteDeleted={onQuoteDeleted}
        />
      </div>
    </div>
  )
}