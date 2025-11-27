"use client"

import type React from "react"
import { User, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { Author } from "@/lib/types"

interface EditAuthorProps {
  author: Author
  isOpen: boolean
  onClose: () => void
  onAuthorUpdated: () => void
}

export default function EditAuthor({ author, isOpen, onClose, onAuthorUpdated }: EditAuthorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    nationality: "",
    birthYear: "",
    deathYear: "",
    genre: "",
    biography: "",
    awards: "",
    gender: "",
    continent: "",
    img_url: "",
  })

  const [existingGenres, setExistingGenres] = useState<string[]>([])
  const [isLoadingGenres, setIsLoadingGenres] = useState(false)
  const [showGenreDropdown, setShowGenreDropdown] = useState(false)
  const [filteredGenres, setFilteredGenres] = useState<string[]>([])
  const [showCreateButton, setShowCreateButton] = useState(false)
  const genreInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && author) {
      setFormData({
        name: author.name || "",
        nationality: author.nationality || "",
        birthYear: author.birth_year?.toString() || "",
        deathYear: author.death_year?.toString() || "",
        genre: author.literary_genre || "",
        biography: author.biography || "",
        awards: author.awards || "",
        gender: author.gender || "",
        continent: author.continent || "",
        img_url: author.img_url || "",
      })
      fetchExistingGenres()
    }
  }, [isOpen, author])

  useEffect(() => {
    if (formData.genre.trim() === "") {
      setFilteredGenres(existingGenres.slice(0, 10))
      setShowCreateButton(false)
    } else {
      const searchTerm = formData.genre.toLowerCase()
      const filtered = existingGenres.filter((genre) => genre.toLowerCase().includes(searchTerm))
      setFilteredGenres(filtered.slice(0, 10))

      const exactMatch = existingGenres.some((genre) => genre.toLowerCase() === searchTerm)
      setShowCreateButton(!exactMatch && formData.genre.trim().length > 0)
    }
  }, [formData.genre, existingGenres])

  const fetchExistingGenres = async () => {
    setIsLoadingGenres(true)
    try {
      const { data, error } = await supabase.from("authors").select("literary_genre").not("literary_genre", "is", null)

      if (error) throw error

      const genres = [...new Set(data.map((a) => a.literary_genre).filter((g) => g && g.trim() !== ""))].sort()

      setExistingGenres(genres)
      setFilteredGenres(genres.slice(0, 10))
    } catch (error) {
      console.error("Error fetching genres:", error)
    } finally {
      setIsLoadingGenres(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genreInputRef.current && !genreInputRef.current.contains(event.target as Node)) {
        setShowGenreDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGenreSelect = (genre: string) => {
    setFormData((prev) => ({ ...prev, genre }))
    setShowGenreDropdown(false)
  }

  const handleClearGenre = () => {
    setFormData((prev) => ({ ...prev, genre: "" }))
    setShowGenreDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Author name is required")
      return
    }

    setIsSubmitting(true)

    try {
      const authorData = {
        name: formData.name.trim(),
        nationality: formData.nationality.trim() || null,
        continent: formData.continent || null,
        birth_year: formData.birthYear ? Number.parseInt(formData.birthYear) : null,
        death_year: formData.deathYear ? Number.parseInt(formData.deathYear) : null,
        gender: formData.gender || null,
        literary_genre: formData.genre.trim() || null,
        biography: formData.biography.trim() || null,
        awards: formData.awards.trim() || null,
        img_url: formData.img_url.trim() || null,
      }

      const response = await fetch(`/api/authors/${author.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authorData),
      })

      if (!response.ok) throw new Error("Error updating author")

      toast.success(`${formData.name} has been successfully updated`)
      onAuthorUpdated()
      onClose()
    } catch (error) {
      console.error("Error:", error)
      toast.error("There was a problem saving the changes")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (filteredGenres.length > 0) {
        handleGenreSelect(filteredGenres[0])
      }
    }
  }

  const isFormValid = formData.name.trim().length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-800">
            <User className="h-5 w-5" />
            Edit Author
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-name" className="text-blue-700 font-medium">
                Full name *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-nationality" className="text-blue-700 font-medium">
                Nationality
              </Label>
              <Input
                id="edit-nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange("nationality", e.target.value)}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-continent" className="text-blue-700 font-medium">
                Continent
              </Label>
              <Select value={formData.continent} onValueChange={(value) => handleInputChange("continent", value)}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7">
                  <SelectValue placeholder="Select continent" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-200 shadow-lg rounded-md">
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="South America">South America</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                  <SelectItem value="Africa">Africa</SelectItem>
                  <SelectItem value="Oceania">Oceania</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-birthYear" className="text-blue-700 font-medium">
                Birth year
              </Label>
              <Input
                id="edit-birthYear"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                value={formData.birthYear}
                onChange={(e) => handleInputChange("birthYear", e.target.value)}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-deathYear" className="text-blue-700 font-medium">
                Death year (optional)
              </Label>
              <Input
                id="edit-deathYear"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                value={formData.deathYear}
                onChange={(e) => handleInputChange("deathYear", e.target.value)}
                placeholder="Leave empty if alive"
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-gender" className="text-blue-700 font-medium">
                Gender
              </Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-200 shadow-lg rounded-md">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 relative" ref={genreInputRef}>
              <Label htmlFor="edit-genre" className="text-blue-700 font-medium">
                Main literary genre
              </Label>
              <div className="relative">
                <Input
                  id="edit-genre"
                  value={formData.genre}
                  onChange={(e) => handleInputChange("genre", e.target.value)}
                  onFocus={() => setShowGenreDropdown(true)}
                  onKeyDown={handleGenreKeyDown}
                  placeholder={isLoadingGenres ? "Loading genres..." : "Type or select a genre"}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7 pr-10"
                  disabled={isLoadingGenres}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  {formData.genre && (
                    <button
                      type="button"
                      onClick={handleClearGenre}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {showGenreDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-blue-200 shadow-lg rounded-md max-h-60 overflow-y-auto">
                  {filteredGenres.length > 0
                    ? filteredGenres.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                          onClick={() => handleGenreSelect(genre)}
                        >
                          {genre}
                        </button>
                      ))
                    : null}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-biography" className="text-blue-700 font-medium">
              Biography
            </Label>
            <Textarea
              id="edit-biography"
              value={formData.biography}
              onChange={(e) => handleInputChange("biography", e.target.value)}
              rows={3}
              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-1"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-awards" className="text-blue-700 font-medium">
              Awards and recognitions
            </Label>
            <Textarea
              id="edit-awards"
              value={formData.awards}
              onChange={(e) => handleInputChange("awards", e.target.value)}
              rows={2}
              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-1"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-img_url" className="text-blue-700 font-medium">
              Author Image URL
            </Label>
            <Input
              id="edit-img_url"
              type="url"
              value={formData.img_url}
              onChange={(e) => handleInputChange("img_url", e.target.value)}
              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}