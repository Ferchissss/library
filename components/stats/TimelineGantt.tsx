"use client"

import React, { useEffect, useRef, useState } from 'react';

export function TimelineGantt() {
  const ganttRef = useRef(null);
  const ganttInstance = useRef(null);
  const [viewMode, setViewMode] = useState('Month');
  const [books, setBooks] = useState([
    {
      id: 'book-1',
      name: 'Cien años de soledad',
      start: '2024-11-01',
      end: '2024-11-20',
      progress: 100,
      custom_class: 'completed'
    },
    {
      id: 'book-2',
      name: '1984',
      start: '2024-11-15',
      end: '2024-12-05',
      progress: 60,
      custom_class: 'in-progress'
    },
    {
      id: 'book-3',
      name: 'El Principito',
      start: '2024-12-01',
      end: '2024-12-10',
      progress: 30,
      custom_class: 'in-progress'
    },
    {
      id: 'book-4',
      name: 'Don Quijote de la Mancha',
      start: '2024-12-15',
      end: '2025-01-30',
      progress: 0,
      custom_class: 'pending'
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newBook, setNewBook] = useState({
    name: '',
    start: '',
    end: '',
    progress: 0
  });

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css';
    link.id = 'frappe-gantt-css';
    
    // Verificar si ya existe antes de agregar
    if (!document.getElementById('frappe-gantt-css')) {
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js';
    script.async = true;
    script.id = 'frappe-gantt-script';
    
    script.onload = () => {
      if (ganttRef.current && window.Gantt) {
        // Esperar un poco para que el CSS se aplique
        setTimeout(() => {
          initGantt();
        }, 100);
      }
    };

    // Verificar si ya existe antes de agregar
    if (!document.getElementById('frappe-gantt-script')) {
      document.body.appendChild(script);
    } else if (window.Gantt && ganttRef.current) {
      setTimeout(() => {
        initGantt();
      }, 100);
    }

    return () => {
      // No eliminar los recursos para evitar problemas
    };
  }, []);

  useEffect(() => {
    if (ganttInstance.current && window.Gantt && books.length > 0) {
      const filteredBooks = getFilteredBooks();
      const paginatedBooks = getPaginatedBooks(filteredBooks);
      if (paginatedBooks.length > 0) {
        try {
          ganttInstance.current.refresh(paginatedBooks);
        } catch (error) {
          console.error('Error refreshing gantt:', error);
          // Si falla el refresh, reinicializar
          initGantt();
        }
      }
    }
  }, [books, currentPage, searchTerm, filterStatus, viewMode]);

  const getFilteredBooks = () => {
    return books.filter(book => {
      const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        filterStatus === 'all' ||
        (filterStatus === 'completed' && book.progress === 100) ||
        (filterStatus === 'in-progress' && book.progress > 0 && book.progress < 100) ||
        (filterStatus === 'pending' && book.progress === 0);
      return matchesSearch && matchesFilter;
    });
  };

  const getPaginatedBooks = (filteredBooks) => {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return filteredBooks.slice(startIndex, endIndex);
  };

  const filteredBooks = getFilteredBooks();
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const initGantt = () => {
    if (ganttRef.current && window.Gantt && books.length > 0) {
      const filteredBooks = getFilteredBooks();
      const paginatedBooks = getPaginatedBooks(filteredBooks);
      
      if (paginatedBooks.length === 0) return;
      
      // Limpiar el SVG anterior si existe
      ganttRef.current.innerHTML = '';
      
      ganttInstance.current = new window.Gantt(ganttRef.current, paginatedBooks, {
        view_mode: viewMode,
        bar_height: 40,
        bar_corner_radius: 5,
        padding: 20,
        arrow_curve: 5,
        language: 'es',
        column_width: 30,
        step: 24,
        view_modes: ['Day', 'Week', 'Month', 'Year'],
        popup_trigger: 'click',
        custom_popup_html: (task) => {
          const status = task.progress === 100 ? 'Completado' : 
                        task.progress > 0 ? 'En progreso' : 'Pendiente';
          return `
            <div style="padding: 12px; min-width: 200px;">
              <h5 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${task.name}</h5>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Inicio:</strong> ${new Date(task._start).toLocaleDateString('es-ES')}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Fin:</strong> ${new Date(task._end).toLocaleDateString('es-ES')}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Progreso:</strong> ${task.progress}%</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Estado:</strong> ${status}</p>
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
                ? { ...book, progress }
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
      try {
        ganttInstance.current.change_view_mode(mode);
      } catch (error) {
        console.error('Error changing view mode:', error);
        // Si falla, reinicializar con el nuevo modo
        setTimeout(() => initGantt(), 100);
      }
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

  const handleGenerateManyBooks = () => {
    const bookNames = [
      'El código Da Vinci', 'Harry Potter', 'El Señor de los Anillos', 'Crónica de una muerte anunciada',
      'Los miserables', 'Orgullo y prejuicio', 'El Gran Gatsby', 'Matar a un ruiseñor',
      'La sombra del viento', 'El amor en los tiempos del cólera', 'Rayuela', 'Ficciones',
      'Pedro Páramo', 'La casa de los espíritus', 'El túnel', 'Cien años de soledad Vol.2'
    ];
    
    const newBooks = [];
    for (let i = 0; i < 50; i++) {
      const startDate = new Date(2024, 10, Math.floor(Math.random() * 60));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 30) + 5);
      
      newBooks.push({
        id: `book-generated-${Date.now()}-${i}`,
        name: `${bookNames[i % bookNames.length]} ${i + 1}`,
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        progress: Math.floor(Math.random() * 101),
        custom_class: Math.random() > 0.5 ? 'completed' : Math.random() > 0.5 ? 'in-progress' : 'pending'
      });
    }
    
    setBooks([...books, ...newBooks]);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        .completed .bar {
          fill: #10b981 !important;
        }
        .in-progress .bar {
          fill: #3b82f6 !important;
        }
        .pending .bar {
          fill: #94a3b8 !important;
        }
        .gantt-container {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          min-height: 400px;
        }
        .gantt-container svg {
          width: 100%;
          height: auto;
          min-height: 400px;
        }
        .gantt .grid-background {
          fill: none;
        }
        .gantt .grid-header {
          fill: #ffffff;
          stroke: #e0e0e0;
          stroke-width: 1.4;
        }
        .gantt .grid-row {
          fill: #ffffff;
        }
        .gantt .grid-row:nth-child(even) {
          fill: #f5f5f5;
        }
        .gantt .row-line {
          stroke: #e0e0e0;
        }
        .gantt .tick {
          stroke: #e0e0e0;
          stroke-width: 0.2;
        }
        .gantt .tick.thick {
          stroke-width: 0.4;
        }
        .gantt .today-highlight {
          fill: #fcf8e3;
          opacity: 0.5;
        }
      `}</style>

      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
        📚 Timeline de Lecturas
      </h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Organiza y visualiza tus lecturas de libros
      </p>

      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontWeight: '500', marginRight: '8px', alignSelf: 'center' }}>Vista:</span>
        {['Day', 'Week', 'Month', 'Year'].map(mode => (
          <button
            key={mode}
            onClick={() => handleViewModeChange(mode)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: viewMode === mode ? 'none' : '1px solid #e2e8f0',
              background: viewMode === mode ? '#3b82f6' : 'white',
              color: viewMode === mode ? 'white' : '#475569',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            {mode === 'Day' ? 'Día' : mode === 'Week' ? 'Semana' : mode === 'Month' ? 'Mes' : 'Año'}
          </button>
        ))}
      </div>

      <div className="gantt-container" style={{ marginBottom: '32px' }}>
        <svg ref={ganttRef}></svg>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Agregar nuevo libro
        </h2>
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Nombre del libro
            </label>
            <input
              type="text"
              value={newBook.name}
              onChange={(e) => setNewBook({...newBook, name: e.target.value})}
              placeholder="Ej: El código Da Vinci"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Fecha de inicio
            </label>
            <input
              type="date"
              value={newBook.start}
              onChange={(e) => setNewBook({...newBook, start: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Fecha de fin
            </label>
            <input
              type="date"
              value={newBook.end}
              onChange={(e) => setNewBook({...newBook, end: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Progreso (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={newBook.progress}
              onChange={(e) => setNewBook({...newBook, progress: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
        <button
          onClick={handleAddBook}
          style={{
            marginTop: '12px',
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px'
          }}
        >
          ➕ Agregar libro
        </button>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Lista de libros
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {books.map(book => (
            <div 
              key={book.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>{book.name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {new Date(book.start).toLocaleDateString('es-ES')} - {new Date(book.end).toLocaleDateString('es-ES')} • Progreso: {book.progress}%
                </div>
              </div>
              <button
                onClick={() => handleDeleteBook(book.id)}
                style={{
                  padding: '6px 12px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
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