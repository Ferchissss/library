// components/gallery/GalleryUpload.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { collection, addDoc } from 'firebase/firestore'
import { FiUpload, FiCopy, FiCheck } from 'react-icons/fi'
import { useGallery } from './GalleryProvider'
import { db } from '@/lib/firebase'

function GalleryUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [lastUploadedUrl, setLastUploadedUrl] = useState('')
  const [isCopied, setIsCopied] = useState(false)
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

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'blog_update')

    try {
      const res = await axios.post('https://api.cloudinary.com/v1_1/dxbztyyio/upload', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        }
      })
      
      const imageUrl = res.data.secure_url
      const publicId = res.data.public_id
      
      setLastUploadedUrl(imageUrl)

      await addDoc(collection(db, 'gallery'), {
        url: imageUrl,
        publicId: publicId,
        createdAt: new Date(),
        name: file.name || 'Pasted image',
        size: file.size,
        type: file.type
      })
      
      setRefreshTrigger((prev: boolean) => !prev)

    } catch (err) {
      console.error('Error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadImage(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    uploadImage(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <span className="text-sm font-medium text-gray-800">Upload image</span>
        <div className="relative">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-1 text-gray-700 hover:text-blue-600 transition-colors"
            title="Subir imagen"
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
    
      <div className="p-0">
        {isUploading ? (
          <div className="space-y-2">
            <div className="h-2 bg-[#b8c2d3] rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-700 text-center">
              Subiendo... {uploadProgress}%
            </p>
          </div>
        ) : lastUploadedUrl ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-[#c1cad8] p-2 rounded">
              <span className="text-xs text-gray-800 truncate mr-2">
                {lastUploadedUrl.split('/').pop()}
              </span>
              <button 
                onClick={copyToClipboard}
                className="text-gray-700 hover:text-blue-600 transition-colors"
                title="Copiar URL"
              >
                {isCopied ? <FiCheck size={14} /> : <FiCopy size={14} />}
              </button>
            </div>
            <p className="text-xs text-gray-700 text-center">
              Imagen subida ✓<br />
              Pegar (Ctrl+V) también funciona
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-700 text-center py-1">
            Arrastra una imagen aquí
            o haz clic en el icono de arriba
          </p>
        )}
      </div>
    </div>
  )
}

export default GalleryUpload