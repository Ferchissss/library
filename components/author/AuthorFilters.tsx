"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AuthorFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  continentFilter: string
  onContinentChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  booksFilter: string
  onBooksChange: (value: string) => void
  onClearFilters: () => void
  uniqueContinents: string[]
  filteredCount: number
  totalCount: number
}

export function AuthorFilters({
  searchQuery,
  onSearchChange,
  continentFilter,
  onContinentChange,
  statusFilter,
  onStatusChange,
  booksFilter,
  onBooksChange,
  onClearFilters,
  uniqueContinents,
  filteredCount,
  totalCount
}: AuthorFiltersProps) {
  const hasActiveFilters = searchQuery !== "" || continentFilter !== "all" || statusFilter !== "all" || booksFilter !== "all"

  return (
    <div className="mb-4">
      {/* Search and Filters Row - IDENTICAL to your example */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
          {/* Search  */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 h-5 w-5 z-10 pointer-events-none" />
            <Input
              placeholder="Search authors..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 sm:h-10 bg-white/30 backdrop-blur-sm border-blue-200 rounded-xl text-blue-800 placeholder-blue-400 focus:ring-blue-300 text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-blue-500 hover:text-blue-700"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {/* Filters - Inline like your example */}
          <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-2">
            {/* Continent Filter */}
            <Select value={continentFilter} onValueChange={onContinentChange}>
              <SelectTrigger className="h-9 bg-white/30 backdrop-blur-sm border-blue-200 rounded-xl text-blue-800 focus:ring-blue-300 text-sm w-32 sm:w-36">
                <SelectValue placeholder="Continent" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-sm border-blue-200 rounded-xl">
                <SelectItem value="all" className="text-blue-800 focus:bg-blue-50 focus:text-blue-800">All continents</SelectItem>
                {uniqueContinents.map(continent => (
                  <SelectItem 
                    key={continent} 
                    value={continent}
                    className="text-blue-800 focus:bg-blue-50 focus:text-blue-800"
                  >
                    {continent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9 bg-white/30 backdrop-blur-sm border-blue-200 rounded-xl text-blue-800 focus:ring-blue-300 text-sm w-28 sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-sm border-blue-200 rounded-xl">
                <SelectItem value="all" className="text-blue-800 focus:bg-blue-50 focus:text-blue-800">All</SelectItem>
                <SelectItem value="alive" className="text-blue-800 focus:bg-blue-50 focus:text-blue-800">Alive</SelectItem>
                <SelectItem value="dead" className="text-blue-800 focus:bg-blue-50 focus:text-blue-800">Deceased</SelectItem>
              </SelectContent>
            </Select>

            {/* Books Filter */}
            <Select value={booksFilter} onValueChange={onBooksChange}>
              <SelectTrigger className="h-9 bg-white/30 backdrop-blur-sm border-blue-200 rounded-xl text-blue-800 focus:ring-blue-300 text-sm w-28 sm:w-32">
                <SelectValue placeholder="Books" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-sm border-blue-200 rounded-xl">
                <SelectItem value="all" className="text-blue-800 focus:bg-blue-50 focus:text-blue-800">Any books</SelectItem>
                <SelectItem value="1" className="text-blue-800 focus:bg-blue-50 focus:text-blue-800">1 book</SelectItem>
                <SelectItem value="2-5" className="text-blue-800 focus:bg-blue-50 focus:text-blue-800">2-5 books</SelectItem>
                <SelectItem value="6-10" className="text-blue-800 focus:bg-blue-50 focus:text-blue-800">6-10 books</SelectItem>
                <SelectItem value="10+" className="text-blue-800 focus:bg-blue-50 focus:text-blue-800">10+ books</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Button */}
            <button
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className="h-9 px-3 bg-white/30 backdrop-blur-sm border border-blue-200 rounded-xl text-blue-700 hover:bg-blue-50 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" /> 
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}