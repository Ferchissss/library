"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface CalendarProps {
  value?: string | null // ← Cambiar a string
  onChange?: (date: string) => void // ← Cambiar a string
  onClear?: () => void
}

export function Calendar({ value, onChange, onClear }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(value || null) // ← string

  // Ya no necesitamos useEffect complicado
  useEffect(() => {
    if (value) {
      setSelectedDate(value)
      // Solo actualizar currentDate si es necesario para navegación
      const [year, month] = value.split('-').map(Number)
      setCurrentDate(new Date(year, month - 1, 1))
    } else {
      setSelectedDate(null)
    }
  }, [value])

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ]
  const dayNames = ["Mo","Tu","We","Th","Fr","Sa","Su"]

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }
  const getPrevMonthDays = (date: Date) => {
    const daysInPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate()
    const firstDay = getFirstDayOfMonth(date)
    return Array.from({ length: firstDay }, (_, i) => daysInPrevMonth - firstDay + i + 1)
  }
  const getNextMonthDays = (date: Date) => {
    const daysInMonth = getDaysInMonth(date)
    const firstDay = getFirstDayOfMonth(date)
    const totalCells = firstDay + daysInMonth
    const nextMonthDays = (42 - totalCells) % 7
    return Array.from({ length: nextMonthDays }, (_, i) => i + 1)
  }

  const allDays = [
    ...getPrevMonthDays(currentDate).map(day => ({ day, isCurrentMonth: false, isPrevMonth: true })),
    ...Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => ({ day: i + 1, isCurrentMonth: true, isPrevMonth: false })),
    ...getNextMonthDays(currentDate).map(day => ({ day, isCurrentMonth: false, isPrevMonth: false })),
  ]

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    const [year, month, selectedDay] = selectedDate.split('-').map(Number)
    return day === selectedDay && 
           currentDate.getMonth() + 1 === month && 
           currentDate.getFullYear() === year
  }

  const handleSelectDate = (day: number) => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateString = `${year}-${month}-${dayStr}`
    
    setSelectedDate(dateString)
    onChange?.(dateString) // ← Envía string directamente
  }

  const handleClearDate = () => {
    setSelectedDate(null)
    onClear?.()
  }

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const monthName = monthNames[month - 1].slice(0,3)
    return `${monthName} ${day}, ${year}`
  }

  return (
    <div className="w-55 bg-card rounded-lg p-2 border border-border">
      {/* Date Display */}
      <div className="mb-2 pb-1 border-b border-border">
        <div className="flex items-center justify-between">
          <button className="text-xs font-semibold text-blue-600 focus:outline-none focus:text-blue-800 focus:bg-blue-50 focus:rounded-sm focus:px-1 transition-all duration-200">
            {selectedDate ? formatDisplayDate(selectedDate) : "Selecciona una fecha"}
          </button>
          {selectedDate && (
            <button
              onClick={handleClearDate}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-red-300"
              title="Eliminar fecha"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Month/Year Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <div className="flex gap-0.5">
          <button onClick={previousMonth} className="p-0.5 hover:bg-muted rounded-md transition-colors" aria-label="Previous month">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button onClick={nextMonth} className="p-0.5 hover:bg-muted rounded-md transition-colors" aria-label="Next month">
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-0.5">{day}</div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {allDays.map((item,index) => {
          const isCurrentMonth = item.isCurrentMonth
          const isTodayDate = isCurrentMonth && isToday(item.day)
          const isSelectedDate = isCurrentMonth && isSelected(item.day)

          return (
            <button
              key={index}
              onClick={() => isCurrentMonth && handleSelectDate(item.day)}
              className={`
                w-6 h-6 rounded-md text-xs font-medium transition-colors flex items-center justify-center
                ${isCurrentMonth ? "cursor-pointer hover:bg-muted" : "text-muted-foreground cursor-default"}
                ${isSelectedDate ? "bg-blue-600 text-white font-semibold"
                  : isTodayDate ? "bg-blue-200 text-foreground border border-blue-400"
                  : isCurrentMonth ? "bg-transparent text-foreground"
                  : "bg-transparent"}
              `}
              disabled={!isCurrentMonth}
            >
              {item.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}