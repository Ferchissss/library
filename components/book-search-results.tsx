"use client"

import { Book } from '@/lib/types'

interface BookSearchResultsProps {
  results: any[]
  onBookSelect: (book: any) => void
  loading: boolean
}

export function BookSearchResults({ results, onBookSelect, loading }: BookSearchResultsProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No se encontraron libros
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2">
      {results.map((book) => (
        <div 
          key={book.id}
          className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-white"
          onClick={() => onBookSelect(book)}
        >
          <div className="aspect-[3/4] mb-2 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            {book.volumeInfo.imageLinks?.thumbnail ? (
              <img 
                src={book.volumeInfo.imageLinks.thumbnail} 
                alt={book.volumeInfo.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-book.png'
                }}
              />
            ) : (
              <div className="text-gray-400 text-xs text-center p-2">
                Sin portada
              </div>
            )}
          </div>
          <h3 className="font-medium text-sm line-clamp-2 mb-1 text-gray-800">
            {book.volumeInfo.title}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-1">
            {book.volumeInfo.authors?.join(', ') || 'Autor desconocido'}
          </p>
          {book.volumeInfo.publishedDate && (
            <p className="text-xs text-gray-500 mt-1">
              {book.volumeInfo.publishedDate}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}