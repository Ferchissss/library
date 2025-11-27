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
import { cn } from "@/lib/utils"

interface EditableCellProps {
  book: Book
  columnId: string
  value: any
  options: { value: string; label: string; id?: number }[]
  onSave: (newValue?: any) => void
  onCancel: () => void
  refreshOptions?: () => Promise<void>
}

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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [autoOpenMultiSelect, setAutoOpenMultiSelect] = useState(false)

  // Unified configuration for all field types
  const fieldConfig = {
    // Fields that open automatically in popover
    autoOpenPopover: ["dateStarted", "dateRead", "genre", "type", "publisher", "language", "era", "format", "audience", "readingDensity", "author", "universe", "favorite"],
    
    // Fields that are MultiSelect
    multiSelectFields: ["genre", "type", "publisher", "language", "era", "format", "audience", "readingDensity", "author", "universe"],
    
    // Fields that are single selection
    singleSelectFields: ["type", "publisher", "language", "era", "format", "audience", "readingDensity", "author", "universe", "favorite"],
    
    // Fields that require IDs
    idBasedFields: ["author", "universe", "genre"],
    
    // Creative fields
    creatableFields: ["type", "publisher", "language", "era", "format", "audience", "author", "universe", "genre"]
  }

  useEffect(() => {
    // Automatically open popovers for configured fields
    if (fieldConfig.autoOpenPopover.includes(columnId)) {
      setIsPopoverOpen(true)
    }

    // For MultiSelect fields, activate auto-open after a small delay
    if (fieldConfig.multiSelectFields.includes(columnId)) {
      const timer = setTimeout(() => {
        setAutoOpenMultiSelect(true)
      }, 100)
      return () => clearTimeout(timer)
    }

    // For normal input/textarea fields, focus
    if (inputRef.current && !fieldConfig.autoOpenPopover.includes(columnId)) {
      inputRef.current.focus()
    }
    if (textareaRef.current && columnId === "review") {
      textareaRef.current.focus()
    }
  }, [columnId])

  const handleSave = async (newValue?: any, isNewItem: boolean = false) => {
    const valueToSave = newValue !== undefined ? newValue : editValue
    
    try {
      // Specific validation for rating
      if (columnId === "rating") {
        const ratingValue = parseFloat(valueToSave);
        if (ratingValue < 1 || ratingValue > 10) {
          toast.error("Rating must be between 1 and 10");
          onCancel();
          return;
        }
      }

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

      // Convert names to IDs for relational fields
      if (fieldConfig.idBasedFields.includes(columnId) && columnId !== "genre") {
        if (valueToSave) {
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
                  toast.error(`Could not find ${columnId} "${valueToSave}"`)
                }
              }
            }
          }
        } else {
          dbValue = null
        }
      }

      // Special handling for genres
      if (columnId === "genre") {
        if (Array.isArray(valueToSave)) {
          const validGenreIds = valueToSave
            .map(id => parseInt(id))
            .filter(id => !isNaN(id) && id !== null && id !== undefined)

          const { error: deleteError } = await supabase
            .from("book_genre")
            .delete()
            .eq("book_id", book.id)

          if (deleteError) {
            console.error("Error deleting genre relationships:", deleteError)
            throw deleteError
          }

          if (validGenreIds.length > 0) {
            const genreInserts = validGenreIds.map(genreId => ({
              book_id: book.id,
              genre_id: genreId
            }))

            const { error: insertError } = await supabase
              .from("book_genre")
              .insert(genreInserts)

            if (insertError) {
              console.error("Error inserting genre relationships:", insertError)
            }
          }

          toast.success("Genres updated successfully")
          onSave(validGenreIds)
          return
        } else {
          toast.error("Invalid genre format")
          onCancel()
          return
        }
      }

      // Type conversions
      if (columnId === "rating") dbValue = parseFloat(valueToSave)
      if (columnId === "pages" || columnId === "year") dbValue = parseInt(valueToSave)
      if (columnId === "favorite") dbValue = Boolean(valueToSave)
      if (columnId === "dateStarted" || columnId === "dateRead") {
        dbValue = valueToSave 
      }

      if (columnId !== "genre") {
        const { error } = await supabase
          .from("books")
          .update({ [dbField]: dbValue })
          .eq("id", book.id)

        if (error) throw error
      }

      toast.success(`Field ${columnId} updated`)
      onSave(dbValue)
      setIsPopoverOpen(false)
    } catch (error) {
      console.error("Error updating field:", error)
      toast.error(`Could not update field ${columnId}`)
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
      setIsPopoverOpen(false)
    }
  }

  const getTableName = (columnId: string) => {
    switch (columnId) {
      case "author": return "authors"
      case "universe": return "series"
      case "genre": return "genres"
      default: return undefined
    }
  }

  // Function to handle MultiSelect changes
  const handleMultiSelectChange = (selected: string[], newItem?: { value: string; label: string; id?: number }) => {
    const newValue = selected[0] || null
    setEditValue(newValue)
    handleSave(newValue, !!newItem)
  }

  // Specific function for genres
  const handleGenreChange = (selected: string[], newItem?: { value: string; label: string; id?: number }) => {
    setEditValue(selected)
  }

  // Specific function for author/universe
  const handleAuthorUniverseChange = async (selected: string[], newItem?: { value: string; label: string; id?: number }) => {
    const newValue = selected[0] || null
    setEditValue(newValue)
    if (newItem && newItem.id) {
      handleSave(newItem.id.toString(), true)
    } else {
      handleSave(newValue, false)
    }
  }

  // Prepare selected values for genre MultiSelect
  const getSelectedGenreValues = () => {
    if (columnId !== "genre") return editValue ? [editValue] : []
    
    if (Array.isArray(editValue)) {
      return editValue.map(id => id.toString())
    }
    return editValue ? [editValue.toString()] : []
  }

  // Prepare options for genre MultiSelect
  const getGenreOptions = () => {
    return options.map(option => ({
      value: option.id?.toString() || option.value,
      label: option.label,
      id: option.id
    }))
  }

  // UNIFIED COMPONENT FOR POPOVERS
  const renderPopoverContent = () => {
    switch (columnId) {
      case "dateStarted":
      case "dateRead":
        return (
          <div className="p-0 -m-px">
            <Calendar
              value={editValue} // ← String directly
              onChange={(dateString) => { // ← Receives string
                setEditValue(dateString)
                handleSave(dateString)
              }}
              onClear={() => {
                setEditValue(null)
                handleSave(null)
              }}
            />    
          </div>
        )

      case "genre":
        return (
          <>
            <MultiSelect
              options={getGenreOptions()}
              selected={getSelectedGenreValues()}
              onChange={handleGenreChange}
              singleSelect={false}
              className="text-sm"
              placeholder="Select genres"
              tableName="genres"
              returnId={true}
              refreshOptions={refreshOptions}
              creatable={true}
              columnId={columnId}
              autoOpen={autoOpenMultiSelect}
            />
            <div className="p-1 border-t flex justify-end gap-1 text-xs mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 border-violet-300 text-violet-400 hover:bg-violet-100 text-xs"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-6 px-2 bg-violet-200 text-violet-700 hover:bg-violet-300 text-xs"
                onClick={() => handleSave(editValue)}
              >
                Save
              </Button>
            </div>
          </>
        )

      case "type":
      case "publisher":
      case "language":
      case "era":
      case "format":
      case "audience":
      case "readingDensity":
        return (
          <MultiSelect
            options={options}
            selected={editValue ? [editValue] : []}
            onChange={handleMultiSelectChange}
            singleSelect={true}
            className="text-sm"
            placeholder={`Select ${columnId}`}
            creatable={fieldConfig.creatableFields.includes(columnId)}
            columnId={columnId}
            autoOpen={autoOpenMultiSelect}
          />
        )

      case "author":
      case "universe":
        return (
          <MultiSelect
            options={options}
            selected={editValue ? [editValue] : []}
            onChange={handleAuthorUniverseChange}
            singleSelect={true}
            className="text-sm"
            placeholder={`Select ${columnId === 'universe' ? 'a universe' : columnId}`}
            tableName={getTableName(columnId)}
            returnId={true}
            creatable={true}
            columnId={columnId}
            autoOpen={autoOpenMultiSelect}
          />
        )

      default:
        return null
    }
  }

  // UNIFIED COMPONENT FOR POPOVER
  const renderAutoOpenPopover = () => (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div className="absolute inset-0 opacity-0" />
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "z-[1000] p-0",
          columnId === "favorite" ? "w-32" : 
          ["dateStarted", "dateRead"].includes(columnId) ? "w-auto" : "min-w-[250px]"
        )}
        align="start"
        side="bottom"
        sideOffset={4}
        collisionPadding={16}
      >
        {renderPopoverContent()}
      </PopoverContent>
    </Popover>
  )

  // Rendering of normal fields (not popover)
  const renderNormalField = () => {
    switch (columnId) {
      case "title":
      case "awards":
      case "image_url":
        return (
          <Input
            value={editValue || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute z-50 w-[250px] text-xs px-2 py-1 h-7 bg-white shadow-sm"
            ref={inputRef}
          />
        )

      case "rating":
      case "pages":
      case "year":
        return (
          <Input
            type="number"
            min={columnId === "rating" ? "1" : "1"}
            max={columnId === "rating" ? "10" : undefined}
            step={columnId === "rating" ? "1" : "1"}
            value={editValue || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute z-50 w-[75px] text-xs px-2 py-1 h-7 bg-white shadow-sm"
            ref={inputRef}
          />
        )

      case "summary":
        return (
          <div className="absolute z-50 bg-white rounded-md border p-2 w-[600px]">
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
              className="w-full text-xs px-2 py-1 bg-white min-h-[400px] resize-none border-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Write the book summary..."
              ref={textareaRef}
            />
            <div className="p-1 border-t flex justify-end gap-1 text-xs mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 border-violet-300 text-violet-400 hover:bg-violet-100 text-xs"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-6 px-2 bg-violet-200 text-violet-700 hover:bg-violet-300 text-xs"
                onClick={() => handleSave()}
              >
                Save
              </Button>
            </div>
          </div>
        )

      case "review":
        return (
          <div className="absolute z-50 bg-white rounded-md border p-2 w-[300px]">
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
              className="w-full text-xs px-2 py-1 bg-white min-h-[100px] resize-none border-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Write your review..."
              ref={textareaRef}
            />
            <div className="p-1 border-t flex justify-end gap-1 text-xs mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 border-violet-300 text-violet-400 hover:bg-violet-100 text-xs"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-6 px-2 bg-violet-200 text-violet-700 hover:bg-violet-300 text-xs"
                onClick={() => handleSave()}
              >
                Save
              </Button>
            </div>
          </div>
        )

      case "main_characters":
      case "favorite_character":
        return (
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
        )

      default:
        return null
    }
  }

  // MAIN RENDER
  if (fieldConfig.autoOpenPopover.includes(columnId)) {
    return (
      <div className="absolute z-50">
        {renderAutoOpenPopover()}
      </div>
    )
  }

  return renderNormalField()
}