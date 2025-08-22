"use client"

import { Button } from "@/components/ui/button"
import { useViewMode } from "./view-mode-provider"

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={viewMode === "cards" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("cards")}
        className={`gap-2 
          ${viewMode === "cards" 
            ? "bg-violet-200 text-violet-900 hover:bg-violet-300" 
            : "border-violet-300 text-violet-600 hover:bg-violet-100"
          }`}
      >
        <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
        </div>
        Portadas
      </Button>

      <Button
        variant={viewMode === "table" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("table")}
        className={`gap-2 
          ${viewMode === "table" 
            ? "bg-violet-200 text-violet-900 hover:bg-violet-300" 
            : "border-violet-300 text-violet-600 hover:bg-violet-100"
          }`}
      >
        <div className="flex flex-col gap-0.5 w-3 h-3">
          <div className="bg-current h-0.5 rounded"></div>
          <div className="bg-current h-0.5 rounded"></div>
          <div className="bg-current h-0.5 rounded"></div>
        </div>
        Lista
      </Button>
    </div>
  )
}
