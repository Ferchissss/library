"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, X, Check, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Quote } from "@/lib/types"
import { getQuoteCategoryColor } from "@/lib/colors"
import { BookOpen } from "lucide-react"
import { toast } from "sonner"
import { DeleteQuote } from "./DeleteQuote"

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
                <div className="space-y-2">
                  <textarea
                    ref={textRef}
                    value={editValues.text}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, text: e.target.value }))}
                    className="w-full p-1 border-2 border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-green-800  text-lg"
                    rows={3}
                    disabled={isSubmitting}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveField("text", editValues.text)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={isSubmitting || !editValues.text.trim()}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel("text")}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <blockquote
                  onClick={() => setIsEditingText(true)}
                  className="text-lg text-green-800 font-medium leading-relaxed italic border-l-4 border-green-300 pl-4 cursor-pointer hover:bg-green-50 p-2 rounded transition-colors"
                >
                  "{editValues.text}"
                </blockquote>
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
                      <Input
                        ref={categoryRef}
                        value={editValues.category}
                        onChange={(e) => setEditValues((prev) => ({ ...prev, category: e.target.value }))}
                        className="h-6 text-xs border-green-300 focus:border-green-500 focus:ring-green-400"
                        disabled={isSubmitting}
                      />
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
                      <Input
                        ref={typeRef}
                        value={editValues.type}
                        onChange={(e) => setEditValues((prev) => ({ ...prev, type: e.target.value }))}
                        className="h-6 text-xs border-green-300 focus:border-green-500 focus:ring-green-400"
                        disabled={isSubmitting}
                      />
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
          <div className="absolute bottom-1 right-1 flex gap-1 items-center z-50 bg-white/90 backdrop-blur-sm p-1 rounded-md border">
            <Input
              ref={pageRef}
              type="number"
              value={editValues.page}
              onChange={(e) => setEditValues((prev) => ({ ...prev, page: e.target.value }))}
              className="h-6 w-16 text-xs border-green-300 focus:border-green-500 focus:ring-green-400"
              disabled={isSubmitting}
              min="1"
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
          quote.page && (
            <div className="absolute bottom-1 right-2 cursor-pointer z-10" onClick={() => setIsEditingPage(true)}>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                Page {editValues.page}
              </span>
            </div>
          )
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