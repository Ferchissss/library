"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Quote } from "@/lib/types"
import { toast } from "sonner"

type DeleteQuoteProps = {
  quote: Quote
  onQuoteDeleted: (quoteId: number) => void
}

export function DeleteQuote({ quote, onQuoteDeleted }: DeleteQuoteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteQuote = async () => {
    try {
      setIsDeleting(true)

      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la cita')
      }

      onQuoteDeleted(quote.id!)
      setIsOpen(false)
      toast.success('¡Cita eliminada exitosamente!')
    } catch (error) {
      console.error('Error deleting quote:', error)
      toast.error('Error al eliminar la cita')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-800">Eliminar Cita</DialogTitle>
          <DialogDescription className="text-red-600">
            ¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <blockquote className="text-sm text-gray-600 italic border-l-4 border-gray-300 pl-3">
            "{quote.text.substring(0, 100)}{quote.text.length > 100 ? '...' : ''}"
          </blockquote>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteQuote}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Eliminando..." : "Eliminar Cita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}