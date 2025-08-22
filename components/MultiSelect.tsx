"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Check, ChevronsUpDown, Plus, X, Trash2 } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "@/hooks/use-toast"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"

interface MultiSelectProps {
  options: { value: string; label: string; id?: number }[]
  selected: string[]
  onChange: (selected: string[], newItem?: { value: string; label: string; id?: number }) => void
  placeholder?: string
  creatable?: boolean
  className?: string
  singleSelect?: boolean
  tableName?: "authors" | "series" | "genres"
  refreshOptions?: () => Promise<void>
  returnId?: boolean
}

const colorClasses = [
  "bg-[#efdfd7] text-amber-800 border border-amber-300",
  "bg-[#f7dcc9] text-orange-800 border border-orange-300",
  "bg-[#f1dfaf] text-yellow-800 border border-yellow-300",
  "bg-[#dbecdd] text-green-800 border border-green-300",
  "bg-[#d3e7f2] text-blue-800 border border-blue-300",
  "bg-[#e7ddef] text-purple-800 border border-purple-300",
  "bg-[#f7dfea] text-pink-800 border border-pink-300",
  "bg-[#fbddd9] text-red-800 border border-red-300",
  "bg-[#e6e4e0] text-gray-700 border border-gray-300",
]

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "",
  creatable = false,
  className,
  singleSelect = false,
  tableName,
  refreshOptions,
  returnId = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const getOptionIndex = (value: string) => {
    return options.findIndex((opt) => (returnId ? opt.id?.toString() === value : opt.value === value))
  }

  const handleSelect = (value: string, id?: number) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      if (singleSelect) {
        onChange([value], { value, label: value, id })
        setOpen(false)
      } else {
        onChange([...selected, value], { value, label: value, id })
      }
    }
    setInputValue("")
  }

  const handleCreate = async () => {
    if (!inputValue.trim()) return

    const value = inputValue.trim()
    const label = value

    const existingOption = options.find((opt) => opt.value === value)
    if (existingOption) {
      handleSelect(value, existingOption.id)
      return
    }

    if (creatable && tableName) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .insert([{ name: value }])
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          const newItem = {
            value: returnId ? data[0].id.toString() : value,
            label,
            id: data[0].id,
          }

          if (refreshOptions) {
            await refreshOptions()
          }

          if (singleSelect) {
            onChange([returnId ? data[0].id.toString() : value], newItem)
            setOpen(false)
          } else {
            onChange([...selected, returnId ? data[0].id.toString() : value], newItem)
          }

          toast({
            title: "✅ Creado exitosamente",
            description: `El ${tableName.slice(0, -1)} se ha añadido a la base de datos.`,
          })
        }
      } catch (error) {
        console.error(`Error creating ${tableName}:`, error)
        toast({
          title: "❌ Error",
          description: `No se pudo crear el ${tableName.slice(0, -1)}.`,
          variant: "destructive",
        })
      }
    } else {
      const newItem = { value, label }
      if (singleSelect) {
        onChange([value], newItem)
        setOpen(false)
      } else {
        onChange([...selected, value], newItem)
      }
    }

    setInputValue("")
  }

  const handleDelete = async () => {
    if (!itemToDelete || !tableName) return

    try {
      // CORRECCIÓN: Buscar por ID si returnId es true, por nombre si es false
      let query = supabase.from(tableName).select("id")
      
      if (returnId) {
        // Si estamos usando IDs, buscar por ID
        query = query.eq("id", parseInt(itemToDelete))
      } else {
        // Si estamos usando nombres, buscar por nombre
        query = query.eq("name", itemToDelete)
      }

      const { data: existingItems, error: searchError } = await query

      if (searchError) throw searchError
      if (!existingItems || existingItems.length === 0) {
        toast({
          title: "❌ No encontrado",
          description: `El ${tableName.slice(0, -1)} no existe en la base de datos.`,
          variant: "destructive",
        })
        return
      }

      // Usar el primer resultado (debería ser único)
      const itemId = existingItems[0].id

      const { error: deleteError } = await supabase.from(tableName).delete().eq("id", itemId)

      if (deleteError) throw deleteError

      if (refreshOptions) await refreshOptions()

      onChange(selected.filter((item) => item !== itemToDelete))

      toast({
        title: "✅ Eliminado exitosamente",
        description: `El ${tableName.slice(0, -1)} se ha eliminado de la base de datos.`,
      })
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error)
      toast({
        title: "❌ Error",
        description: `No se pudo eliminar el ${tableName.slice(0, -1)}.`,
        variant: "destructive",
      })
    } finally {
      setItemToDelete(null)
      setShowDeleteDialog(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim() && creatable) {
      handleCreate()
      e.preventDefault()
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between focus:border-purple-400 focus:ring-1 focus:ring-purple-200 h-6 min-h-6 py-1",
              className,
            )}
          >
            <div className="flex flex-wrap gap-1 overflow-hidden items-center">
              {selected.length > 0 ? (
                selected.map((value) => {
                  const option = options.find((opt) => (returnId ? opt.id?.toString() === value : opt.value === value))
                  const optionIndex = getOptionIndex(value)
                  return (
                    <div
                      key={value}
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0 text-xs font-medium h-4 leading-none",
                        colorClasses[optionIndex % colorClasses.length],
                        "transition-colors",
                      )}
                    >
                      <span className="truncate max-w-40">{option?.label || value}</span>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          onChange(selected.filter((item) => item !== value))
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation()
                            onChange(selected.filter((item) => item !== value))
                          }
                        }}
                        className="ml-1 rounded-full outline-none hover:bg-black/10 p-0.5 flex items-center justify-center"
                      >
                        <X className="h-1.5 w-1.5" />
                      </div>
                    </div>
                  )
                })
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 shadow-xl border-0 rounded-xl bg-white/95 backdrop-blur-sm">
          <Command className="rounded-xl">
            <CommandInput
              ref={inputRef}
              placeholder=""
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
              className="border-0 focus:ring-0 focus:outline-none rounded-t-xl h-6 py-1 text-sm"
            />
            <CommandList className="max-h-64">
              <CommandEmpty>
                {creatable && inputValue.trim() ? (
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex w-full items-center px-4 py-1 text-sm text-primary hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 hover:scale-[1.02] rounded-lg mx-2 my-1 h-6"
                  >
                    <Plus className="mr-3 h-3 w-3" />
                    Crear "{inputValue.trim()}"
                  </button>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No se encontraron resultados
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup className="p-2">
                {options
                  .filter((opt) => !selected.includes(returnId ? opt.id?.toString() || "" : opt.value) || singleSelect)
                  .map((option, index) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() =>
                        handleSelect(returnId ? option.id?.toString() || option.value : option.value, option.id)
                      }
                      className={cn(
                        "cursor-pointer rounded-lg px-4 py-0.5 mb-1 transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                        colorClasses[index % colorClasses.length],
                        "hover:brightness-95 relative",
                        selected.includes(returnId ? option.id?.toString() || "" : option.value) &&
                          "ring-2 ring-white ring-opacity-60",
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{option.label}</span>
                        <div className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "h-4 w-4 transition-all duration-200",
                              selected.includes(returnId ? option.id?.toString() || "" : option.value)
                                ? "opacity-100 scale-110"
                                : "opacity-0 scale-75",
                            )}
                          />
                          {tableName && (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation()
                                setItemToDelete(returnId ? option.id?.toString() || option.value : option.value)
                                setShowDeleteDialog(true)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.stopPropagation()
                                  setItemToDelete(returnId ? option.id?.toString() || option.value : option.value)
                                  setShowDeleteDialog(true)
                                }
                              }}
                              className="rounded-full outline-none hover:bg-red-500/20 p-1 text-red-500 transition-colors opacity-70 hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title={`¿Eliminar ${tableName?.slice(0, -1) || "elemento"}?`}
        description={`Esta acción eliminará permanentemente "${itemToDelete}" de la base de datos.${
          tableName === "authors" ? " Todos los libros asociados a este autor permanecerán pero perderán la relación." : ""
        }`}
        confirmText="Eliminar"
        confirmVariant="destructive"
      />
    </>
  )
}