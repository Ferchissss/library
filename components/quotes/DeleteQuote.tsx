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
        throw new Error('Error deleting quote')
      }

      onQuoteDeleted(quote.id!)
      setIsOpen(false)
      toast.success('Quote successfully deleted!')
    } catch (error) {
      console.error('Error deleting quote:', error)
      toast.error('Error deleting quote')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-800">
            Delete Quote
          </DialogTitle>
          <DialogDescription className="text-green-600">
            Are you sure you want to delete this quote? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <blockquote className="text-sm text-green-700 italic border-l-4 border-green-300 pl-3">
            "{quote.text.substring(0, 100)}{quote.text.length > 100 ? '...' : ''}"
          </blockquote>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteQuote}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Quote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}