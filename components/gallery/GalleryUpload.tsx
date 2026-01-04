'use client'

import { useState, useRef, useEffect } from 'react'
import { FiUpload, FiCopy, FiCheck } from 'react-icons/fi'
import { useGallery } from './GalleryProvider'

function GalleryUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [lastUploadedUrl, setLastUploadedUrl] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setRefreshTrigger } = useGallery()

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile()
          if (blob) await uploadImage(blob)
          break
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  // Auto-clear after 5 seconds
  useEffect(() => {
    if (lastUploadedUrl) {
      const timer = setTimeout(() => {
        setLastUploadedUrl('')
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [lastUploadedUrl])

  const uploadImage = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setLastUploadedUrl(data.url)
      setRefreshTrigger((prev: boolean) => !prev)

    } catch (err) {
      console.error('Error:', err)
      alert('Error uploading image')
    } finally {
      setIsUploading(false)
      setIsDragging(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadImage(file)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      uploadImage(file)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(lastUploadedUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="w-84 bg-[#d1d9e6] rounded-lg shadow-md border border-[#8a9bb5] overflow-hidden">
      <div 
        className="p-0 px-8 border-b border-[#8a9bb5] bg-[#c1cad8] flex justify-between items-center"
      >
        <span className="text-sm font-medium text-gray-800">Upload image</span>
        <div className="relative">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-1 text-gray-700 hover:text-blue-600 transition-colors"
            title="Upload image"
            disabled={isUploading}
          >
            <FiUpload size={16} />
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
            disabled={isUploading}
          />
        </div>
      </div>
    
      <div 
        className={`p-0 transition-colors duration-200 ${isDragging ? 'bg-[#a3b0c5]' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="space-y-2 p-2">
            <div className="h-2 bg-[#b8c2d3] rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs text-gray-700 text-center">
              Uploading...
            </p>
          </div>
        ) : lastUploadedUrl ? (
          <div className="space-y-2 p-2">
            <div className="flex items-center justify-between bg-[#c1cad8] p-2 rounded">
              <span className="text-xs text-gray-800 truncate mr-2">
                {lastUploadedUrl.split('/').pop()}
              </span>
              <button 
                onClick={copyToClipboard}
                className="text-gray-700 hover:text-blue-600 transition-colors"
                title="Copy URL"
              >
                {isCopied ? <FiCheck size={14} /> : <FiCopy size={14} />}
              </button>
            </div>
            <p className="text-xs text-gray-700 text-center">
              Image uploaded ✓<br />
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-700 text-center py-2 px-1">
            Paste here
          </p>
        )}
      </div>
    </div>
  )
}

export default GalleryUpload