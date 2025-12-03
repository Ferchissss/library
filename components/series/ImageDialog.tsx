"use client"
import { useState, useRef, useEffect } from "react"
import { Wand2, ImageIcon, Save, Loader2, AlertCircle, RefreshCw, Trash2, Eye, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createPortal } from "react-dom"

interface Series {
  id: number
  name: string
  author: string
  genre: string
  cover: string
}

interface ImageDialogProps {
  series: Series
  onUpdateImage: (seriesId: number, newImageUrl: string) => Promise<void>
}

interface GeneratedImage {
  url: string
  timestamp: number
  prompt: string
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
  
  // Simple function that generates ONE generic prompt using the series genre
  const generateAutoPrompt = () => {
    return `Professional ${series.genre} book cover for "${series.name}" by ${series.author}, dramatic lighting, detailed illustration, vibrant colors, high quality cover art, trending on artstation`
  }
  
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
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
    setAiLoading(true)
    setAiError(null)
    
    try {
      // Always use the generic prompt as base
      const basePrompt = generateAutoPrompt()
      // If user wrote something, add it at the end
      const finalPrompt = aiPrompt.trim() 
        ? `${basePrompt}, ${aiPrompt.trim()}`
        : basePrompt
      
      const response = await fetch('/api/generate-cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.retry && (response.status === 503 || response.status === 410)) {
          setAiError(`${data.error} - Retrying in 5 seconds...`)
          setTimeout(() => {
            setAiError(null)
            handleGenerateAI()
          }, 5000)
          return
        }
        throw new Error(data.error || 'Failed to generate image')
      }

      if (data.imageUrl) {
        // Add to generated images history
        const newImage: GeneratedImage = {
          url: data.imageUrl,
          timestamp: Date.now(),
          prompt: finalPrompt
        }
        setGeneratedImages(prev => [newImage, ...prev]) // Most recent first
        
        // Automatically select the new image
        setImageUrl(data.imageUrl)
      }
    } catch (error) {
      console.error('Failed to generate AI image:', error)
      setAiError(error instanceof Error ? error.message : 'Failed to generate image')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSelectImage = (url: string) => {
    setImageUrl(url)
    setMode('edit')
  }

  const handleDeleteImage = (timestamp: number) => {
    setGeneratedImages(prev => prev.filter(img => img.timestamp !== timestamp))
  }

  const handleViewImage = (url: string) => {
    setViewImageUrl(url)
  }

  const handleCloseViewImage = () => {
    setViewImageUrl(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="relative group cursor-pointer">
            <img
              src={series.cover}
              alt={series.name}
              className="w-16 h-24 object-cover rounded-md shadow-md transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex flex-col items-center justify-center gap-1 p-1">
              {/* View button - top */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewImage(series.cover)
                }}
                className="p-1.5 bg-white/80 hover:bg-white rounded-full transition-all hover:scale-110"
                title="View image"
              >
                <Eye className="h-3 w-3 text-gray-700" />
              </button>
              
              {/* Edit button - bottom */}
              <button
                className="p-1.5 bg-white/80 hover:bg-white rounded-full transition-all hover:scale-110"
                title="Edit image"
              >
                <Edit className="h-3 w-3 text-gray-700" />
              </button>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl bg-white/90 backdrop-blur-sm border-yellow-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-yellow-800">Update Cover Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Larger preview */}
            <div className="flex flex-col items-center justify-center p-4 bg-yellow-50/50 rounded-lg border border-yellow-200">
              {imageUrl && !imageUrl.includes('/placeholder.svg') ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-48 h-72 object-cover rounded-md shadow-lg mb-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      setAiError('Failed to load generated image')
                    }}
                  />
                  {aiLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                      <Loader2 className="h-12 w-12 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-48 h-72 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-md shadow-lg flex items-center justify-center mb-4">
                  {aiLoading ? (
                    <Loader2 className="h-12 w-12 text-amber-800 animate-spin" />
                  ) : (
                    <span className="text-base text-amber-800 font-medium text-center px-4">
                      {series.name}
                    </span>
                  )}
                </div>
              )}
              <p className="text-sm text-yellow-600 text-center font-medium">{series.name}</p>
              <p className="text-xs text-yellow-500 text-center">{series.genre}</p>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-prompt" className="text-yellow-700">
                    Custom Prompt <span className="text-xs text-yellow-500">(optional)</span>
                  </Label>
                  {generatedImages.length > 0 && (
                    <span className="text-xs text-yellow-600">
                      Generated: {generatedImages.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {/* Info about automatic prompt */}
                  <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                    💡 Your text will be added to the base prompt: <br/>
                    <span className="italic text-yellow-500">"{generateAutoPrompt().substring(0, 80)}..."</span>
                  </div>
                  
                  <Textarea
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={`Add specific details...\n\nExample: "with dragons flying, fire elements, dark moody atmosphere, night scene"`}
                    className="bg-white border-yellow-200 text-yellow-800 focus:ring-yellow-400 min-h-[80px] resize-none"
                    rows={3}
                  />
                  
                  {/* Error or info messages */}
                  {aiError && (
                    <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-red-50 border border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-red-700">{aiError}</span>
                    </div>
                  )}
                  
                  {aiLoading && !aiError && (
                    <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <Loader2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" />
                      <span className="text-blue-700">
                        {aiPrompt.trim() 
                          ? 'Generating with your custom prompt...' 
                          : `Generating ${series.genre} cover for "${series.name}"...`
                        } (5-15 seconds)
                      </span>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateAI}
                    disabled={aiLoading}
                    className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        {generatedImages.length > 0 ? (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        ) : (
                          <Wand2 className="h-4 w-4 mr-2" />
                        )}
                        {generatedImages.length > 0 ? 'Generate Another' : 'Generate Cover'}
                      </>
                    )}
                  </Button>
                </div>

                {/* Generated images history */}
                {generatedImages.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-yellow-700">Generated Covers ({generatedImages.length})</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2 bg-yellow-50/30 rounded-lg border border-yellow-200">
                      {generatedImages.map((img) => (
                        <div 
                          key={img.timestamp}
                          className="relative group"
                        >
                          <img
                            src={img.url}
                            alt="Generated"
                            className={`w-full h-32 object-cover rounded cursor-pointer transition-all ${
                              imageUrl === img.url 
                                ? 'ring-2 ring-yellow-500 shadow-lg' 
                                : 'hover:ring-2 hover:ring-yellow-300 opacity-80 hover:opacity-100'
                            }`}
                          />
                          {imageUrl === img.url && (
                            <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded">
                              Selected
                            </div>
                          )}
                          
                          {/* Action buttons on hover */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewImage(img.url)
                              }}
                              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                              title="View full size"
                            >
                              <Eye className="h-4 w-4 text-gray-700" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectImage(img.url)
                              }}
                              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                              title="Select this image"
                            >
                              <Edit className="h-4 w-4 text-gray-700" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteImage(img.timestamp)
                              }}
                              className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                              title="Delete image"
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </button>
                          </div>
                          
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                            {img.prompt.substring(0, 50)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                disabled={loading || !imageUrl.trim() || aiLoading}
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

      {/* Portal for the view modal */}
      {viewImageUrl && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
          <button
            onClick={handleCloseViewImage}
            className="absolute top-6 right-6 z-[101] text-white hover:text-gray-300 text-3xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ✕
          </button>
          
          <img
            src={viewImageUrl}
            alt="Full size preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  )
}