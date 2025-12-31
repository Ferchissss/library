"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  alt: string
}

export default function ImageModal({ isOpen, onClose, imageUrl, alt }: ImageModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        
        <div className="h-[70vh] bg-gray-900/50 rounded-t-lg flex items-center justify-center p-4">
          <img
            src={imageUrl}
            alt={alt}
            className="h-full w-full object-contain"
          />
        </div>
        
        <div className="bg-black/80 backdrop-blur-sm rounded-b-lg p-4">
          <p className="text-white text-lg font-semibold text-center truncate">{alt}</p>
        </div>
      </div>
    </div>
  )
}