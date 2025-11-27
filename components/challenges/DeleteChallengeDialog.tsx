"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Challenge } from "@/lib/types"

interface DeleteChallengeDialogProps {
  challenge: Challenge | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (challengeId: number) => void
  loading?: boolean
}

export function DeleteChallengeDialog({
  challenge,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: DeleteChallengeDialogProps) {
  if (!challenge) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn("bg-white/95 backdrop-blur-sm border-2 border-orange-200 rounded-2xl shadow-lg")}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-orange-900 font-bold text-lg">
            Delete challenge?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-orange-700">
            Are you sure you want to delete "{challenge.name}"? This action cannot be undone and all progress will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button 
              variant="outline" 
              className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300"
              disabled={loading}
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={() => onConfirm(challenge.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}