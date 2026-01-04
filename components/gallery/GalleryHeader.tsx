// components/gallery/GalleryHeader.tsx
'use client'

import { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function GalleryHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="relative bg-[#384759] text-[#DCE4F2] px-6 py-0 flex justify-between items-center flex-wrap gap-4">
      
      {/* Desktop search */}
      <div className="hidden lg:flex items-center gap-2 relative">
        <button 
          onClick={() => setSearchOpen(!searchOpen)} 
          className="text-[#DCE4F2] focus:outline-none cursor-pointer"
        >
          <Search />
        </button>
        <input 
          type="text" 
          placeholder="Search..."
          className={`
            absolute left-10 transition-all duration-300 ease-in-out 
            bg-transparent border-b border-[#91B0D9] text-[#DCE4F2] placeholder-[#91B0D9] focus:outline-none 
            ${searchOpen ? 'w-40 opacity-100' : 'w-0 opacity-0'}
          `}
        />
      </div>

      {/* Title */}
      <h1 
        className="font-kranky text-4xl md:text-6xl font-bold text-center flex-1"
      >
        BOOKSHELF
      </h1>

      {/* Mobile hamburger menu */}
      <button 
        className="lg:hidden text-[#DCE4F2]" 
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-0 left-0 w-64 h-full bg-[#2A3140] p-6 shadow-xl z-50">
          <button 
            className="absolute top-4 right-4 text-[#DCE4F2]"
            onClick={() => setMenuOpen(false)}
          >
            <X size={24} />
          </button>
          <h1 
            className="font-kranky text-4xl font-bold text-center mb-4"
          >
            BOOKSHELF
          </h1>
          <div className="flex items-center gap-2 relative mb-6">
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="text-[#DCE4F2] focus:outline-none"
            >
              <Search />
            </button>
            <input 
              type="text" 
              placeholder="Search..."
              className={`
                absolute left-10 transition-all duration-300 ease-in-out 
                bg-transparent border-b border-[#91B0D9] text-[#DCE4F2] placeholder-[#91B0D9] focus:outline-none 
                ${searchOpen ? 'w-40 opacity-100' : 'w-0 opacity-0'}
              `}
            />
          </div>
          <nav className="flex flex-col gap-4 text-sm font-medium">
            <Link href="/" className="hover:text-[#91B0D9] transition">Back to Nook</Link>
            <Link href="/gallery" className="hover:text-[#91B0D9] transition">Gallery</Link>
          </nav>
        </div>
      )}

      {/* Desktop menu */}
      <nav className="hidden lg:flex gap-4 text-[15px] font-semibold tracking-wide">
        <Link href="/" className="hover:text-[#91B0D9] transition">Back to Nook</Link>
        <Link href="/gallery" className="hover:text-[#91B0D9] transition">Gallery</Link>
      </nav>
    </header>
  );
}

export default GalleryHeader;