"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { GripVertical, Trash2, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Book, Quote } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"
import { EditableCell } from "./EditableCell"
import { AVAILABLE_COLORS, getConsistentColorIndex } from "@/lib/colors"
import { FavoriteButton } from "./book-components"

interface BookTableProps {
  books: Book[]
  quotesMap: Record<number, Quote[]>
  refreshData?: () => void
  onBookSelect: (book: Book) => void
  onBookUpdate: (book: Book) => void
}

interface Column {
  id: string
  label: string
  width: number
  minWidth: number
  isSticky?: boolean
  left?: number
}

const initialColumns: Column[] = [
  { id: "number", label: "No.", width: 80, minWidth: 80, isSticky: true, left: 0 },
  { id: "title", label: "Title", width: 220, minWidth: 180, isSticky: true, left: 70 },
  { id: "author", label: "Author", width: 160, minWidth: 130 },
  { id: "universe", label: "Universe", width: 130, minWidth: 110 },
  { id: "rating", label: "Rating", width: 70, minWidth: 70 },
  { id: "type", label: "Type", width: 70, minWidth: 70 },
  { id: "genre", label: "Genre", width: 80, minWidth: 80 },
  { id: "dateStarted", label: "Started", width: 75, minWidth: 75 },
  { id: "dateRead", label: "Finished", width: 80, minWidth: 80 },
  { id: "days", label: "Days", width: 60, minWidth: 60 },
  { id: "year", label: "Year", width: 55, minWidth: 55 },
  { id: "pages", label: "Pages", width: 65, minWidth: 65 },
  { id: "publisher", label: "Publisher", width: 100, minWidth: 100 },
  { id: "language", label: "Language", width: 85, minWidth: 85 },
  { id: "era", label: "Era", width: 75, minWidth: 75 },
  { id: "format", label: "Format", width: 90, minWidth: 90 },
  { id: "audience", label: "Audience", width: 90, minWidth: 90 },
  { id: "readingDensity", label: "Reading", width: 80, minWidth: 80 },
  { id: "awards", label: "Awards", width: 170, minWidth: 170 },
]

const withStickyOffsets = (cols: Column[]): Column[] => {
  let left = 0
  return cols.map((c) => {
    if (c.isSticky) {
      const out = { ...c, left }
      left += c.width
      return out
    }
    return c
  })
}

const availableColors = AVAILABLE_COLORS

// Function to get consistent color styles by column
const getBadgeStyle = (columnId: string, value: string) => {
  if (!value) {
    return {
      backgroundColor: availableColors[0].bg,
      borderColor: availableColors[0].border.replace("border-", "#"),
      color: availableColors[0].text.replace("text-", "#"),
    }
  }

  const colorIndex = getConsistentColorIndex(value, columnId, availableColors.length)
  const colorClass = availableColors[colorIndex]
  return {
    backgroundColor: colorClass.bg,
    borderColor: colorClass.border.replace("border-", "#"),
    color: colorClass.text.replace("text-", "#"),
  }
}

