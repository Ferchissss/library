// app/quotes/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Search, X, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddQuote } from "@/components/quotes/AddQuote"
import { Quote } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { EditQuote } from "@/components/quotes/EditQuote"

export default function Quotes() {
  const [quotesData, setQuotesData] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedType, setSelectedType] = useState("All")

  // Load quotes from API
  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/quotes')
      if (!response.ok) {
        throw new Error('Error loading quotes')
      }
      const data = await response.json()
      setQuotesData(data)
    } catch (error) {
      console.error('Error fetching quotes:', error)
      alert('Error loading quotes')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle new quote added
  const handleQuoteAdded = (newQuote: Quote) => {
    setQuotesData(prev => [newQuote, ...prev])
  }

  // Get all unique categories from existing quotes
  const existingCategories = Array.from(new Set(quotesData.map((quote) => quote.category).filter(Boolean) as string[]))

  const filteredQuotes = quotesData.filter((quote) => {
    const matchesSearch =
      quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.book?.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quote.book?.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || quote.category === selectedCategory
    const matchesType = selectedType === "All" || quote.type === selectedType

    return matchesSearch && matchesCategory && matchesType
  })

  const totalQuotes = quotesData.length
  const favoriteQuotes = quotesData.filter((q) => q.favorite).length

  const handleQuoteUpdated = (updatedQuote: Quote) => {
    setQuotesData(prev => 
      prev.map(quote => quote.id === updatedQuote.id ? updatedQuote : quote)
    )
  }

  const handleQuoteDeleted = (quoteId: number) => {
    setQuotesData(prev => prev.filter(quote => quote.id !== quoteId))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#edf3ec" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700">Loading quotes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#edf3ec" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header with add button */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Literary Quotes</h1>
            <p className="text-green-600">Your personal collection of memorable phrases</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all duration-200 bg-transparent h-9 sm:h-10"
              size="sm"
              onClick={fetchQuotes}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <AddQuote 
              onQuoteAdded={handleQuoteAdded}
              existingCategories={existingCategories}
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-700">Total Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">{totalQuotes}</div>
              <p className="text-sm text-green-600">saved phrases</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-700">Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">{favoriteQuotes}</div>
              <p className="text-sm text-green-600">highlighted quotes</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and search */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 h-5 w-5 z-10 pointer-events-none" />
              <Input
                placeholder="Search quotes, books or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 sm:h-10 bg-white/30 backdrop-blur-sm border-green-200 rounded-xl text-green-800 placeholder-green-400 focus:ring-green-300 text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-green-500 hover:text-green-700"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Filters - Inline */}
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-2">
              {/* Type Filter - Only types that exist in the DB */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-9 bg-white/30 backdrop-blur-sm border-green-200 rounded-xl text-green-800 focus:ring-green-300 text-sm w-32 sm:w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-sm border-green-200 rounded-xl">
                  <SelectItem value="All" className="text-green-800 focus:bg-green-50 focus:text-green-800">
                    All types
                  </SelectItem>
                  {Array.from(new Set(quotesData.map(quote => quote.type).filter(Boolean))).map((type) => (
                    <SelectItem 
                      key={type} 
                      value={type!}
                      className="text-green-800 focus:bg-green-50 focus:text-green-800"
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter - Only categories that exist in the DB */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 bg-white/30 backdrop-blur-sm border-green-200 rounded-xl text-green-800 focus:ring-green-300 text-sm w-32 sm:w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-sm border-green-200 rounded-xl">
                  <SelectItem value="All" className="text-green-800 focus:bg-green-50 focus:text-green-800">
                    All categories
                  </SelectItem>
                  {existingCategories.map((category) => (
                    <SelectItem 
                      key={category} 
                      value={category}
                      className="text-green-800 focus:bg-green-50 focus:text-green-800"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Button */}
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("All")
                  setSelectedCategory("All")
                }}
                disabled={!searchTerm && selectedType === "All" && selectedCategory === "All"}
                className="h-9 px-3 bg-white/30 backdrop-blur-sm border border-green-200 rounded-xl text-green-700 hover:bg-green-50 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" /> 
              </button>
            </div>
          </div>
        </div>

        {/* Quotes list */}
        <div className="space-y-2">
          {filteredQuotes.map((quote) => (
            <EditQuote
              key={quote.id}
              quote={quote}
              onQuoteUpdated={handleQuoteUpdated}
              onQuoteDeleted={handleQuoteDeleted}
            />
          ))}
        </div>

        {filteredQuotes.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No quotes found matching the selected filters.
              </p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting the filters or add a new quote.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}