"use client"

import { useState, useEffect, useRef } from "react"
import { Heart, Plus, Search, X, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
   DialogTrigger
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Quote } from "@/lib/types"
import { toast } from "sonner"

type EditQuoteProps = {
  quote: Quote
  onQuoteUpdated: (quote: Quote) => void
  existingCategories: string[]
}

export function EditQuote({ quote, onQuoteUpdated, existingCategories }: EditQuoteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editedQuote, setEditedQuote] = useState({
    text: quote.text,
    source: "",
    page: quote.page?.toString() || "",
    category: quote.category || "",
    type: quote.type || "",
    isFavorite: quote.favorite || false,
  })

  // Estados para el combobox de Tipo
  const [existingTypes, setExistingTypes] = useState<string[]>([])
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [filteredTypes, setFilteredTypes] = useState<string[]>([])
  const [showCreateTypeButton, setShowCreateTypeButton] = useState(false)
  const typeInputRef = useRef<HTMLInputElement>(null)

  // Estados para el combobox de Categoría
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [filteredCategories, setFilteredCategories] = useState<string[]>([])
  const [showCreateCategoryButton, setShowCreateCategoryButton] = useState(false)
  const categoryInputRef = useRef<HTMLInputElement>(null)

  // Cargar tipos existentes cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchExistingTypes()
      // Resetear el formulario con los datos actuales de la cita
      setEditedQuote({
        text: quote.text,
        source: "",
        page: quote.page?.toString() || "",
        category: quote.category || "",
        type: quote.type || "",
        isFavorite: quote.favorite || false,
      })
    }
  }, [isOpen, quote])

  // Filtrar tipos cuando cambia el texto
  useEffect(() => {
    if (editedQuote.type.trim() === "") {
      setFilteredTypes(existingTypes.slice(0, 10))
      setShowCreateTypeButton(false)
    } else {
      const searchTerm = editedQuote.type.toLowerCase()
      const filtered = existingTypes.filter(type => 
        type.toLowerCase().includes(searchTerm)
      )
      setFilteredTypes(filtered.slice(0, 10))
      
      const exactMatch = existingTypes.some(type => 
        type.toLowerCase() === searchTerm
      )
      setShowCreateTypeButton(!exactMatch && editedQuote.type.trim().length > 0)
    }
  }, [editedQuote.type, existingTypes])

  // Filtrar categorías cuando cambia el texto
  useEffect(() => {
    if (editedQuote.category.trim() === "") {
      setFilteredCategories(existingCategories.slice(0, 10))
      setShowCreateCategoryButton(false)
    } else {
      const searchTerm = editedQuote.category.toLowerCase()
      const filtered = existingCategories.filter(category => 
        category.toLowerCase().includes(searchTerm)
      )
      setFilteredCategories(filtered.slice(0, 10))
      
      const exactMatch = existingCategories.some(category => 
        category.toLowerCase() === searchTerm
      )
      setShowCreateCategoryButton(!exactMatch && editedQuote.category.trim().length > 0)
    }
  }, [editedQuote.category, existingCategories])

  const fetchExistingTypes = async () => {
    try {
      const response = await fetch('/api/quotes')
      if (!response.ok) throw new Error('Error al cargar tipos')
      const data = await response.json()
      
      const types = [...new Set(data
        .map((quote: Quote) => quote.type)
        .filter((type: string | undefined) => type && type.trim() !== "")
      )].sort()
      
      setExistingTypes(types)
      setFilteredTypes(types.slice(0, 10))
    } catch (error) {
      console.error("Error fetching types:", error)
    }
  }

  // Handlers para Tipo
  const handleTypeInputChange = (value: string) => {
    setEditedQuote(prev => ({ ...prev, type: value }))
    setShowTypeDropdown(true)
  }

  const handleTypeSelect = (type: string) => {
    setEditedQuote(prev => ({ ...prev, type }))
    setShowTypeDropdown(false)
  }

  const handleCreateType = () => {
    setShowTypeDropdown(false)
  }

  const handleClearType = () => {
    setEditedQuote(prev => ({ ...prev, type: "" }))
    setShowTypeDropdown(false)
  }

  // Handlers para Categoría
  const handleCategoryInputChange = (value: string) => {
    setEditedQuote(prev => ({ ...prev, category: value }))
    setShowCategoryDropdown(true)
  }

  const handleCategorySelect = (category: string) => {
    setEditedQuote(prev => ({ ...prev, category }))
    setShowCategoryDropdown(false)
  }

  const handleCreateCategory = () => {
    setShowCategoryDropdown(false)
  }

  const handleClearCategory = () => {
    setEditedQuote(prev => ({ ...prev, category: "" }))
    setShowCategoryDropdown(false)
  }

  // Close dropdowns cuando se hace click fuera
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

  const normalizeCategory = (category: string) => {
    if (!category || !category.trim()) return ""
    const trimmed = category.trim()
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
  }

  const handleUpdateQuote = async () => {
    if (!editedQuote.text.trim()) {
      toast.error("Por favor, completa el texto de la cita.")
      return
    }

    try {
      setIsSubmitting(true)

      let finalCategory = "Sin categoría"
      if (editedQuote.category.trim()) {
        finalCategory = normalizeCategory(editedQuote.category)
      }

      const quoteData = {
        text: editedQuote.text.trim(),
        type: editedQuote.type,
        category: finalCategory,
        page: editedQuote.page ? Number.parseInt(editedQuote.page) : null,
        favorite: editedQuote.isFavorite,
        book_id: null
      }

      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar la cita')
      }

      const updatedQuote = await response.json()
      onQuoteUpdated(updatedQuote)
      setIsOpen(false)

      toast.success(`¡Cita actualizada exitosamente!`)
    } catch (error) {
      console.error('Error updating quote:', error)
      toast.error('Error al actualizar la cita')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setEditedQuote({
      text: quote.text,
      source: "",
      page: quote.page?.toString() || "",
      category: quote.category || "",
      type: quote.type || "",
      isFavorite: quote.favorite || false,
    })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-800">Editar Cita</DialogTitle>
          <DialogDescription className="text-green-600">
            Modifica los detalles de esta cita memorable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Texto de la cita */}
          <div className="space-y-2">
            <Label htmlFor="edit-quote-text" className="text-sm font-medium text-green-700">
              Texto de la cita *
            </Label>
            <Textarea
              id="edit-quote-text"
              value={editedQuote.text}
              onChange={(e) => setEditedQuote({ ...editedQuote, text: e.target.value })}
              rows={4}
              className="border-green-200 focus:border-green-400 focus:ring-green-400 py-1"
            />
          </div>

          {/* Tipo, Categoría y Página */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo - Combobox */}
            <div className="space-y-2 relative" ref={typeInputRef}>
              <Label htmlFor="edit-quote-type" className="text-sm font-medium text-green-700">
                Tipo
              </Label>
              <div className="relative">
                <Input
                  id="edit-quote-type"
                  value={editedQuote.type}
                  onChange={(e) => handleTypeInputChange(e.target.value)}
                  onFocus={() => setShowTypeDropdown(true)}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400 py-2 h-7"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  {editedQuote.type && (
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
                    <div className="p-2 text-sm text-gray-500">No se encontraron tipos</div>
                  )}

                  {showCreateTypeButton && (
                    <div className="border-t border-green-100">
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer flex items-center gap-2 rounded-b-md"
                        onClick={handleCreateType}
                      >
                        <Plus className="h-3 w-3" />
                        Crear tipo: "{editedQuote.type}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Categoría - Combobox */}
            <div className="space-y-2 relative" ref={categoryInputRef}>
              <Label htmlFor="edit-quote-category" className="text-sm font-medium text-green-700">
                Categoría
              </Label>
              <div className="relative">
                <Input
                  id="edit-quote-category"
                  value={editedQuote.category}
                  onChange={(e) => handleCategoryInputChange(e.target.value)}
                  onFocus={() => setShowCategoryDropdown(true)}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400 py-2 h-7"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  {editedQuote.category && (
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
                    <div className="p-2 text-sm text-gray-500">No se encontraron categorías</div>
                  )}

                  {showCreateCategoryButton && (
                    <div className="border-t border-green-100">
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer flex items-center gap-2 rounded-b-md"
                        onClick={handleCreateCategory}
                      >
                        <Plus className="h-3 w-3" />
                        Crear categoría: "{editedQuote.category}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-quote-page" className="text-sm font-medium text-green-700">
                Página
              </Label>
              <Input
                id="edit-quote-page"
                value={editedQuote.page}
                onChange={(e) => setEditedQuote({ ...editedQuote, page: e.target.value })}
                type="number"
                min="1"
                className="border-green-200 focus:border-green-400 focus:ring-green-400 py-2 h-7"
              />
            </div>
          </div>

          {/* Checkbox para favorito */}
          <Button
            type="button"
            variant={editedQuote.isFavorite ? "default" : "outline"}
            onClick={() => setEditedQuote({ ...editedQuote, isFavorite: !editedQuote.isFavorite })}
            className={`flex items-center gap-2 ${
              editedQuote.isFavorite 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "border-green-300 text-green-700 hover:bg-green-50"
            }`}
          >
            <Heart className={`h-4 w-4 ${editedQuote.isFavorite ? "fill-white" : ""}`} />
            {editedQuote.isFavorite ? "Favorita" : "Marcar como favorita"}
          </Button>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateQuote}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!editedQuote.text.trim() || isSubmitting}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isSubmitting ? "Actualizando..." : "Actualizar Cita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}