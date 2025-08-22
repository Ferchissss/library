"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type ViewMode = "cards" | "table"

interface ViewModeContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar el estado desde localStorage al montar
  useEffect(() => {
    const savedViewMode = localStorage.getItem("library-view-mode")
    if (savedViewMode === "cards" || savedViewMode === "table") {
      setViewMode(savedViewMode)
    }
    setIsLoaded(true)
  }, [])

  // Guardar el estado en localStorage cada vez que cambie
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("library-view-mode", viewMode)
    }
  }, [viewMode, isLoaded])

  const value = {
    viewMode,
    setViewMode,
  }

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (context === undefined) {
    throw new Error("useViewMode must be used within a ViewModeProvider")
  }
  return context
}
