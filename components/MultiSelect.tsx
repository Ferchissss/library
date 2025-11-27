"use client"

import type React from "react"
import { useState, useRef, useMemo, useEffect } from "react" 
import { Check, ChevronsUpDown, Plus, X, Trash2 } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "@/hooks/use-toast"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { AVAILABLE_COLORS, getConsistentColorIndex } from "@/lib/colors";

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
  columnId?: string
  autoOpen?: boolean // New prop for auto-open
  onKeyDown?: (e: React.KeyboardEvent) => void
}

const colorClasses = AVAILABLE_COLORS;

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
  columnId = "multiselect",
  autoOpen = false,
  onKeyDown,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [localNewItems, setLocalNewItems] = useState<{ value: string; label: string; id?: number }[]>([])

  // Effect to auto-open popover when requested
  useEffect(() => {
    if (autoOpen) {
      setOpen(true)
      // Focus input after a small delay to ensure popover is open
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [autoOpen])

  // Function to check for exact match (case insensitive)
  const hasExactMatch = (searchValue: string) => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    return options.some(option => 
      option.label.toLowerCase() === normalizedSearch
    );
  };

  // Use useMemo to filter options efficiently
  const filteredOptions = useMemo(() => {
    return options.filter(option => 
      !selected.includes(returnId ? option.id?.toString() || "" : option.value) || singleSelect
    );
  }, [options, selected, singleSelect, returnId]);

  // Function to get consistent color styles
  const getColorStyle = (label: string) => {
    const index = getConsistentColorIndex(label, columnId, colorClasses.length);
    const color = colorClasses[index];
    return {
      backgroundColor: color.bg,
      borderColor: color.border,
      color: color.text.replace('text-', '#')
    };
  };

  const handleSelect = (value: string, id?: number) => {
    if (selected.includes(value)) {
      return;
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
          setLocalNewItems(prev => [...prev, newItem])
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
            title: "✅ Created successfully",
            description: `The ${tableName.slice(0, -1)} has been added to the database.`,
          })
        }
      } catch (error) {
        console.error(`Error creating ${tableName}:`, error)
        toast({
          title: "❌ Error",
          description: `Could not create the ${tableName.slice(0, -1)}.`,
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
      let query = supabase.from(tableName).select("id")
      
      if (returnId) {
        query = query.eq("id", parseInt(itemToDelete))
      } else {
        query = query.eq("name", itemToDelete)
      }

      const { data: existingItems, error: searchError } = await query

      if (searchError) throw searchError
      if (!existingItems || existingItems.length === 0) {
        toast({
          title: "❌ Not found",
          description: `The ${tableName.slice(0, -1)} does not exist in the database.`,
          variant: "destructive",
        })
        return
      }

      const itemId = existingItems[0].id
      const { error: deleteError } = await supabase.from(tableName).delete().eq("id", itemId)

      if (deleteError) throw deleteError

      if (refreshOptions) await refreshOptions()
      onChange(selected.filter((item) => item !== itemToDelete))

      toast({
        title: "✅ Deleted successfully",
        description: `The ${tableName.slice(0, -1)} has been removed from the database.`,
      })
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error)
      toast({
        title: "❌ Error",
        description: `Could not delete the ${tableName.slice(0, -1)}.`,
        variant: "destructive",
      })
    } finally {
      setItemToDelete(null)
      setShowDeleteDialog(false)
    }
  }

  // Helper function to check if an option is selected
  const isOptionSelected = (optionValue: string) => {
    return selected.includes(optionValue);
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
              "w-full justify-between focus:border-purple-400 focus:ring-1 focus:ring-purple-200 h-6 min-h-6 py-1 text-xs",
              className,
            )}
          >
            <div className="flex flex-wrap gap-1 overflow-hidden items-center">
              {selected.length > 0 ? (
                selected.map((value) => {
                  const option = options.find((opt) => (returnId ? opt.id?.toString() === value : opt.value === value))
                  const label = option?.label || value;
                  const colorStyle = getColorStyle(label);
                  
                  return (
                    <div
                      key={value}
                      className="inline-flex items-center rounded-md px-1 py-0 text-xs font-medium h-4 leading-none transition-colors border"
                      style={colorStyle}
                    >
                      <span className="truncate max-w-40">
                        {options.find(opt => opt.id?.toString() === value)?.label || 
                        options.find(opt => opt.value === value)?.label ||
                        localNewItems.find(item => item.id?.toString() === value)?.label ||
                        value}
                      </span>                      
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
                        style={{ color: colorStyle.color }}
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
          <Command className="rounded-xl" filter={(value, search) => {
            if (value.includes("create-option")) return 1;
            return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}>
            <CommandInput
              ref={inputRef}
              placeholder=""
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={onKeyDown}
              className="border-0 focus:ring-0 focus:outline-none rounded-t-xl h-6 py-1 text-xs"
            />
            <CommandList className="max-h-64">
              <CommandEmpty>
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              </CommandEmpty>
              <CommandGroup className="p-2">
                {creatable && inputValue.trim() && !hasExactMatch(inputValue) && (
                  <CommandItem
                    key="create-option"
                    value={`create-option-${inputValue}`}
                    onSelect={handleCreate}
                    className="cursor-pointer rounded-lg px-4 py-0.5 mb-1 transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100"
                  >
                    <div className="flex items-center">
                      <Plus className="mr-3 h-3 w-3 text-primary" />
                      <span className="font-medium text-primary">Create "{inputValue.trim()}"</span>
                    </div>
                  </CommandItem>
                )}
                
                {filteredOptions.map((option) => {
                  const optionValue = returnId ? option.id?.toString() || option.value : option.value;
                  const isSelected = isOptionSelected(optionValue);
                  const colorStyle = getColorStyle(option.label);
                  
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => handleSelect(optionValue, option.id)}
                      className={cn(
                        "cursor-pointer rounded-lg px-1 py-0  mb-1 text-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-md relative hover:brightness-95 border",
                      )}
                      style={colorStyle}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{option.label}</span>
                        <div className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "h-4 w-4 transition-all duration-200",
                              isSelected ? "opacity-100 scale-110" : "opacity-0 scale-75",
                            )}
                            style={{ color: colorStyle.color }}
                          />
                          {tableName && (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation()
                                setItemToDelete(optionValue)
                                setShowDeleteDialog(true)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.stopPropagation()
                                  setItemToDelete(optionValue)
                                  setShowDeleteDialog(true)
                                }
                              }}
                              className="rounded-full outline-none hover:bg-red-500/20 p-1 transition-colors opacity-70 hover:opacity-100"
                              style={{ color: colorStyle.color }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title={`Delete ${tableName?.slice(0, -1) || "element"}?`}
        description={`This action will permanently delete "${itemToDelete}" from the database.${
          tableName === "authors" ? " All books associated with this author will remain but will lose the relationship." : ""
        }`}
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </>
  )
}