// components/stats/TimelineStats.tsx
"use client"

import type React from "react"
import { useState, useRef } from "react"

interface TimelineBook {
  id: number
  title: string
  author: string
  start_date: string
  end_date: string
  rating: number
  genre: string
  pages: number
}

interface TimelineStatsProps {
  books: TimelineBook[]
}

export function TimelineStats({ books }: TimelineStatsProps) {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "year">("month")
  const [selectedBook, setSelectedBook] = useState<TimelineBook | null>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const mainScrollRef = useRef<HTMLDivElement>(null)

  // If there are no books, show empty state
  if (!books || books.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg border border-red-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">No reading data</h3>
          <p className="text-red-600">Start adding books to see your reading timeline</p>
        </div>
      </div>
    )
  }

  // Calculate minimum and maximum dates
  const allDates = books
    .flatMap((b) => [new Date(b.start_date), new Date(b.end_date)])
    .filter((date) => !isNaN(date.getTime()))

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())))

  // Generate columns based on view mode
  const generateColumns = () => {
    const columns: Array<{
      date: Date
      label: string
      month: string
      subtitle: string
    }> = []

    const start = new Date(minDate)
    const end = new Date(maxDate)

    if (viewMode === "day") {
      const current = new Date(start)
      while (current <= end) {
        const dayName = current.toLocaleDateString("en-US", { weekday: "short" })
        const monthName = current.toLocaleDateString("en-US", { month: "short" })
        columns.push({
          date: new Date(current),
          label: current.getDate().toString(),
          month: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${current.getFullYear()}`,
          subtitle: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        })
        current.setDate(current.getDate() + 1)
      }
    } else if (viewMode === "week") {
      const current = new Date(start)

      // Go back to Monday of the first week
      while (current.getDay() !== 1) {
        current.setDate(current.getDate() - 1)
      }

      while (current <= end || (current <= end && current.getDay() !== 1)) {
        const weekStart = new Date(current)
        const weekEnd = new Date(current)
        weekEnd.setDate(weekEnd.getDate() + 6)

        const startDay = weekStart.getDate()
        const endDay = weekEnd.getDate()
        const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" })
        const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" })
        const year = weekStart.getFullYear()

        let dateRange: string
        let monthYear: string

        if (weekStart.getMonth() === weekEnd.getMonth()) {
          // Same month: "1 - 7"
          dateRange = `${startDay} - ${endDay}`
          monthYear = `${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} ${year}`
        } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
          // Same year, different month: "28 Jan - 3 Feb"
          dateRange = `${startDay} ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} - ${endDay} ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)}`
          monthYear = `${year}`
        } else {
          // Different year: "30 Dec 2024 - 5 Jan 2025"
          dateRange = `${startDay} ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} ${weekStart.getFullYear()} - ${endDay} ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)} ${weekEnd.getFullYear()}`
          monthYear = ""
        }

        columns.push({
          date: new Date(weekStart),
          label: dateRange,
          month: monthYear,
          subtitle: "",
        })

        current.setDate(current.getDate() + 7)

        // Exit if we've passed the end
        if (current > end && current.getDate() > 7) {
          break
        }
      }
    } else if (viewMode === "month") {
      const current = new Date(start.getFullYear(), start.getMonth(), 1)
      while (current <= end) {
        const monthName = current.toLocaleDateString("en-US", { month: "long" })
        columns.push({
          date: new Date(current),
          label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          month: current.getFullYear().toString(),
          subtitle: "",
        })
        current.setMonth(current.getMonth() + 1)
      }
    } else if (viewMode === "year") {
      const startYear = start.getFullYear()
      const endYear = end.getFullYear()
      for (let year = startYear; year <= endYear; year++) {
        columns.push({
          date: new Date(year, 0, 1),
          label: year.toString(),
          month: "",
          subtitle: "",
        })
      }
    }

    return columns
  }

  const columns = generateColumns()

  // Calculate position and width of each task
  const calculateTaskPosition = (book: TimelineBook) => {
    const startDate = new Date(book.start_date)
    const endDate = new Date(book.end_date)

    const totalDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    const startDays = (startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)

    const totalWidth =
      columns.length * (viewMode === "day" ? 50 : viewMode === "week" ? 80 : viewMode === "month" ? 100 : 150)
    const left = (startDays / totalDays) * totalWidth
    const width = (durationDays / totalDays) * totalWidth

    return { left, width: Math.max(width, 20) }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft)
  }

  const columnWidth = viewMode === "day" ? 65 : viewMode === "week" ? 110 : viewMode === "month" ? 120 : 150
  const rowHeight = 50

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-red-800 mb-2">Reading Timeline</h2>
        <p className="text-red-600">Visualize all your read books in an interactive timeline</p>
      </div>

      {/* View Mode Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="font-medium text-red-700 mr-2">View:</span>
        {[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
          { value: "year", label: "Year" },
        ].map((mode) => (
          <button
            key={mode.value}
            onClick={() => setViewMode(mode.value as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              viewMode === mode.value
                ? "bg-red-500 text-white border border-red-500"
                : "bg-white text-red-700 border border-red-300"
            }`}
          >
            {mode.label}
          </button>
        ))}

        {/* TODAY Button */}
        <button
          onClick={() => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // Find the column that corresponds to today
            let todayColumnIndex = -1

            for (let i = 0; i < columns.length; i++) {
              const col = columns[i]
              const colDate = new Date(col.date)
              colDate.setHours(0, 0, 0, 0)

              if (viewMode === "day") {
                if (colDate.getTime() === today.getTime()) {
                  todayColumnIndex = i
                  break
                }
              } else if (viewMode === "week") {
                const weekEnd = new Date(colDate)
                weekEnd.setDate(weekEnd.getDate() + 6)
                weekEnd.setHours(23, 59, 59, 999)
                if (today >= colDate && today <= weekEnd) {
                  todayColumnIndex = i
                  break
                }
              } else if (viewMode === "month") {
                if (colDate.getMonth() === today.getMonth() && colDate.getFullYear() === today.getFullYear()) {
                  todayColumnIndex = i
                  break
                }
              } else if (viewMode === "year") {
                if (colDate.getFullYear() === today.getFullYear()) {
                  todayColumnIndex = i
                  break
                }
              }
            }

            if (todayColumnIndex !== -1 && mainScrollRef.current) {
              const scrollPosition =
                todayColumnIndex * columnWidth - mainScrollRef.current.clientWidth / 2 + columnWidth / 2
              mainScrollRef.current.scrollLeft = Math.max(0, scrollPosition)
            } else {
              alert("Current date is not visible in the timeline data range.")
            }
          }}
          className="px-4 py-2 rounded-full text-sm font-semibold border border-red-500 text-red-500 bg-white hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5 ml-2"
        >
         Today
        </button>
      </div>

      {/* Selected Book Modal */}
      {selectedBook && (
        <>
          {/* Modal Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn"
            onClick={() => setSelectedBook(null)}
          >
            {/* Modal Content */}
            <div
              className="bg-white rounded-2xl p-8 max-w-md w-[90%] max-h-[80vh] overflow-auto shadow-xl animate-slideUp relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
              >
                ×
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedBook.title}</h2>

              {/* Author */}
              <p className="text-lg text-gray-600 mb-6 italic">by {selectedBook.author}</p>

              {/* Divider */}
              <div className="h-px bg-gray-200 mb-6" />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Genre</div>
                  <div className="text-base font-medium text-gray-800">{selectedBook.genre}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Pages</div>
                  <div className="text-base font-medium text-gray-800">{selectedBook.pages}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Start</div>
                  <div className="text-base font-medium text-gray-800">
                    {new Date(selectedBook.start_date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">End</div>
                  <div className="text-base font-medium text-gray-800">
                    {new Date(selectedBook.end_date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rating</div>
                <div className="flex gap-1 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= selectedBook.rating ? "text-red-500" : "text-gray-300"}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Timeline Container */}
      <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
        {/* Calendar Header Row */}
        <div className="flex border-b-2 border-red-500 relative">
          {/* Task List Header */}
          <div className="w-64 min-w-64 p-4 bg-red-500 text-white font-semibold text-center border-r-2 border-red-700 sticky left-0 z-10">
            Books
          </div>

          {/* Calendar Header */}
          <div className="flex-1 overflow-hidden relative">
            <div className="flex bg-red-50 min-w-max" style={{ transform: `translateX(-${scrollLeft}px)` }}>
              {columns.map((col, idx) => {
                const isWeekend = col.date.getDay() === 0 || col.date.getDay() === 6

                return (
                  <div
                    key={idx}
                    className={`w-[${columnWidth}px] min-w-[${columnWidth}px] py-2.5 px-1 text-center border-r border-red-300 text-sm font-medium flex flex-col gap-0.5 ${
                      isWeekend && viewMode === "day" ? "bg-red-25" : "bg-red-50"
                    }`}
                    style={{ width: columnWidth, minWidth: columnWidth }}
                  >
                    {col.subtitle && (
                      <div className="text-red-900 text-xs font-semibold uppercase tracking-wider">{col.subtitle}</div>
                    )}

                    <div
                      className={`text-red-800 font-bold ${
                        viewMode === "day" ? "text-lg" : viewMode === "week" ? "text-sm" : "text-base"
                      }`}
                    >
                      {col.label}
                    </div>

                    {col.month && <div className="text-red-900 text-xs font-medium">{col.month}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div ref={mainScrollRef} className="flex max-h-[600px] overflow-auto relative" onScroll={handleScroll}>
          {/* Task List */}
          <div className="w-64 min-w-64 border-r-2 border-gray-200 sticky left-0 bg-white z-10">
            {books.map((book, idx) => (
              <div
                key={book.id}
                className={`h-[${rowHeight}px] flex items-center px-3 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedBook?.id === book.id ? "bg-red-50" : idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
                style={{ height: rowHeight }}
                onClick={() => setSelectedBook(book)}
                onMouseEnter={(e) => {
                  if (selectedBook?.id !== book.id) {
                    e.currentTarget.classList.add("bg-red-50")
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedBook?.id !== book.id) {
                    e.currentTarget.classList.remove("bg-red-50")
                    e.currentTarget.classList.add(idx % 2 === 0 ? "bg-white" : "bg-gray-50")
                  }
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{book.title}</div>
                  <div className="text-xs text-gray-600 mt-0.5 truncate">{book.author}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Grid */}
          <div className="flex-1 relative min-w-max">
            {/* Grid Background */}
            <div className="flex">
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  className="border-r border-gray-100"
                  style={{
                    width: columnWidth,
                    minWidth: columnWidth,
                    height: books.length * rowHeight,
                    backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                  }}
                />
              ))}
            </div>

            {/* Horizontal Grid Lines */}
            {books.map((_, idx) => (
              <div
                key={idx}
                className="absolute left-0 right-0 h-px bg-gray-100"
                style={{ top: (idx + 1) * rowHeight }}
              />
            ))}

            {/* Task Bars */}
            {books.map((book, idx) => {
              const { left, width } = calculateTaskPosition(book)
              const barHeight = 32

              return (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className="absolute rounded-lg cursor-pointer flex items-center justify-center text-white text-xs font-medium px-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    top: idx * rowHeight + (rowHeight - barHeight) / 2,
                    left: left,
                    width: Math.max(width, 20),
                    height: barHeight,
                    backgroundColor: selectedBook?.id === book.id ? "#dc2626" : "#ef4444",
                    minWidth: 20,
                  }}
                >
                  <span className="truncate w-full text-center">{width > 100 ? book.title : ""}</span>
                </div>
              )
            })}

            {/* TODAY vertical line */}
            {(() => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)

              let todayPosition = -1

              for (let i = 0; i < columns.length; i++) {
                const col = columns[i]
                const colDate = new Date(col.date)
                colDate.setHours(0, 0, 0, 0)

                if (viewMode === "day") {
                  if (colDate.getTime() === today.getTime()) {
                    todayPosition = i * columnWidth + columnWidth / 2
                    break
                  }
                } else if (viewMode === "week") {
                  const weekEnd = new Date(colDate)
                  weekEnd.setDate(weekEnd.getDate() + 6)
                  weekEnd.setHours(23, 59, 59, 999)
                  if (today >= colDate && today <= weekEnd) {
                    const daysFromStart = Math.floor((today.getTime() - colDate.getTime()) / (1000 * 60 * 60 * 24))
                    todayPosition = i * columnWidth + (daysFromStart / 7) * columnWidth
                    break
                  }
                } else if (viewMode === "month") {
                  if (colDate.getMonth() === today.getMonth() && colDate.getFullYear() === today.getFullYear()) {
                    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
                    const dayOfMonth = today.getDate()
                    todayPosition = i * columnWidth + (dayOfMonth / daysInMonth) * columnWidth
                    break
                  }
                } else if (viewMode === "year") {
                  if (colDate.getFullYear() === today.getFullYear()) {
                    const startOfYear = new Date(today.getFullYear(), 0, 1)
                    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
                    const daysInYear = 365 + (new Date(today.getFullYear(), 1, 29).getDate() === 29 ? 1 : 0)
                    todayPosition = i * columnWidth + (dayOfYear / daysInYear) * columnWidth
                    break
                  }
                }
              }

              if (todayPosition !== -1) {
                return (
                  <>
                    <div
                      className="absolute top-0 w-0.5 z-10 shadow-lg shadow-red-500/50"
                      style={{
                        left: todayPosition,
                        height: books.length * rowHeight,
                        backgroundColor: "#ef4444",
                      }}
                    />
                    <div
                      className="absolute px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded z-20 shadow"
                      style={{
                        left: todayPosition - 25,
                        top: -5,
                      }}
                    >
                      TODAY
                    </div>
                  </>
                )
              }
              return null
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}