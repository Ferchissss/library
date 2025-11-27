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
            ? "button2 text-white" 
            : "button-tran2"
          }`}
      >
        <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
        </div>
        Covers
      </Button>

      <Button
        variant={viewMode === "table" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("table")}
        className={`gap-2 
          ${viewMode === "table" 
            ? "button2 text-white" 
            : "button-tran2"
          }`}
      >
        <div className="flex flex-col gap-0.5 w-3 h-3">
          <div className="bg-current h-0.5 rounded"></div>
          <div className="bg-current h-0.5 rounded"></div>
          <div className="bg-current h-0.5 rounded"></div>
        </div>
        List
      </Button>
    </div>
  )
}
