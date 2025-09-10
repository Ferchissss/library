import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Book, Quote } from '@/lib/types'

export const useBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: async (): Promise<Book[]> => {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          author:author_id (*),
          series:series_id (*),
          genres:book_genre (genre:genres (*))
        `)
        .order('id', { ascending: false })
      
      if (error) throw error
      
      // Transformar la estructura de géneros
      return data.map(book => ({
        ...book,
        genres: book.genres?.map(g => g.genre) || []
      }))
    }
  })
}

export const useBookQuotes = () => {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: async (): Promise<Quote[]> => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
      
      if (error) throw error
      return data
    }
  })
}

export const useUpdateBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Book> }) => {
      const { error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      return { id, updates }
    },
    onSuccess: ({ id, updates }) => {
      // Actualizar la cache inmediatamente
      queryClient.setQueryData(['books'], (oldBooks: Book[] | undefined) => {
        if (!oldBooks) return oldBooks
        
        return oldBooks.map(book =>
          book.id === id
            ? { ...book, ...updates }
            : book
        )
      })
    }
  })
}

export const useUpdateBookGenres = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookId, genreIds }: { bookId: number; genreIds: number[] }) => {
      // Eliminar relaciones existentes
      const { error: deleteError } = await supabase
        .from("book_genre")
        .delete()
        .eq("book_id", bookId)

      if (deleteError) throw deleteError

      // Crear nuevas relaciones si hay géneros
      if (genreIds.length > 0) {
        const genreInserts = genreIds.map(genreId => ({
          book_id: bookId,
          genre_id: genreId
        }))

        const { error: insertError } = await supabase
          .from("book_genre")
          .insert(genreInserts)

        if (insertError) throw insertError
      }

      return { bookId, genreIds }
    },
    onSuccess: () => {
      // Invalidar la query para forzar refetch con los nuevos géneros
      queryClient.invalidateQueries({ queryKey: ['books'] })
    }
  })
}