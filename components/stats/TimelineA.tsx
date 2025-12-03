"use client"

import { useEffect, useRef, useState } from "react"

const TimelineA = () => {
  const ganttRef = useRef<SVGSVGElement>(null)
  const ganttContainerRef = useRef<HTMLDivElement>(null)
  const ganttInstance = useRef<any>(null)
  const [viewMode, setViewMode] = useState("Month")
  const [books, setBooks] = useState([
    {
      id: "book-1",
      name: "Cien años de soledad",
      start: "2024-11-01",
      end: "2024-11-20",
    },
    {
      id: "book-2",
      name: "1984",
      start: "2024-11-15",
      end: "2024-12-05",
    },
    {
      id: "book-3",
      name: "El Principito",
      start: "2024-12-01",
      end: "2024-12-10",
    },
    {
      id: "book-4",
      name: "Don Quijote de la Mancha",
      start: "2024-12-15",
      end: "2025-01-30",
    },
  ])
  const [currentPage, setCurrentPage] = useState(1)
  const [booksPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [newBook, setNewBook] = useState({
    name: "",
    start: "",
    end: "",
  })

  // Crear y manejar estilos del Gantt
  useEffect(() => {
    // Crear un estilo específico para proteger el Gantt
    const style = document.createElement('style')
    style.textContent = `
      /* Estilos para proteger el Gantt de Tailwind/Radix */
      #gantt-container {
        all: initial !important;
        display: block !important;
        overflow-x: auto !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 8px !important;
        background: white !important;
        margin: 1rem 0 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      
      #gantt-container svg {
        all: initial !important;
        display: block !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        width: 100% !important;
        min-width: 800px !important;
      }
      
      /* Reset para elementos específicos del Gantt */
      .gantt .grid-header,
      .gantt .grid-row,
      .gantt .bar-wrapper,
      .gantt .bar,
      .gantt .bar-label,
      .gantt .lower-text,
      .gantt .upper-text,
      .gantt .row,
      .gantt .grid-background {
        all: initial !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      
      /* Asegurar que el popup esté por encima */
      .popup-wrapper {
        z-index: 9999 !important;
      }
      
      /* Estilos específicos para el contenedor */
      .gantt-container-wrapper {
        position: relative;
        z-index: 1;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css"
    document.head.appendChild(link)

    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js"
    script.async = true
    script.onload = () => {
      if (ganttRef.current && window.Gantt) {
        initGantt()
      }
    }
    document.body.appendChild(script)

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (ganttInstance.current && window.Gantt) {
      const filteredBooks = getFilteredBooks()
      const paginatedBooks = getPaginatedBooks(filteredBooks)
      ganttInstance.current.refresh(paginatedBooks)
    }
  }, [books, currentPage, searchTerm, filterStatus])

  const getFilteredBooks = () => {
    return books.filter((book) => {
      const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }

  const getPaginatedBooks = (filteredBooks: any[]) => {
    const startIndex = (currentPage - 1) * booksPerPage
    const endIndex = startIndex + booksPerPage
    return filteredBooks.slice(startIndex, endIndex)
  }

  const filteredBooks = getFilteredBooks()
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage)

  const initGantt = () => {
    if (ganttRef.current && window.Gantt) {
      const filteredBooks = getFilteredBooks()
      const paginatedBooks = getPaginatedBooks(filteredBooks)

      ganttInstance.current = new window.Gantt(ganttRef.current, paginatedBooks, {
        view_mode: viewMode,
        bar_height: 30,
        bar_corner_radius: 3,
        padding: 18,
        arrow_curve: 5,
        language: "es",
        custom_popup_html: (task: any) => {
          return `
            <div style="padding: 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <h5 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${task.name}</h5>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Inicio:</strong> ${new Date(task._start).toLocaleDateString("es-ES")}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Fin:</strong> ${new Date(task._end).toLocaleDateString("es-ES")}</p>
            </div>
          `
        },
        on_date_change: (task: any, start: Date, end: Date) => {
          setBooks((prevBooks) =>
            prevBooks.map((book) =>
              book.id === task.id
                ? { ...book, start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] }
                : book,
            ),
          )
        },
      })
    }
  }

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode)
    if (ganttInstance.current) {
      ganttInstance.current.change_view_mode(mode)
    }
  }

  const handleAddBook = () => {
    if (newBook.name && newBook.start && newBook.end) {
      const bookToAdd = {
        id: `book-${Date.now()}`,
        name: newBook.name,
        start: newBook.start,
        end: newBook.end,
      }
      setBooks([...books, bookToAdd])
      setNewBook({ name: "", start: "", end: "" })
    }
  }

  const handleDeleteBook = (bookId: string) => {
    setBooks(books.filter((book) => book.id !== bookId))
  }

  const handleGenerateManyBooks = () => {
    const bookNames = [
      "El código Da Vinci",
      "Harry Potter",
      "El Señor de los Anillos",
      "Crónica de una muerte anunciada",
      "Los miserables",
      "Orgullo y prejuicio",
      "El Gran Gatsby",
      "Matar a un ruiseñor",
      "La sombra del viento",
      "El amor en los tiempos del cólera",
      "Rayuela",
      "Ficciones",
      "Pedro Páramo",
      "La casa de los espíritus",
      "El túnel",
      "Cien años de soledad Vol.2",
    ]

    const newBooks = []
    for (let i = 0; i < 50; i++) {
      const startDate = new Date(2024, 10, Math.floor(Math.random() * 60))
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 30) + 5)

      newBooks.push({
        id: `book-generated-${Date.now()}-${i}`,
        name: `${bookNames[i % bookNames.length]} ${i + 1}`,
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      })
    }

    setBooks([...books, ...newBooks])
    setCurrentPage(1)
  }

  return (
    <div className="p-5 font-sans">
      <h1 className="text-3xl font-bold mb-2">Timeline de Lecturas</h1>
      <p className="text-slate-500 mb-6">Organiza y visualiza tus lecturas de libros</p>

      {/* View Controls */}
      <div className="mb-5 flex flex-wrap gap-2">
        <span className="font-medium mr-2 self-center">Vista:</span>
        {["Day", "Week", "Month", "Year"].map((mode) => (
          <button
            key={mode}
            onClick={() => handleViewModeChange(mode)}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              viewMode === mode
                ? "bg-blue-500 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {mode === "Day" ? "Día" : mode === "Week" ? "Semana" : mode === "Month" ? "Mes" : "Año"}
          </button>
        ))}
      </div>

      {/* Gantt Chart con contenedor específico */}
      <div className="gantt-container-wrapper mb-8">
        <div id="gantt-container">
          <svg ref={ganttRef} style={{ display: 'block', minWidth: '100%' }}></svg>
        </div>
      </div>

      {/* Add Book Form */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">Agregar nuevo libro</h2>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del libro</label>
            <input
              type="text"
              value={newBook.name}
              onChange={(e) => setNewBook({ ...newBook, name: e.target.value })}
              placeholder="Ej: El código Da Vinci"
              className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de inicio</label>
            <input
              type="date"
              value={newBook.start}
              onChange={(e) => setNewBook({ ...newBook, start: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de fin</label>
            <input
              type="date"
              value={newBook.end}
              onChange={(e) => setNewBook({ ...newBook, end: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleAddBook}
          className="mt-3 px-5 py-2 bg-emerald-500 text-white rounded-md font-medium text-sm hover:bg-emerald-600 transition-colors"
        >
          Agregar libro
        </button>
        <button
          onClick={handleGenerateManyBooks}
          className="mt-3 ml-2 px-5 py-2 bg-slate-500 text-white rounded-md font-medium text-sm hover:bg-slate-600 transition-colors"
        >
          Generar ejemplos
        </button>
      </div>

      {/* Books List */}
      <div className="bg-white p-5 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold mb-4">Lista de libros</h2>
        <div className="flex flex-col gap-3">
          {books.map((book) => (
            <div
              key={book.id}
              className="flex justify-between items-center p-3 bg-slate-50 rounded-md border border-slate-200"
            >
              <div className="flex-1">
                <div className="font-medium">{book.name}</div>
                <div className="text-sm text-slate-500">
                  {new Date(book.start).toLocaleDateString("es-ES")} - {new Date(book.end).toLocaleDateString("es-ES")}
                </div>
              </div>
              <button
                onClick={() => handleDeleteBook(book.id)}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimelineA