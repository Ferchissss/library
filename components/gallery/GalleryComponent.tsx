// components/gallery/GalleryComponent.tsx
'use client'

import { useState } from "react"
import { useGallery } from "./GalleryProvider"
import GalleryUpload from "./GalleryUpload"

function GalleryComponent() {
  const { sortOrder, setSortOrder, setRefreshTrigger } = useGallery()

  const handleSortChange = (order: 'normal' | 'random') => {
    setSortOrder(order)
    setRefreshTrigger((prev: boolean) => !prev)
  }

  return (
    <div className="p-2 bg-[#aab5c6] flex items-start justify-between rounded-md">
      <h1 className="font-limelight text-4xl font-bold mt-2 text-gray-900 ml-8">
        Gallery
      </h1>
      
      <div className="flex items-start gap-4">
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => handleSortChange('normal')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              sortOrder === 'normal' 
                ? 'bg-[#7a8ba5] text-white' 
                : 'bg-[#8a9bb5] hover:bg-[#7a8ba5] text-gray-900'
            }`}
          >
            Normal
          </button>
          <button 
            onClick={() => handleSortChange('random')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              sortOrder === 'random' 
                ? 'bg-[#7a8ba5] text-white' 
                : 'bg-[#8a9bb5] hover:bg-[#7a8ba5] text-gray-900'
            }`}
          >
            Random
          </button>
        </div>

        <GalleryUpload />
      </div>
    </div>
  )
}

export default GalleryComponent