export function BookTable({ books, quotesMap, refreshData, onBookSelect, onBookUpdate }: BookTableProps) {
  const [columns, setColumns] = useState<Column[]>(() => withStickyOffsets(initialColumns))
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null)
  const [resizingColumn, setResizingColumn] = useState<number | null>(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [hoveredTitle, setHoveredTitle] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [bookToDeleteId, setBookToDeleteId] = useState<number | null>(null)

  const [typesOptions, setTypesOptions] = useState<{ value: string; label: string }[]>([])
  const [publishersOptions, setPublishersOptions] = useState<{ value: string; label: string }[]>([])
  const [languagesOptions, setLanguagesOptions] = useState<{ value: string; label: string }[]>([])
  const [erasOptions, setErasOptions] = useState<{ value: string; label: string }[]>([])
  const [formatsOptions, setFormatsOptions] = useState<{ value: string; label: string }[]>([])
  const [audiencesOptions, setAudiencesOptions] = useState<{ value: string; label: string }[]>([])
  const [yearsOptions, setYearsOptions] = useState<{ value: string; label: string }[]>([])
  const [authorsOptions, setAuthorsOptions] = useState<{ value: string; label: string; id?: number }[]>([])
  const [seriesOptions, setSeriesOptions] = useState<{ value: string; label: string; id?: number }[]>([])
  const [genresOptions, setGenresOptions] = useState<{ value: string; label: string; id?: number }[]>([])

  const [editingCell, setEditingCell] = useState<{ rowId: number; columnId: string } | null>(null)

  const tableRef = useRef<HTMLTableElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data: types } = await supabase
          .from("books")
          .select("type")
          .not("type", "is", null)
          .order("type", { ascending: true })
        setTypesOptions([...new Set(types?.map((t) => t.type))].map((t) => ({ value: t, label: t })) || [])

        const { data: publishers } = await supabase
          .from("books")
          .select("publisher")
          .not("publisher", "is", null)
          .order("publisher", { ascending: true })
        setPublishersOptions(
          [...new Set(publishers?.map((p) => p.publisher))].map((p) => ({ value: p, label: p })) || [],
        )

        const { data: languages } = await supabase
          .from("books")
          .select("language")
          .not("language", "is", null)
          .order("language", { ascending: true })
        setLanguagesOptions([...new Set(languages?.map((l) => l.language))].map((l) => ({ value: l, label: l })) || [])

        const { data: eras } = await supabase
          .from("books")
          .select("era")
          .not("era", "is", null)
          .order("era", { ascending: true })
        setErasOptions([...new Set(eras?.map((e) => e.era))].map((e) => ({ value: e, label: e })) || [])

        const { data: formats } = await supabase
          .from("books")
          .select("format")
          .not("format", "is", null)
          .order("format", { ascending: true })
        setFormatsOptions([...new Set(formats?.map((f) => f.format))].map((f) => ({ value: f, label: f })) || [])

        const { data: audiences } = await supabase
          .from("books")
          .select("audience")
          .not("audience", "is", null)
          .order("audience", { ascending: true })
        setAudiencesOptions([...new Set(audiences?.map((a) => a.audience))].map((a) => ({ value: a, label: a })) || [])

        const { data: years } = await supabase
          .from("books")
          .select("year")
          .not("year", "is", null)
          .order("year", { ascending: false })
        setYearsOptions([...new Set(years?.map((y) => y.year?.toString()))].map((y) => ({ value: y, label: y })) || [])

        const { data: authors } = await supabase.from("authors").select("id, name").order("name", { ascending: true })
        setAuthorsOptions(authors?.map((a) => ({ value: a.id.toString(), label: a.name, id: a.id })) || [])

        const { data: series } = await supabase.from("series").select("id, name").order("name", { ascending: true })
        setSeriesOptions(series?.map((s) => ({ value: s.id.toString(), label: s.name, id: s.id })) || [])

        const { data: genres } = await supabase.from("genres").select("id, name").order("name", { ascending: true })
        setGenresOptions(genres?.map((g) => ({ value: g.id.toString(), label: g.name, id: g.id })) || [])
      } catch (error) {
        console.error("Error fetching options:", error)
      }
    }

    fetchOptions()
  }, [])

  const handleViewBook = (bookId: number) => {
    const book = books.find((b) => b.id === bookId)
    if (book) {
      onBookSelect(book)
    }
  }

  const handleDeleteClick = (bookId: number) => {
    setBookToDeleteId(bookId)
    setShowDeleteDialog(true)
  }

  const handleDeleteBook = async () => {
    if (bookToDeleteId !== null) {
      try {
        await supabase.rpc("delete_and_reorder_book", { p_book_id: bookToDeleteId })
        refreshData?.()
        toast.success("Book deleted and order updated successfully")
      } catch (error) {
        toast.error("Error deleting book")
      } finally {
        setShowDeleteDialog(false)
        setBookToDeleteId(null)
      }
    }
  }

  const handleSaveGenres = async (bookId: number, genreIds: string[]) => {
    try {
      const numericGenreIds = genreIds.map((id) => Number.parseInt(id))

      const { error: deleteError } = await supabase.from("book_genre").delete().eq("book_id", bookId)

      if (deleteError) throw deleteError

      if (numericGenreIds.length > 0) {
        const { error: insertError } = await supabase.from("book_genre").insert(
          numericGenreIds.map((genreId) => ({
            book_id: bookId,
            genre_id: genreId,
          })),
        )

        if (insertError) throw insertError
      }

      // Create the updated book
      const currentBook = books.find((b) => b.id === bookId)!
      const updatedBook = {
        ...currentBook,
        genres: numericGenreIds.map((genreId) => {
          const genre = genresOptions.find((g) => g.id === genreId)
          return genre ? { id: genreId, name: genre.label } : { id: genreId, name: `Genre ${genreId}` }
        }),
      }

      onBookUpdate(updatedBook)
      toast.success("Genres updated successfully")
      setEditingCell(null)
    } catch (error) {
      console.error("Error updating genres:", error)
      toast.error("Could not update genres")
      setEditingCell(null)
    }
  }

  const handleColumnDragStart = (e: React.DragEvent, index: number) => {
    if (columns[index].isSticky) {
      e.preventDefault()
      return
    }
    setDraggedColumn(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleColumnDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedColumn === null || columns[dropIndex].isSticky || columns[draggedColumn].isSticky) return

    const newColumns = [...columns]
    const draggedItem = newColumns[draggedColumn]
    newColumns.splice(draggedColumn, 1)
    newColumns.splice(dropIndex, 0, draggedItem)
    setColumns(withStickyOffsets(newColumns))
    setDraggedColumn(null)
  }

  const handleResizeStart = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingColumn(index)
    setStartX(e.clientX)
    setStartWidth(columns[index].width)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn === null) return
      const diff = e.clientX - startX
      const newWidth = Math.max(startWidth + diff, columns[resizingColumn].minWidth)
      setColumns((prev) => {
        const nc = [...prev]
        nc[resizingColumn] = { ...nc[resizingColumn], width: newWidth }
        return withStickyOffsets(nc)
      })
    }

    const handleMouseUp = () => setResizingColumn(null)

    if (resizingColumn !== null) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [resizingColumn, startX, startWidth, columns])

  const refreshAuthors = async () => {
    const { data: authors } = await supabase.from("authors").select("id, name").order("name", { ascending: true })
    setAuthorsOptions(authors?.map((a) => ({ value: a.id.toString(), label: a.name, id: a.id })) || [])
  }

  const refreshSeries = async () => {
    const { data: series } = await supabase.from("series").select("id, name").order("name", { ascending: true })
    setSeriesOptions(series?.map((s) => ({ value: s.id.toString(), label: s.name, id: s.id })) || [])
  }

  const refreshGenres = async () => {
    const { data: genres } = await supabase.from("genres").select("id, name").order("name", { ascending: true })
    setGenresOptions(genres?.map((g) => ({ value: g.id.toString(), label: g.name, id: g.id })) || [])
  }

  const getOptionsForField = (field: string) => {
    const fieldOptions: Record<string, { value: string; label: string; id?: number }[]> = {
      type: typesOptions,
      year: yearsOptions,
      publisher: publishersOptions,
      language: languagesOptions,
      era: erasOptions,
      format: formatsOptions,
      audience: audiencesOptions,
      author: authorsOptions,
      universe: seriesOptions,
      genre: genresOptions,
      readingDensity: [
        { value: "Light", label: "Light" },
        { value: "Medium", label: "Medium" },
        { value: "Dense", label: "Dense" },
      ],
    }
    return fieldOptions[field] || []
  }

  const getValueForField = (field: string, book: Book) => {
    const fieldValues: Record<string, any> = {
      title: book.title,
      rating: book.rating,
      type: book.type,
      dateStarted: book.start_date,
      dateRead: book.end_date,
      year: book.year,
      pages: book.pages,
      publisher: book.publisher,
      language: book.language,
      era: book.era,
      format: book.format,
      audience: book.audience,
      readingDensity: book.reading_difficulty,
      awards: book.awards,
      universe: book.series?.id?.toString(),
      author: book.author?.id?.toString(),
      genre: book.genres?.map((g) => g.id.toString()) || [],
    }
    return fieldValues[field] ?? null
  }

 const renderDisplayValue = (columnId: string, value: any, bookId?: number) => {
  // If value is null, undefined, empty string, or 0, return null
  if (value === null || value === undefined || value === "" || value === 0) {
    return null;
  }

  // For empty arrays (like genres)
  if (Array.isArray(value) && value.length === 0) {
    return null;
  }

  switch (columnId) {
    case "rating":
      const percentage = ((value ?? 0) / 10) * 100
      return (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 bg-slate-200 rounded-full h-1.5 min-w-[40px] overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-300 bg-gradient-to-r from-green-300 to-blue-300"
              style={{ width: "100%" }}
            />
            <div
              className="absolute top-0 right-0 h-full bg-white transition-all duration-300"
              style={{ width: `${100 - percentage}%`, mixBlendMode: "destination-out" as any }}
            />
          </div>
          <span className="font-semibold text-slate-700 text-xs min-w-[12px]">{value}</span>
        </div>
      )

    case "author":
      const book = books.find((b) => b.id === bookId)
      const authorName = book?.author?.name || value
      // Check if there's actually an author
      if (!authorName) return null;
      
      return (
        <Badge
          variant="outline"
          style={getBadgeStyle(columnId, authorName)}
          className="font-medium px-1.5 py-0 rounded-[3px] shadow-sm text-xs max-w-full"
          title={authorName}
        >
          <span className="truncate">{authorName}</span>
        </Badge>
      )

    case "type":
    case "publisher":
    case "language":
    case "era":
    case "format":
    case "audience":
    case "readingDensity":
      // Only show if there's a value
      if (!value) return null;
      
      return (
        <Badge
          variant="outline"
          style={getBadgeStyle(columnId, value)}
          className="font-medium px-1.5 py-0 rounded-[3px] shadow-sm text-xs max-w-full"
          title={value}
        >
          <span className="truncate">{value}</span>
        </Badge>
      )

    case "dateStarted":
    case "dateRead":
      if (!value) return null;
      let displayDate;
      if (typeof value === 'string' && value.includes('-')) {
        // For YYYY-MM-DD format, add local time
        displayDate = new Date(value + 'T12:00:00'); // Local noon
      } else {
        displayDate = new Date(value);
      }
      return (
        <div className="flex justify-center w-full">
          <span className="text-slate-600 font-medium text-xs">
            {displayDate.toLocaleDateString("en-US")}
          </span>
        </div>
      )

    case "year":
      if (!value) return null;
      
      return (
        <div className="flex justify-center w-full">
          <Badge
            variant="outline"
            style={getBadgeStyle("year", value.toString())}
            className="font-medium px-1.5 py-0 rounded-[3px] shadow-sm text-xs max-w-full"
            title={value.toString()}
          >
            <span className="truncate">{value}</span>
          </Badge>
        </div>
      )

    case "pages":
      if (!value) return null;
      
      return (
        <div className="flex justify-center w-full">
          <span className="inline-flex items-center justify-center px-1 py-0 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-semibold text-xs">
            {value}
          </span>
        </div>
      )

    case "awards":
      if (!value) return null;
      
      return (
        <div className="text-slate-600 max-w-[220px] font-medium truncate text-xs" title={value}>
          {value}
        </div>
      )

    case "universe":
      const universeName = books.find((b) => b.id === bookId)?.series?.name || value
      if (!universeName) return null;
      
      return (
        <Badge
          variant="outline"
          style={getBadgeStyle("universe", universeName)}
          className="font-medium px-1.5 py-0 rounded-[3px] shadow-sm text-xs max-w-full"
          title={universeName}
        >
          <span className="truncate">{universeName}</span>
        </Badge>
      )

    case "genre":
      const maxVisible = 3
      // Only show if there are genres
      if (!value || value.length === 0) return null;
      
      return (
        <div className="relative w-full h-full flex items-center">
          <div className="flex gap-1 overflow-hidden">
            {value.slice(0, maxVisible).map((genreId: string) => {
              const genre = genresOptions.find((g) => g.value === genreId)
              return genre ? (
                <Badge
                  key={genreId}
                  variant="outline"
                  style={getBadgeStyle("genre", genre.label)}
                  className="font-medium px-1.5 py-0 rounded-[3px] shadow-sm text-xs whitespace-nowrap"
                  title={genre.label}
                >
                  {genre.label}
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )

    case "days":
      // This case will be handled in renderCellContent
      return null;

    default:
      // For other fields, only show if there's a value
      if (!value) return null;
      return <span className="text-slate-600 text-xs">{value}</span>
  }
}

  const renderCellContent = (columnId: string, book: Book, index: number) => {
    const value = getValueForField(columnId, book)
    const handleClickToEdit = () => setEditingCell({ rowId: book.id, columnId })

    if (editingCell?.rowId === book.id && editingCell.columnId === columnId) {
      return (
        <>
          <EditableCell
            book={book}
            columnId={columnId}
            value={value}
            options={getOptionsForField(columnId)}
            onSave={async (newValue) => {
              if (columnId === "genre") {
                handleSaveGenres(book.id, newValue || [])
              } else {
                try {
                  const updateData: any = {}
                  let authorName = null
                  let seriesName = null

                  // First get names if necessary
                  if (columnId === "author" && newValue) {
                    const { data: authorData } = await supabase
                      .from("authors")
                      .select("name")
                      .eq("id", newValue)
                      .single()
                    authorName = authorData?.name || "Unknown"
                  }

                  if (columnId === "universe" && newValue) {
                    const { data: seriesData } = await supabase
                      .from("series")
                      .select("name")
                      .eq("id", newValue)
                      .single()
                    seriesName = seriesData?.name || "Unknown"
                  }

                  // Configure updateData
                  switch (columnId) {
                    case "title":
                      updateData.title = newValue
                      break
                    case "rating":
                      updateData.rating = newValue
                      break
                    case "type":
                      updateData.type = newValue
                      break
                    case "dateStarted":
                      updateData.start_date = newValue
                      break
                    case "dateRead":
                      updateData.end_date = newValue
                      break
                    case "year":
                      updateData.year = newValue
                      break
                    case "pages":
                      updateData.pages = newValue
                      break
                    case "publisher":
                      updateData.publisher = newValue
                      break
                    case "language":
                      updateData.language = newValue
                      break
                    case "era":
                      updateData.era = newValue
                      break
                    case "format":
                      updateData.format = newValue
                      break
                    case "audience":
                      updateData.audience = newValue
                      break
                    case "readingDensity":
                      updateData.reading_difficulty = newValue
                      break
                    case "favorite":
                      updateData.favorite = newValue
                      break
                    case "awards":
                      updateData.awards = newValue
                      break
                    case "author":
                      updateData.author_id = newValue ? Number.parseInt(newValue) : null
                      break
                    case "universe":
                      updateData.series_id = newValue ? Number.parseInt(newValue) : null
                      break
                  }

                  // Update the database
                  const { error } = await supabase.from("books").update(updateData).eq("id", book.id)
                  if (error) throw error

                  // Find the current book in books
                  const currentBook = books.find((b) => b.id === book.id)!
                  const updatedBook = { ...currentBook }

                  // Update the corresponding field
                  switch (columnId) {
                    case "title":
                      updatedBook.title = newValue
                      break
                    case "rating":
                      updatedBook.rating = newValue
                      break
                    case "type":
                      updatedBook.type = newValue
                      break
                    case "dateStarted":
                      updatedBook.start_date = newValue
                      break
                    case "dateRead":
                      updatedBook.end_date = newValue
                      break
                    case "year":
                      updatedBook.year = newValue
                      break
                    case "pages":
                      updatedBook.pages = newValue
                      break
                    case "publisher":
                      updatedBook.publisher = newValue
                      break
                    case "language":
                      updatedBook.language = newValue
                      break
                    case "era":
                      updatedBook.era = newValue
                      break
                    case "format":
                      updatedBook.format = newValue
                      break
                    case "audience":
                      updatedBook.audience = newValue
                      break
                    case "readingDensity":
                      updatedBook.reading_difficulty = newValue
                      break
                    case "favorite":
                      updatedBook.favorite = newValue
                      break
                    case "awards":
                      updatedBook.awards = newValue
                      break
                    case "author":
                      if (newValue) {
                        updatedBook.author = { id: Number.parseInt(newValue), name: authorName }
                      } else {
                        updatedBook.author = undefined
                      }
                      break
                    case "universe":
                      if (newValue) {
                        updatedBook.series = { id: Number.parseInt(newValue), name: seriesName }
                      } else {
                        updatedBook.series = undefined
                      }
                      break
                  }
                  onBookUpdate(updatedBook) // ← Notify parent

                  toast.success("Field updated successfully")
                  setEditingCell(null)
                } catch (error) {
                  console.error("Error updating field:", error)
                  toast.error("Could not update field")
                  setEditingCell(null)
                }
              }
            }}
            onCancel={() => setEditingCell(null)}
            refreshOptions={
              columnId === "author"
                ? refreshAuthors
                : columnId === "universe"
                  ? refreshSeries
                  : columnId === "genre"
                    ? refreshGenres
                    : undefined
            }
          />
        </>
      )
    }

    if (columnId === "number") {
      const handleFavoriteClick = async () => {
        try {
          const newFavoriteValue = !book.favorite
          const { error } = await supabase
            .from("books")
            .update({ favorite: newFavoriteValue })
            .eq("id", book.id)

          if (error) throw error

          const updatedBook = { ...book, favorite: newFavoriteValue }
          onBookUpdate(updatedBook)

          toast.success(newFavoriteValue ? "Book marked as favorite" : "Book unmarked as favorite")
        } catch (error) {
          console.error("Error updating favorite:", error)
          toast.error("Could not update favorite")
        }
      }

      return (
        <div className="flex items-center justify-between gap-1 px-1">
          {/* Delete button on the left */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteClick(book.id)
            }}
            title="Delete book"
          >
            <Trash2 className="h-3 w-3" />
          </Button>

          {/* Number in the center */}
          <div className="w-5 h-5 rounded-full bg-v200 text text-xs font-semibold flex items-center justify-center shadow-sm flex-shrink-0">
            {book.orden}
          </div>

          {/* Heart on the right */}
          <div className={`transition-all duration-200 ${
            book.favorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <FavoriteButton
              isFavorite={book.favorite || false}
              onToggle={() => handleFavoriteClick()}
              size="sm"
              showTooltip={true}
              className="h-6 w-6"
            />
          </div>          
        </div>
      )
    }

    if (columnId === "title") {
      return (
        <div
          className="font-semibold text-slate-800 w-full relative flex items-center gap-2 cursor-pointer group/title"
          onClick={handleClickToEdit}
          onMouseEnter={() => setHoveredTitle(index)}
          onMouseLeave={() => setHoveredTitle(null)}
        >
          {/* Main title container that expands */}
          <div 
            className="flex-1 overflow-hidden"
            style={{ 
              minWidth: 0 // This is crucial for flexbox with text-overflow to work
            }}
          >
            <span 
              className="whitespace-nowrap text-ellipsis overflow-hidden block w-full"
              title={book.title}
            >
              {book.title}
            </span>
          </div>
          
          {/* View button that only appears on hover */}
          <div className="flex-shrink-0 opacity-0 group-hover/title:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-200 hover:scale-110"
              onClick={(e) => {
                e.stopPropagation()
                handleViewBook(book.id)
              }}
              title="View details"
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )
    }

    if (columnId === "days") {
      const days = book.start_date && book.end_date
        ? Math.ceil(
            (new Date(book.end_date).getTime() - new Date(book.start_date).getTime()) / (1000 * 60 * 60 * 24),
          )
        : null;

      // Only show if there's a calculated value
      if (!days) return null;

      return (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 font-semibold text-xs">
            {days}
          </span>
        </div>
      )
    }

    return (
      <div onClick={handleClickToEdit} className="cursor-pointer w-full h-full min-h-[24px] flex items-center">
        {renderDisplayValue(columnId, value, book.id)}
      </div>
    )
  }

  return (
    <div className="relative">
      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteBook}
        confirmVariant="destructive"
      />
      <Card className="bg-white/95 backdrop-blur-sm border-2 overflow-hidden relative rounded-2xl">
        <div className="overflow-x-auto" ref={tableContainerRef}>
          {/* GLOBAL OVERLAY for editing */}
          {editingCell && (<div className="fixed inset-0 bg-transparent z-40 cursor-default" onClick={() => setEditingCell(null)} />)}
          <table ref={tableRef} className="w-full text-sm relative table-fixed">
            <thead className="bg-gradient-to-r from-slate-50 via-purple-50 to-slate-50 border-b bordes">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.id}
                    className={`relative text-left p-1 font-semibold text-slate-700 border-r border-v100 last:border-r-0 text-xs ${
                      column.isSticky ? "sticky z-20 bg-gradient-to-r from-slate-50 via-v50 to-slate-50" : ""
                     } ${column.id === "number" ? "text-center" : ""}`}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                      left: column.isSticky ? column.left : undefined,
                    }}
                    draggable={!column.isSticky}
                    onDragStart={(e) => handleColumnDragStart(e, index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleColumnDrop(e, index)}
                  >
                    <div className={`flex items-center gap-1.5 ${column.id === "number" ? "justify-center" : ""}`}>
                      {!column.isSticky && (
                        <GripVertical className="h-3 w-3 text-slate-400 cursor-move hover:text-slate-600 transition-colors" />
                      )}
                      <span className="select-none">{column.label}</span>
                    </div>

                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-purple-300/40 transition-colors z-30 rounded-r"
                      onMouseDown={(e) => handleResizeStart(e, index)}
                      style={{
                        backgroundColor: resizingColumn === index ? "#a855f7" : "transparent",
                      }}
                    />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {books.map((book, bookIndex) => (
                <motion.tr
                  key={book.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: bookIndex * 0.04 }}
                  className="border-b bordes hover:bg-purple-100/50 transition-all duration-300 group h-4 rounded-md"
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`p-1 border-r border-v100 last:border-r-0 ${
                        column.isSticky ? "sticky bg-white/95 backdrop-blur-sm" : ""
                      } ${
                        editingCell?.rowId === book.id && editingCell.columnId === column.id
                          ? "z-[100]"
                          : column.isSticky
                            ? "z-10"
                            : ""
                      }`}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        left: column.isSticky ? column.left : undefined,
                        backgroundColor: column.isSticky ? "rgba(255, 255, 255, 0.95)" : "transparent",
                      }}
                    >
                      {renderCellContent(column.id, book, bookIndex)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}