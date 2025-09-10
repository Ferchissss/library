"use client"
import React, { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelect } from "@/components/MultiSelect"
import { supabase } from '@/lib/supabaseClient'
import { toast } from "sonner"
import type { Book } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { AVAILABLE_COLORS, getConsistentColorIndex } from "@/lib/colors";

interface EditableCellProps {
  book: Book
  columnId: string
  value: any
  options: { value: string; label: string; id?: number }[]
  onSave: (newValue?: any) => void
  onCancel: () => void
  refreshOptions?: () => Promise<void>
}

const availableColors = AVAILABLE_COLORS;

// Función para obtener estilos de color consistentes
const getBadgeStyle = (value: string, columnId: string) => {
  if (!value) {
    return {
      backgroundColor: availableColors[0].bg,
      borderColor: availableColors[0].border.replace('border-', '#'),
      color: availableColors[0].text.replace('text-', '#')
    };
  }
  
  const colorIndex = getConsistentColorIndex(value, columnId, availableColors.length);
  const colorClass = availableColors[colorIndex];
  return {
    backgroundColor: colorClass.bg,
    borderColor: colorClass.border.replace('border-', '#'),
    color: colorClass.text.replace('text-', '#')
  };
};

export const EditableCell: React.FC<EditableCellProps> = ({
  book,
  columnId,
  value,
  options,
  onSave,
  onCancel,
  refreshOptions
}) => {
  const [editValue, setEditValue] = useState<any>(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const multiSelectRef = useRef<any>(null)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  useEffect(() => {
    if (inputRef.current && !["dateStarted", "dateRead", "genre", "review", "image_url"].includes(columnId)) {
      inputRef.current.focus()
    }
    if (textareaRef.current && columnId === "review") {
      textareaRef.current.focus()
    }
    if (multiSelectRef.current && ["genre", "type", "publisher", "language", "era", "format", "audience", "readingDensity", "author", "universe"].includes(columnId)) {
      multiSelectRef.current.focus()
    }
  }, [columnId])

  const handleSave = async (newValue?: any, isNewItem: boolean = false) => {
    const valueToSave = newValue !== undefined ? newValue : editValue
    
    try {
      const fieldMap: Record<string, string> = {
        title: "title",
        rating: "rating",
        pages: "pages",
        awards: "awards",
        type: "type",
        publisher: "publisher",
        language: "language",
        era: "era",
        format: "format",
        audience: "audience",
        readingDensity: "reading_difficulty",
        favorite: "favorite",
        dateStarted: "start_date",
        dateRead: "end_date",
        year: "year",
        author: "author_id",
        universe: "series_id",
        genre: "genre",
        review: "review",
        image_url: "image_url",
        summary: "summary",
        main_characters: "main_characters", 
        favorite_character: "favorite_character",
      }

      const dbField = fieldMap[columnId]
      if (!dbField) return

      let dbValue = valueToSave

      // Convertir nombres a IDs para campos relacionales
      if (columnId === "author" || columnId === "universe") {
        if (valueToSave) {
          // Si es un nuevo item, refrescar opciones primero
          if (isNewItem && refreshOptions) {
            await refreshOptions()
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          
          const option = options.find(opt => opt.value === valueToSave)
          if (option && option.id) {
            dbValue = option.id
          } else {
            const parsedId = parseInt(valueToSave)
            if (!isNaN(parsedId)) {
              dbValue = parsedId
            } else {
              const tableName = getTableName(columnId)
              if (tableName) {
                const { data, error } = await supabase
                  .from(tableName)
                  .select("id")
                  .eq("name", valueToSave)
                  .single()
                
                if (!error && data) {
                  dbValue = data.id
                } else {
                  dbValue = null
                  toast.error(`No se pudo encontrar el ${columnId} "${valueToSave}"`)
                }
              }
            }
          }
        } else {
          dbValue = null
        }
      }

      // Manejo especial para géneros - ahora recibimos IDs directamente del MultiSelect
      if (columnId === "genre") {
        if (Array.isArray(valueToSave)) {
          // Filtrar IDs válidos
          const validGenreIds = valueToSave
            .map(id => parseInt(id))
            .filter(id => !isNaN(id) && id !== null && id !== undefined)

          // Eliminar relaciones existentes
          const { error: deleteError } = await supabase
            .from("book_genre")
            .delete()
            .eq("book_id", book.id)

          if (deleteError) {
            console.error("Error eliminando relaciones de género:", deleteError)
            throw deleteError
          }

          // Crear nuevas relaciones si hay géneros válidos
          if (validGenreIds.length > 0) {
            const genreInserts = validGenreIds.map(genreId => ({
              book_id: book.id,
              genre_id: genreId
            }))

            const { error: insertError } = await supabase
              .from("book_genre")
              .insert(genreInserts)

            if (insertError) {
              console.error("Error insertando relaciones de género:", insertError)
            }
          }

          toast.success("Géneros actualizados correctamente")
          onSave(validGenreIds)
          return
        } else {
          // Si no es un array, manejar como valor único
          toast.error("Formato de géneros inválido")
          onCancel()
          return
        }
      }

      if (columnId === "rating") dbValue = parseFloat(valueToSave)
      if (columnId === "pages" || columnId === "year") dbValue = parseInt(valueToSave)
      if (columnId === "favorite") dbValue = Boolean(valueToSave)
      if (columnId === "dateStarted" || columnId === "dateRead") {
        dbValue = valueToSave ? new Date(valueToSave).toISOString() : null
      }

      if (columnId !== "genre") {
        const { error } = await supabase
          .from("books")
          .update({ [dbField]: dbValue })
          .eq("id", book.id)

        if (error) throw error
      }

      toast.success(`Campo ${columnId} actualizado`)
      onSave(dbValue)
    } catch (error) {
      console.error("Error updating field:", error)
      toast.error(`No se pudo actualizar el campo ${columnId}`)
      onCancel()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === "Escape") {
      onCancel()
    }
  }

  const commonInputProps = {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value),
    onKeyDown: handleKeyDown,
    className: "w-[250px] text-sm px-3 py-2",
    ref: inputRef
  }

  const getTableName = (columnId: string) => {
    switch (columnId) {
      case "author": return "authors"
      case "universe": return "series"
      case "genre": return "genres"
      default: return undefined
    }
  }

  // Función para manejar cambios en MultiSelect
  const handleMultiSelectChange = (selected: string[], newItem?: { value: string; label: string; id?: number }) => {
    const newValue = selected[0] || null
    setEditValue(newValue)
    handleSave(newValue, !!newItem)
  }

  // Función específica para géneros
  const handleGenreChange = (selected: string[], newItem?: { value: string; label: string; id?: number }) => {
    setEditValue(selected)
    // No guardamos automáticamente para géneros, esperamos que el usuario presione "Guardar"
  }

  // Función específica para autor/universo
  const handleAuthorUniverseChange = async (selected: string[], newItem?: { value: string; label: string; id?: number }) => {
    const newValue = selected[0] || null
    setEditValue(newValue)
    if (newItem && newItem.id) {
      handleSave(newItem.id.toString(), true)
    } else {
      handleSave(newValue, false)
    }
  }

  // Preparar los valores seleccionados para el MultiSelect de géneros
  const getSelectedGenreValues = () => {
    if (columnId !== "genre") return editValue ? [editValue] : []
    
    // Para géneros, necesitamos convertir los IDs a strings para el MultiSelect
    if (Array.isArray(editValue)) {
      return editValue.map(id => id.toString())
    }
    return editValue ? [editValue.toString()] : []
  }

  // Preparar las opciones para el MultiSelect de géneros
  const getGenreOptions = () => {
    return options.map(option => ({
      value: option.id?.toString() || option.value,
      label: option.label,
      id: option.id
    }))
  }

  switch (columnId) {
    case "title":
    case "awards":
    case "image_url":
      return (
        <div className="absolute z-50 bg-white shadow-lg rounded-md border p-2">
          <Input
            value={editValue || ""}
            {...commonInputProps}
          />
        </div>
      )

    case "rating":
    case "pages":
    case "year":
      return (
        <div className="absolute z-50 bg-white shadow-lg rounded-md border p-2">
          <Input
            type="number"
            min={columnId === "rating" ? "0" : "1"}
            max={columnId === "rating" ? "10" : undefined}
            step={columnId === "rating" ? "0.1" : "1"}
            value={editValue || ""}
            {...commonInputProps}
          />
        </div>
      )

    case "dateStarted":
    case "dateRead":
      return (
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <div className="absolute z-50">
              <Button
                variant="outline"
                className={cn(
                  "w-[250px] justify-start text-left font-normal",
                  !editValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {editValue ? format(new Date(editValue), "PPP") : <span>Selecciona una fecha</span>}
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="flex items-center gap-2 p-2">
              <Calendar
                mode="single"
                selected={editValue ? new Date(editValue) : undefined}
                onSelect={(date) => {
                  setEditValue(date?.toISOString())
                  handleSave(date?.toISOString())
                  setIsDatePickerOpen(false)
                }}
                initialFocus
              />
              {editValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => {
                    setEditValue(null)
                    handleSave(null)
                    setIsDatePickerOpen(false)
                  }}
                  title="Eliminar fecha"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )

    case "genre":
      return (
        <div className="absolute z-50 bg-white shadow-lg rounded-md border min-w-[250px]">
          <MultiSelect
            ref={multiSelectRef}
            options={getGenreOptions()}
            selected={getSelectedGenreValues()}
            onChange={handleGenreChange}
            className="text-sm p-2"
            placeholder="Selecciona géneros"
            tableName="genres"
            returnId={true}
            refreshOptions={refreshOptions}
            creatable={true}
            columnId={columnId} // Pasar el columnId para colores consistentes
          />
          <div className="p-1 border-t flex justify-end gap-1 text-xs">
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 border-violet-300 text-violet-400 hover:bg-violet-100 text-xs"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-6 px-2 bg-violet-200 text-violet-700 hover:bg-violet-300 text-xs"
              onClick={() => handleSave(editValue)}
            >
              Guardar
            </Button>
          </div>
        </div>
      )

    case "type":
    case "publisher":
    case "language":
    case "era":
    case "format":
    case "audience":
    case "readingDensity":
      return (
        <div className="absolute z-50 bg-white shadow-lg rounded-md border min-w-[250px]">
          <MultiSelect
            ref={multiSelectRef}
            options={options}
            selected={editValue ? [editValue] : []}
            onChange={handleMultiSelectChange}
            singleSelect
            className="text-sm p-2"
            onKeyDown={handleKeyDown}
            placeholder={`Selecciona ${columnId}`}
            creatable={true}
            columnId={columnId} // Pasar el columnId para colores consistentes
          />
        </div>
      )

    case "author":
    case "universe":
      return (
        <div className="absolute z-50 bg-white shadow-lg rounded-md border min-w-[250px]">
          <MultiSelect
            ref={multiSelectRef}
            options={options}
            selected={editValue ? [editValue] : []}
            onChange={handleAuthorUniverseChange}
            singleSelect
            className="text-sm p-2"
            onKeyDown={handleKeyDown}
            placeholder={`Selecciona ${columnId === 'universe' ? 'un universo' : columnId}`}
            tableName={getTableName(columnId)}
            returnId={true}
            refreshOptions={refreshOptions}
            creatable={true}
            columnId={columnId} // Pasar el columnId para colores consistentes
          />
        </div>
      )

    case "favorite":
      return (
        <div className="absolute z-50 bg-white shadow-md rounded-lg border border-violet-200 p-2 w-[150px]">
          <select
            value={editValue ? "true" : "false"}
            onChange={(e) => {
              const newValue = e.target.value === "true"
              setEditValue(newValue)
              handleSave(newValue)
            }}
            className="w-full text-sm px-2 py-1 rounded-md bg-violet-50 border border-violet-200 text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 hover:bg-violet-100 transition-colors"
            ref={inputRef as any}
            onKeyDown={handleKeyDown}
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
      )
    case "summary":
      return (
        <div className="absolute z-50 bg-white shadow-lg rounded-md border p-2 w-[600px]">
          <Textarea
            value={editValue || ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault()
                handleSave()
              }
              if (e.key === "Escape") {
                onCancel()
              }
            }}
            className="text-sm resize-none min-h-[400px]"
            ref={textareaRef}
          />
        </div>
      )

    case "review":
      return (
        <div className="absolute z-50 bg-white shadow-lg rounded-md border p-2 w-[300px]">
          <Textarea
            value={editValue || ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault()
                handleSave()
              }
              if (e.key === "Escape") {
                onCancel()
              }
            }}
            className="text-sm resize-none min-h-[100px]"
            ref={textareaRef}
          />
        </div>
      )

    case "main_characters":
    case "favorite_character":
      return (
        <div className="absolute z-50 bg-white shadow-lg rounded-md border p-2 w-[300px]">
          <Input
            value={editValue || ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSave()
              }
              if (e.key === "Escape") {
                onCancel()
              }
            }}
            className="text-sm"
            ref={inputRef}
          />
        </div>
      )

    default:
      return null
  }
}