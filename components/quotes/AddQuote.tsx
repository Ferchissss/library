// components/AddQuoteDialog.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Heart, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Quote } from "@/lib/types"

type AddQuoteProps = {
  onQuoteAdded: (quote: Quote) => void
  existingCategories: string[]
}

export function AddQuote({ onQuoteAdded, existingCategories }: AddQuoteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newQuote, setNewQuote] = useState({
    text: "",
    source: "",
    page: "",
    category: "",
    type: "",
    isFavorite: false,
  })

  // States for Type combobox
  const [existingTypes, setExistingTypes] = useState<string[]>([])
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [filteredTypes, setFilteredTypes] = useState<string[]>([])
  const [showCreateTypeButton, setShowCreateTypeButton] = useState(false)
  const typeInputRef = useRef<HTMLInputElement>(null)

  // States for Category combobox
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [filteredCategories, setFilteredCategories] = useState<string[]>([])
  const [showCreateCategoryButton, setShowCreateCategoryButton] = useState(false)
  const categoryInputRef = useRef<HTMLInputElement>(null)

  // Load existing types when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExistingTypes()
    }
  }, [isOpen])

  // Filter types when text changes
  useEffect(() => {
    if (newQuote.type.trim() === "") {
      setFilteredTypes(existingTypes.slice(0, 10))
      setShowCreateTypeButton(false)
    } else {
      const searchTerm = newQuote.type.toLowerCase()
      const filtered = existingTypes.filter(type => 
        type.toLowerCase().includes(searchTerm)
      )
      setFilteredTypes(filtered.slice(0, 10))
      
      const exactMatch = existingTypes.some(type => 
        type.toLowerCase() === searchTerm
      )
      setShowCreateTypeButton(!exactMatch && newQuote.type.trim().length > 0)
    }
  }, [newQuote.type, existingTypes])

  // Filter categories when text changes
  useEffect(() => {
    if (newQuote.category.trim() === "") {
      setFilteredCategories(existingCategories.slice(0, 10))
      setShowCreateCategoryButton(false)
    } else {
      const searchTerm = newQuote.category.toLowerCase()
      const filtered = existingCategories.filter(category => 
        category.toLowerCase().includes(searchTerm)
      )
      setFilteredCategories(filtered.slice(0, 10))
      
      const exactMatch = existingCategories.some(category => 
        category.toLowerCase() === searchTerm
      )
      setShowCreateCategoryButton(!exactMatch && newQuote.category.trim().length > 0)
    }
  }, [newQuote.category, existingCategories])

  const fetchExistingTypes = async () => {
    try {
      const response = await fetch('/api/quotes')
      if (!response.ok) throw new Error('Error loading types')
      const data: Quote[] = await response.json()
      
      // Extract unique types from existing quotes
      const types = [...new Set(data
        .map((quote) => quote.type)
        .filter((type): type is string => Boolean(type && type.trim() !== ""))
      )].sort()
      
      setExistingTypes(types)
      setFilteredTypes(types.slice(0, 10))
    } catch (error) {
      console.error("Error fetching types:", error)
    }
  }

  // Handlers for Type
  const handleTypeInputChange = (value: string) => {
    setNewQuote(prev => ({ ...prev, type: value }))
    setShowTypeDropdown(true)
  }

  const handleTypeSelect = (type: string) => {
    setNewQuote(prev => ({ ...prev, type }))
    setShowTypeDropdown(false)
  }

  const handleCreateType = () => {
    setShowTypeDropdown(false)
  }

  const handleClearType = () => {
    setNewQuote(prev => ({ ...prev, type: "" }))
    setShowTypeDropdown(false)
  }

  // Handlers for Category
  const handleCategoryInputChange = (value: string) => {
    setNewQuote(prev => ({ ...prev, category: value }))
    setShowCategoryDropdown(true)
  }

  const handleCategorySelect = (category: string) => {
    setNewQuote(prev => ({ ...prev, category }))
    setShowCategoryDropdown(false)
  }

  const handleCreateCategory = () => {
    setShowCategoryDropdown(false)
  }

  const handleClearCategory = () => {
    setNewQuote(prev => ({ ...prev, category: "" }))
    setShowCategoryDropdown(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeInputRef.current && !typeInputRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false)
      }
      if (categoryInputRef.current && !categoryInputRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard handlers
  const handleTypeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (showCreateTypeButton && newQuote.type.trim().length > 0) {
        handleCreateType()
      } else if (filteredTypes.length > 0) {
        handleTypeSelect(filteredTypes[0])
      }
    }
  }

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (showCreateCategoryButton && newQuote.category.trim().length > 0) {
        handleCreateCategory()
      } else if (filteredCategories.length > 0) {
        handleCategorySelect(filteredCategories[0])
      }
    }
  }

  const normalizeCategory = (category: string) => {
    if (!category || !category.trim()) return ""
    const trimmed = category.trim()
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
  }

  const handleAddQuote = async () => {
    if (!newQuote.text.trim()) {
      toast.error("Please complete the quote text.")
      return
    }

    try {
      setIsSubmitting(true)

      // Process category
      let finalCategory = "Uncategorized"
      if (newQuote.category.trim()) {
        finalCategory = normalizeCategory(newQuote.category)
      }

      // Prepare data to send
      const quoteData = {
        text: newQuote.text.trim(),
        type: newQuote.type,
        category: finalCategory,
        page: newQuote.page ? Number.parseInt(newQuote.page) : null,
        favorite: newQuote.isFavorite,
        book_id: null
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      })

      if (!response.ok) {
        throw new Error('Error saving quote')
      }

      const savedQuote = await response.json()
      onQuoteAdded(savedQuote)

      // Reset form and close modal
      setNewQuote({
        text: "",
        source: "",
        page: "",
        category: "",
        type: "",
        isFavorite: false,
      })
      setIsOpen(false)

      toast.success(`Quote successfully added in category "${finalCategory}"!`)
    } catch (error) {
      console.error('Error adding quote:', error)
      toast.error('Error saving quote')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setNewQuote({
      text: "",
      source: "",
      page: "",
      category: "",
      type: "Book",
      isFavorite: false,
    })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-800">Add New Quote</DialogTitle>
          <DialogDescription className="text-green-600">
            Save a new memorable quote from books, movies, series or any source that inspires you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quote text */}
          <div className="space-y-2">
            <Label htmlFor="quote-text" className="text-sm font-medium text-green-700">
              Quote Text *
            </Label>
            <Textarea
              id="quote-text"
              value={newQuote.text}
              onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
              rows={4}
              className="border-green-200 focus:border-green-400 focus:ring-green-400 py-1"
            />
          </div>

          {/* Type, Category and Page */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type - Combobox */}
            <div className="space-y-2 relative" ref={typeInputRef}>
              <Label htmlFor="quote-type" className="text-sm font-medium text-green-700">
                Type
              </Label>
              <div className="relative">
                <Input
                  id="quote-type"
                  value={newQuote.type}
                  onChange={(e) => handleTypeInputChange(e.target.value)}
                  onFocus={() => setShowTypeDropdown(true)}
                  onKeyDown={handleTypeKeyDown}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400 py-2 h-7"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  {newQuote.type && (
                    <button
                      type="button"
                      onClick={handleClearType}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Type dropdown */}
              {showTypeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-green-200 shadow-lg rounded-md max-h-60 overflow-y-auto">
                  {filteredTypes.length > 0 ? (
                    filteredTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 hover:text-green-700 cursor-pointer transition-colors first:rounded-t-md last:rounded-b-md"
                        onClick={() => handleTypeSelect(type)}
                      >
                        {type}
                      </button>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No types found</div>
                  )}

                  {/* Button to create new type */}
                  {showCreateTypeButton && (
                    <div className="border-t border-green-100">
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer flex items-center gap-2 rounded-b-md"
                        onClick={handleCreateType}
                      >
                        <Plus className="h-3 w-3" />
                        Create type: "{newQuote.type}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category - Combobox */}
            <div className="space-y-2 relative" ref={categoryInputRef}>
              <Label htmlFor="quote-category" className="text-sm font-medium text-green-700">
                Category
              </Label>
              <div className="relative">
                <Input
                  id="quote-category"
                  value={newQuote.category}
                  onChange={(e) => handleCategoryInputChange(e.target.value)}
                  onFocus={() => setShowCategoryDropdown(true)}
                  onKeyDown={handleCategoryKeyDown}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400 py-2 h-7"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  {newQuote.category && (
                    <button
                      type="button"
                      onClick={handleClearCategory}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Category dropdown */}
              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-green-200 shadow-lg rounded-md max-h-60 overflow-y-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 hover:text-green-700 cursor-pointer transition-colors first:rounded-t-md last:rounded-b-md"
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category}
                      </button>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No categories found</div>
                  )}

                  {/* Button to create new category */}
                  {showCreateCategoryButton && (
                    <div className="border-t border-green-100">
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer flex items-center gap-2 rounded-b-md"
                        onClick={handleCreateCategory}
                      >
                        <Plus className="h-3 w-3" />
                        Create category: "{newQuote.category}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quote-page" className="text-sm font-medium text-green-700">
                Page
              </Label>
              <Input
                id="quote-page"
                value={newQuote.page}
                onChange={(e) => setNewQuote({ ...newQuote, page: e.target.value })}
                type="number"
                min="1"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 py-2 h-7"
              />
            </div>
          </div>

          {/* Favorite checkbox */}
          <Button
            type="button"
            variant={newQuote.isFavorite ? "default" : "outline"}
            onClick={() => setNewQuote({ ...newQuote, isFavorite: !newQuote.isFavorite })}
            className={`flex items-center gap-2 ${
              newQuote.isFavorite 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "border-green-300 text-green-700 hover:bg-green-50"
            }`}
          >
            <Heart className={`h-4 w-4 ${newQuote.isFavorite ? "fill-white" : ""}`} />
            {newQuote.isFavorite ? "Favorite" : "Mark as favorite"}
          </Button>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddQuote}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!newQuote.text.trim() || isSubmitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Quote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}