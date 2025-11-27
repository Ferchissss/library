"use client"

import type React from "react"
import { User, Sparkles, FileText, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "@/hooks/use-toast"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"

// Define initial state only once
const initialFormData = {
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
}

interface AddAuthorProps {
  onAuthorAdded?: () => void
}

export default function AddAuthor({ onAuthorAdded }: AddAuthorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [bulkData, setBulkData] = useState("")
  
  // States for genre combobox
  const [existingGenres, setExistingGenres] = useState<string[]>([])
  const [isLoadingGenres, setIsLoadingGenres] = useState(false)
  const [showGenreDropdown, setShowGenreDropdown] = useState(false)
  const [filteredGenres, setFilteredGenres] = useState<string[]>([])
  const [showCreateButton, setShowCreateButton] = useState(false)
  const genreInputRef = useRef<HTMLInputElement>(null)

  // Load existing genres when modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchExistingGenres()
    }
  }, [isModalOpen])

  // Filter genres when text changes
  useEffect(() => {
    if (formData.genre.trim() === "") {
      setFilteredGenres(existingGenres.slice(0, 10)) // Show first 10
      setShowCreateButton(false)
    } else {
      const searchTerm = formData.genre.toLowerCase()
      const filtered = existingGenres.filter(genre => 
        genre.toLowerCase().includes(searchTerm)
      )
      setFilteredGenres(filtered.slice(0, 10))
      
      // Show create button if there are no exact matches
      const exactMatch = existingGenres.some(genre => 
        genre.toLowerCase() === searchTerm
      )
      setShowCreateButton(!exactMatch && formData.genre.trim().length > 0)
    }
  }, [formData.genre, existingGenres])

  const fetchExistingGenres = async () => {
    setIsLoadingGenres(true)
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('literary_genre')
        .not('literary_genre', 'is', null)

      if (error) throw error

      // Extract unique genres and sort alphabetically
      const genres = [...new Set(data
        .map(author => author.literary_genre)
        .filter(genre => genre && genre.trim() !== "")
      )].sort()

      setExistingGenres(genres)
      setFilteredGenres(genres.slice(0, 10))
    } catch (error) {
      console.error("Error fetching genres:", error)
      toast({
        title: "Error",
        description: "Could not load existing genres",
        variant: "destructive",
      })
    } finally {
      setIsLoadingGenres(false)
    }
  }

  // Function to reset form
  const resetForm = () => setFormData({ ...initialFormData })

  const handleInputChange = (field: keyof typeof initialFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGenreInputChange = (value: string) => {
    setFormData(prev => ({ ...prev, genre: value }))
    setShowGenreDropdown(true)
  }

  const handleGenreSelect = (genre: string) => {
    setFormData(prev => ({ ...prev, genre }))
    setShowGenreDropdown(false)
  }

  const handleCreateGenre = () => {
    // The genre is already in formData.genre, just close the dropdown
    setShowGenreDropdown(false)
    toast({
      title: "New genre ready",
      description: `"${formData.genre}" will be saved as a new genre.`,
    })
  }

  const handleClearGenre = () => {
    setFormData(prev => ({ ...prev, genre: "" }))
    setShowGenreDropdown(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genreInputRef.current && !genreInputRef.current.contains(event.target as Node)) {
        setShowGenreDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const parseBulkData = () => {
    const lines = bulkData
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length >= 1) {
      setFormData({
        name: lines[0] || "",
        nationality: lines[1] || "",
        birthYear: lines[2] || "",
        deathYear: lines[3] || "",
        genre: lines[4] || "",
        biography: lines[5] || "",
        awards: lines[6] || "",
        gender: lines[7] || "",
        continent: lines[8] || "",
        img_url: lines[9] || "",
      })
      setBulkData("")
      setIsCollapsibleOpen(false)
      toast({
        title: "Data loaded",
        description: "Fields have been automatically filled with the provided information.",
      })
    } else {
      toast({
        title: "Error",
        description: "Please provide at least the author's name.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Author name is required.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const authorData = {
        name: formData.name.trim(),
        nationality: formData.nationality.trim() || null,
        continent: formData.continent || null,
        birth_year: formData.birthYear ? parseInt(formData.birthYear) : null,
        death_year: formData.deathYear ? parseInt(formData.deathYear) : null,
        gender: formData.gender || null,
        literary_genre: formData.genre.trim() || null,
        biography: formData.biography.trim() || null,
        awards: formData.awards.trim() || null,
        img_url: formData.img_url.trim() || null,
      }

      const { data, error } = await supabase
        .from('authors')
        .insert([authorData])
        .select()

      if (error) throw error

      toast({
        title: "Author added successfully!",
        description: `${formData.name} has been added to your library.`,
      })

      if (onAuthorAdded) onAuthorAdded()

      resetForm()
      setIsModalOpen(false)

    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "There was a problem saving the author.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleGenreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (showCreateButton && formData.genre.trim().length > 0) {
        handleCreateGenre()
      } else if (filteredGenres.length > 0) {
        // If there are suggestions, select the first one
        handleGenreSelect(filteredGenres[0])
      }
    }
  }

  const isFormValid = formData.name.trim().length > 0

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Author
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-800">
            <User className="h-5 w-5" />
            Add New Author
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {/* Quick Entry */}
          <Card className="bg-blue-50/50 border-blue-200">
            <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-blue-100/50 transition-colors">
                  <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
                    <Sparkles className="h-4 w-4" />
                    Quick Data Entry
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Paste all data with line breaks to automatically fill the fields
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm">Expected order (one per line):</h4>
                    <ol className="text-xs text-blue-700 space-y-1">
                      <li>1. Author's full name *</li>
                      <li>2. Nationality</li>
                      <li>3. Birth year</li>
                      <li>4. Death year (optional, leave empty if alive)</li>
                      <li>5. Main literary genre</li>
                      <li>6. Brief biography</li>
                      <li>7. Main awards</li>
                      <li>8. Gender (Male/Female/Other)</li>
                      <li>9. Continent</li>
                      <li>10. Image URL (optional)</li>
                    </ol>
                  </div>
                  <Textarea
                    placeholder="Example:
Gabriel García Márquez
Colombian
1927
2014
Magical Realism
Colombian writer, Nobel Prize in Literature 1982...
Nobel Prize in Literature 1982, Cervantes Prize 1982
Male
South America
https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Gabriel_Garcia_Marquez.jpg/640px-Gabriel_Garcia_Marquez.jpg"
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    rows={8}
                    className="border-blue-200 focus:border-blue-400 font-mono text-sm py-2"
                  />
                  <Button
                    onClick={parseBulkData}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2"
                    disabled={!bulkData.trim()}
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Auto-Fill Fields
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name" className="text-blue-700 font-medium">
                  Full name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="nationality" className="text-blue-700 font-medium">
                  Nationality
                </Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange("nationality", e.target.value)}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7" 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="continent" className="text-blue-700 font-medium">
                  Continent
                </Label>
                <Select
                  value={formData.continent}
                  onValueChange={(value) => handleInputChange("continent", value)}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7"> 
                    <SelectValue placeholder="Select continent" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200 shadow-lg rounded-md">
                    <SelectItem value="North America" className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                      North America
                    </SelectItem>
                    <SelectItem value="South America" className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                      South America
                    </SelectItem>
                    <SelectItem value="Europe" className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                      Europe
                    </SelectItem>
                    <SelectItem value="Asia" className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                      Asia
                    </SelectItem>
                    <SelectItem value="Africa" className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                      Africa
                    </SelectItem>
                    <SelectItem value="Oceania" className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                      Oceania
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="birthYear" className="text-blue-700 font-medium">
                  Birth year
                </Label>
                <Input
                  id="birthYear"
                  type="number"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={formData.birthYear}
                  onChange={(e) => handleInputChange("birthYear", e.target.value)}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7" 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="deathYear" className="text-blue-700 font-medium">
                  Death year (optional)
                </Label>
                <Input
                  id="deathYear"
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
                <Label htmlFor="gender" className="text-blue-700 font-medium">
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-2 h-7"> 
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200 shadow-lg rounded-md">
                    <SelectItem value="Male" className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                      Male
                    </SelectItem>
                    <SelectItem value="Female" className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                      Female
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Improved Literary Genre Field - Combobox */}
              <div className="space-y-1 relative" ref={genreInputRef}>
                <Label htmlFor="genre" className="text-blue-700 font-medium">
                  Main literary genre
                </Label>
                <div className="relative">
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => handleGenreInputChange(e.target.value)}
                    onFocus={() => setShowGenreDropdown(true)}
                    onKeyDown={handleGenreKeyDown}
                    placeholder={
                      isLoadingGenres ? "Loading genres..." : ""
                    }
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

                {/* Genre dropdown */}
                {showGenreDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-blue-200 shadow-lg rounded-md max-h-60 overflow-y-auto">
                    {isLoadingGenres ? (
                      <div className="p-2 text-sm text-gray-500">Loading genres...</div>
                    ) : filteredGenres.length > 0 ? (
                      filteredGenres.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors first:rounded-t-md last:rounded-b-md"
                          onClick={() => handleGenreSelect(genre)}
                        >
                          {genre}
                        </button>
                      ))
                    ) : null}

                    {/* Button to create new genre */}
                    {showCreateButton && (
                      <div className="border-t border-blue-100">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer flex items-center gap-2 rounded-b-md"
                          onClick={handleCreateGenre}
                        >
                          <Plus className="h-3 w-3" />
                          Create genre: "{formData.genre}"
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="biography" className="text-blue-700 font-medium">
                Biography
              </Label>
              <Textarea
                id="biography"
                value={formData.biography}
                onChange={(e) => handleInputChange("biography", e.target.value)}
                rows={3}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-1" 
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="awards" className="text-blue-700 font-medium">
                Awards and recognitions
              </Label>
              <Textarea
                id="awards"
                value={formData.awards}
                onChange={(e) => handleInputChange("awards", e.target.value)}
                rows={2}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 py-1" 
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="img_url" className="text-blue-700 font-medium">
                Author Image URL
              </Label>
              <Input
                id="img_url"
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
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Author
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}