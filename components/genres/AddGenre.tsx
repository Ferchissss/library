"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Save, X, BookOpen } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import type { Genre } from "@/lib/types"

interface AddGenreProps {
  onGenreAdded: (newGenre: Genre) => void
}

export const AddGenre: React.FC<AddGenreProps> = ({
  onGenreAdded
}) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Genre name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('genres')
        .insert({
          name: name.trim(),
          description: description.trim() || null
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Genre created successfully")
      onGenreAdded(data)
      setName("")
      setDescription("")
      setIsPopoverOpen(false)
    } catch (error) {
      console.error("Error creating genre:", error)
      toast.error("Could not create genre")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setName("")
    setDescription("")
    setIsPopoverOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSave()
  }

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
          className="bg-pink-600 hover:bg-pink-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Genre
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-4 z-[1000] bg-white/95 backdrop-blur-sm border-pink-200 shadow-lg"
        align="end"
        sideOffset={8}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 text-pink-600">
            <BookOpen className="h-4 w-4" />
            <h3 className="font-semibold">Add New Genre</h3>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-pink-700">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Genre name"
              className="bg-white border-pink-200 text-pink-800 placeholder-pink-400 focus:ring-pink-300"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-pink-700">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Genre description"
              rows={3}
              className="bg-white border-pink-200 text-pink-800 placeholder-pink-400 focus:ring-pink-300 resize-none"
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-pink-600 hover:bg-pink-700 text-white"
              disabled={!name.trim() || isSubmitting}
            >
              <Save className="h-3 w-3 mr-1" />
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}