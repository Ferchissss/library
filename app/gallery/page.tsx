// app/gallery/page.tsx
import GalleryComponent from "@/components/gallery/GalleryComponent"
import GalleryImages from "@/components/gallery/GalleryImages"
import MainLayout from "@/components/gallery/MainLayout"

export default function GalleryPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <GalleryComponent />
        <GalleryImages />
      </div>
    </MainLayout>
  )
}