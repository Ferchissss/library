"use client"
import { useState, useRef, useEffect } from "react"
import { Wand2, ImageIcon, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Series {
  id: number
  name: string
  cover: string
}

interface ImageDialogProps {
  series: Series
  onUpdateImage: (seriesId: number, newImageUrl: string) => Promise<void>
}

export default function ImageDialog({ series, onUpdateImage }: ImageDialogProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'edit' | 'ai'>('edit')
  const [imageUrl, setImageUrl] = useState(
    series.cover && !series.cover.includes('/placeholder.svg') 
      ? series.cover 
      : ''
  )
  const [loading, setLoading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState(series.name)
  const [aiLoading, setAiLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      // Usar requestAnimationFrame para asegurar que el input está en el DOM
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.select()
        }
      })
    }
  }, [open]) 

  const handleSave = async () => {
    if (!imageUrl.trim()) return
    setLoading(true)
    try {
      await onUpdateImage(series.id, imageUrl)
      setOpen(false)
    } catch (error) {
      console.error('Failed to update image:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)

    try {
      const res = await fetch("/api/generate-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      })

      const data = await res.json()

      if (data.imageUrl) {
        setImageUrl(data.imageUrl)
      } else {
        console.error("AI error:", data)
      }
    } catch (error) {
      console.error("Failed to generate AI image:", error)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <img
            src={series.cover}
            alt={series.name}
            className="w-16 h-24 object-cover rounded-md shadow-md transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-sm border-yellow-200">
        <DialogHeader>
          <DialogTitle className="text-yellow-800">Update Cover Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-yellow-50/50 rounded-lg border border-yellow-200">
            {imageUrl && !imageUrl.includes('/placeholder.svg') ? (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-32 h-48 object-cover rounded-md shadow-md mb-4"
              />
            ) : (
              <div className="w-32 h-48 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-md shadow-md flex items-center justify-center mb-4">
                <span className="text-sm text-amber-800 font-medium text-center px-2">
                  {series.name}
                </span>
              </div>
            )}
            <p className="text-sm text-yellow-600 text-center">{series.name}</p>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-yellow-200">
            <button
              className={`flex-1 py-2 text-sm font-medium ${mode === 'edit' ? 'text-yellow-700 border-b-2 border-yellow-500' : 'text-yellow-500'}`}
              onClick={() => setMode('edit')}
            >
              Edit URL
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${mode === 'ai' ? 'text-yellow-700 border-b-2 border-yellow-500' : 'text-yellow-500'}`}
              onClick={() => setMode('ai')}
            >
              Generate with AI
            </button>
          </div>

          {/* Edit Mode */}
          {mode === 'edit' && (
            <div className="space-y-3">
              <Label htmlFor="image-url" className="text-yellow-700">Image URL</Label>
              <Input
                ref={inputRef}
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-white border-yellow-200 text-yellow-800 focus:ring-yellow-400"
                onFocus={(e) => e.target.select()}
                autoFocus
              />
            </div>
          )}

          {/* AI Mode */}
          {mode === 'ai' && (
            <div className="space-y-3">
              <Label htmlFor="ai-prompt" className="text-yellow-700">AI Prompt</Label>
              <div className="space-y-2">
                <Input
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the cover image you want..."
                  className="bg-white border-yellow-200 text-yellow-800 focus:ring-yellow-400"
                />
                <Button
                  onClick={handleGenerateAI}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Cover
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !imageUrl.trim()}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Image
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}