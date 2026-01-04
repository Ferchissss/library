// components/gallery/GalleryProvider.tsx
'use client'

import { createContext, useContext, useState } from 'react';

interface GalleryContextType {
  refreshTrigger: boolean;
  setRefreshTrigger: (value: boolean | ((prev: boolean) => boolean)) => void;
  sortOrder: 'normal' | 'random';
  setSortOrder: (order: 'normal' | 'random') => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [sortOrder, setSortOrder] = useState<'normal' | 'random'>('normal');

  return (
    <GalleryContext.Provider value={{ 
      refreshTrigger, 
      setRefreshTrigger,
      sortOrder,
      setSortOrder
    }}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
}