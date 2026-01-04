// components/gallery/MainLayout.tsx
import Footer from "./Footer"
import GalleryHeader from "./GalleryHeader"

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative w-full">
        {/* Imagen decorativa izquierda - EXACTO */}
        <img 
          src="/gallery/25.PNG" 
          alt="" 
          className="hidden md:block absolute top-0 left-4 h-auto w-50 object-contain z-0 rotate-30" 
        />
        <img 
          src="/gallery/28.png" 
          alt="" 
          className="hidden md:block absolute top-5 left-65 h-auto w-60 object-contain z-0" 
        />

        {/* Imagen decorativa derecha - EXACTO */}
        <img 
          src="/gallery/29.png" 
          alt="" 
          className="hidden md:block absolute top-7 right-65 h-auto w-60 object-contain z-0" 
        />
        <img 
          src="/gallery/27.png" 
          alt="" 
          className="hidden md:block absolute top-0 right-0 h-auto w-50 object-contain z-0" 
        />

        {/* Contenedor principal de las imágenes - EXACTO */}
        <div className="relative z-10 flex justify-center items-center gap-6 lg:gap-16 p-4 flex-wrap">
          {/* Columna izquierda */}
          <div className="hidden md:flex flex-col gap-4">
            <img src="/gallery/6.jpg" alt="" className="w-28 h-auto rounded-md shadow" />
            <img src="/gallery/7.jpg" alt="" className="w-28 h-auto rounded-md shadow" />
            <img src="/gallery/14.png" alt="" className="w-28 h-auto rounded-md shadow" />
          </div>

          {/* Imagen central */}
          <div>
            <img src="/gallery/11.jpg" alt="" className="w-64 h-auto rounded-xl shadow-lg" />
          </div>

          {/* Columna derecha */}
          <div className="hidden md:flex flex-col gap-4">
            <img src="/gallery/12.png" alt="" className="w-28 h-auto rounded-md shadow" />
            <img src="/gallery/13.png" alt="" className="w-28 h-auto rounded-md shadow" />
            <img src="/gallery/4.jpg" alt="" className="w-28 h-auto rounded-md shadow" />
          </div>
        </div>
      </div>

      <GalleryHeader />
      <main className="min-h-[80vh] px-4 py-6">{children}</main>
      <Footer />
    </>
  )
}

export default MainLayout