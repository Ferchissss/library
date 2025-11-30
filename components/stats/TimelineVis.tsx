import React, { useEffect, useRef, useState } from 'react';

const TimelineVis = () => {
  const ganttRef = useRef(null);
  const ganttInstance = useRef(null);
  const [viewMode, setViewMode] = useState('Month');
  const [books, setBooks] = useState([
    {
      id: 'book-1',
      name: 'Cien años de soledad',
      start: '2022-01-01',
      end: '2022-01-20',
      progress: 100,
      custom_class: 'completed'
    },
    {
      id: 'book-2',
      name: '1984',
      start: '2023-02-01',
      end: '2023-02-28',
      progress: 60,
      custom_class: 'in-progress'
    },
    {
      id: 'book-3',
      name: 'El Principito',
      start: '2024-03-01',
      end: '2024-03-10',
      progress: 30,
      custom_class: 'in-progress'
    },
    {
      id: 'book-4',
      name: 'Don Quijote',
      start: '2025-04-01',
      end: '2025-05-15',
      progress: 0,
      custom_class: 'pending'
    },
    {
      id: 'book-5',
      name: 'Harry Potter',
      start: '2026-03-15',
      end: '2026-04-10',
      progress: 100,
      custom_class: 'completed'
    }
  ]);

  const [newBook, setNewBook] = useState({
    name: '',
    start: '',
    end: '',
    progress: 0
  });

  useEffect(() => {
    // Cargar CSS de Frappe Gantt
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css';
    document.head.appendChild(link);

    // Cargar script de Frappe Gantt
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js';
    script.async = true;
    
    script.onload = () => {
      if (ganttRef.current && window.Gantt) {
        initGantt();
      }
    };

    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (ganttInstance.current && window.Gantt) {
      ganttInstance.current.refresh(books);
    }
  }, [books]);

  const initGantt = () => {
    if (ganttRef.current && window.Gantt) {
      ganttInstance.current = new window.Gantt(ganttRef.current, books, {
        view_mode: viewMode,
        bar_height: 30,
        bar_corner_radius: 3,
        padding: 18,
        arrow_curve: 5,
        language: 'es',
        custom_popup_html: (task) => {
          const status = task.progress === 100 ? 'Completado' : 
                        task.progress > 0 ? 'En progreso' : 'Pendiente';
          return `
            <div style="padding: 12px; min-width: 200px; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <h5 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${task.name}</h5>
              <p style="margin: 4px 0; font-size: 13px; color: #6b7280;"><strong>Inicio:</strong> ${new Date(task._start).toLocaleDateString('es-ES')}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #6b7280;"><strong>Fin:</strong> ${new Date(task._end).toLocaleDateString('es-ES')}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #6b7280;"><strong>Progreso:</strong> ${task.progress}%</p>
              <p style="margin: 4px 0; font-size: 13px; color: #6b7280;"><strong>Estado:</strong> ${status}</p>
            </div>
          `;
        },
        on_date_change: (task, start, end) => {
          setBooks(prevBooks => 
            prevBooks.map(book => 
              book.id === task.id 
                ? { ...book, start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
                : book
            )
          );
        },
        on_progress_change: (task, progress) => {
          setBooks(prevBooks => 
            prevBooks.map(book => 
              book.id === task.id 
                ? { 
                    ...book, 
                    progress,
                    custom_class: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending'
                  }
                : book
            )
          );
        }
      });
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (ganttInstance.current) {
      ganttInstance.current.change_view_mode(mode);
    }
  };

  const handleAddBook = () => {
    if (newBook.name && newBook.start && newBook.end) {
      const bookToAdd = {
        id: `book-${Date.now()}`,
        name: newBook.name,
        start: newBook.start,
        end: newBook.end,
        progress: parseInt(newBook.progress) || 0,
        custom_class: parseInt(newBook.progress) === 100 ? 'completed' : 
                     parseInt(newBook.progress) > 0 ? 'in-progress' : 'pending'
      };
      
      setBooks([...books, bookToAdd]);
      setNewBook({ name: '', start: '', end: '', progress: 0 });
    }
  };

  const handleDeleteBook = (bookId) => {
    setBooks(books.filter(book => book.id !== bookId));
  };

  const addMoreBooks = () => {
    const bookNames = [
      'El código Da Vinci', 'Los pilares de la tierra', 'Juego de tronos', 
      'Crimen y castigo', 'Orgullo y prejuicio', 'Moby Dick', 'Ulises',
      'En busca del tiempo perdido', 'La divina comedia', 'El hobbit',
      'Las aventuras de Sherlock Holmes', 'Drácula', 'Frankenstein',
      'El retrato de Dorian Gray', 'Rebelión en la granja', 'Fahrenheit 451'
    ];
    
    const newBooks = bookNames.map((name, index) => {
      // Distribuir libros entre 2020 y 2027
      const year = 2020 + Math.floor(index / 2);
      const startDate = new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 30) + 10);
      
      return {
        id: `book-auto-${Date.now()}-${index}`,
        name: name,
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        progress: Math.random() > 0.7 ? 100 : Math.random() > 0.5 ? Math.floor(Math.random() * 99) + 1 : 0,
        custom_class: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'in-progress' : 'pending'
      };
    });
    
    setBooks([...books, ...newBooks]);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border-0 p-6">
      <style>{`
        .completed .bar {
          fill: #10b981 !important;
        }
        .completed .bar-progress {
          fill: #059669 !important;
        }
        .in-progress .bar {
          fill: #3b82f6 !important;
        }
        .in-progress .bar-progress {
          fill: #2563eb !important;
        }
        .pending .bar {
          fill: #94a3b8 !important;
        }
        .pending .bar-progress {
          fill: #64748b !important;
        }
        .gantt-container {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          min-height: 500px;
          max-height: 600px;
        }
        /* Estilos para scrollbars */
        .gantt-container::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .gantt-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 6px;
        }
        .gantt-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
          border: 2px solid #f1f5f9;
        }
        .gantt-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <h1 className="text-2xl font-bold text-pink-800 mb-2">
        📚 Timeline de Lecturas
      </h1>
      <p className="text-pink-600 mb-6">
        Organiza y visualiza tus lecturas de libros
      </p>

      {/* Controles de vista */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-medium text-pink-700">Vista:</span>
          {['Day', 'Week', 'Month', 'Year'].map(mode => (
            <button
              key={mode}
              onClick={() => handleViewModeChange(mode)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                viewMode === mode 
                  ? 'bg-pink-500 text-white border-pink-500' 
                  : 'bg-white text-pink-700 border-pink-300 hover:bg-pink-50'
              }`}
            >
              {mode === 'Day' ? 'Día' : mode === 'Week' ? 'Semana' : mode === 'Month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
        
        <button
          onClick={addMoreBooks}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm"
        >
          📚 Agregar más libros
        </button>
      </div>

      {/* Gantt Chart */}
      <div className="gantt-container mb-6">
        <svg ref={ganttRef}></svg>
      </div>

      {/* Formulario para agregar libros */}
      <div className="bg-white rounded-lg p-6 border border-pink-200 mb-6">
        <h2 className="text-lg font-semibold text-pink-800 mb-4">
          Agregar nuevo libro
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-pink-700 mb-1">
              Nombre del libro
            </label>
            <input
              type="text"
              value={newBook.name}
              onChange={(e) => setNewBook({...newBook, name: e.target.value})}
              placeholder="Ej: El código Da Vinci"
              className="w-full px-3 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pink-700 mb-1">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={newBook.start}
              onChange={(e) => setNewBook({...newBook, start: e.target.value})}
              className="w-full px-3 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pink-700 mb-1">
              Fecha de fin
            </label>
            <input
              type="date"
              value={newBook.end}
              onChange={(e) => setNewBook({...newBook, end: e.target.value})}
              className="w-full px-3 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pink-700 mb-1">
              Progreso (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={newBook.progress}
              onChange={(e) => setNewBook({...newBook, progress: e.target.value})}
              className="w-full px-3 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
        <button
          onClick={handleAddBook}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          ➕ Agregar libro
        </button>
      </div>

      {/* Lista de libros */}
      <div className="bg-white rounded-lg p-6 border border-pink-200">
        <h2 className="text-lg font-semibold text-pink-800 mb-4">
          Lista de libros ({books.length})
        </h2>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {books.map(book => (
            <div 
              key={book.id}
              className="flex justify-between items-center p-3 bg-pink-50 rounded-lg border border-pink-200"
            >
              <div className="flex-1">
                <div className="font-medium text-pink-800">{book.name}</div>
                <div className="text-sm text-pink-600">
                  {new Date(book.start).toLocaleDateString('es-ES')} - {new Date(book.end).toLocaleDateString('es-ES')} • Progreso: {book.progress}%
                </div>
              </div>
              <button
                onClick={() => handleDeleteBook(book.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                🗑️ Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { TimelineVis };