// components/genres/GenreEditor.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Edit2, Save, X, BookOpen } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import type { Genre } from "@/lib/types"

interface GenreEditorProps {
  genre: Genre
  onSave: (updatedGenre: Genre) => void
  onCancel: () => void
}

export const GenreEditor: React.FC<GenreEditorProps> = ({
  genre,
  onSave,
  onCancel
}) => {
  const [editName, setEditName] = useState(genre.name)
  const [editDescription, setEditDescription] = useState(genre.description || "")
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPopoverOpen && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [isPopoverOpen])

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error("Genre name is required")
      return
    }

    try {
      const { data, error } = await supabase
        .from('genres')
        .update({
          name: editName.trim(),
          description: editDescription.trim() || null
        })
        .eq('id', genre.id)
        .select()
        .single()

      if (error) throw error

      toast.success("Genre updated successfully")
      onSave(data)
      setIsPopoverOpen(false)
    } catch (error) {
      console.error("Error updating genre:", error)
      toast.error("Could not update genre")
    }
  }

  const handleCancel = () => {
    setEditName(genre.name)
    setEditDescription(genre.description || "")
    setIsPopoverOpen(false)
    onCancel()
  }

  // Manejar el submit del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSave()
  }

  // Manejar teclas en el textarea
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-pink-600 hover:text-pink-700 hover:bg-pink-50 flex-shrink-0"
          onClick={() => setIsPopoverOpen(true)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-4 z-[1000] bg-white/95 backdrop-blur-sm border-pink-200 shadow-lg"
        align="start"
        sideOffset={8}
      >
        <div ref={formRef}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 text-pink-600">
              <BookOpen className="h-4 w-4" />
              <h3 className="font-semibold">Edit Genre</h3>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-pink-700">Name</label>
              <Input
                ref={nameInputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Genre name"
                className="bg-white border-pink-200 text-pink-800 placeholder-pink-400 focus:ring-pink-300"
                required
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-pink-700">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Genre description"
                rows={3}
                className="bg-white border-pink-200 text-pink-800 placeholder-pink-400 focus:ring-pink-300 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-pink-600 hover:bg-pink-700 text-white"
                disabled={!editName.trim()}
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  )
}