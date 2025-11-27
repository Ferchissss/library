"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useState } from "react"
import { AlertTriangle, Loader } from "lucide-react"
import type { Author } from "@/lib/types"

interface DeleteAuthorDialogProps {
  author: Author | null
  isOpen: boolean
  onClose: () => void
  onAuthorDeleted: () => void
}

export default function DeleteAuthorDialog({ author, isOpen, onClose, onAuthorDeleted }: DeleteAuthorDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!author) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/authors/${author.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error deleting author")

      toast.success(`${author.name} has been successfully deleted`)
      onAuthorDeleted()
      onClose()
    } catch (error) {
      console.error("Error:", error)
      toast.error("There was a problem deleting the author")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!author) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Author
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{author.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          This action will delete the author from your database.
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}