// app/gallery/layout.tsx
import { GalleryProvider } from "@/components/gallery/GalleryProvider"

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-pattern md:p-6 min-h-screen">
      <div className="bg-[#ccd1db] min-h-screen">
        <GalleryProvider>
          {children}
        </GalleryProvider>
      </div>
    </div>
  )
}