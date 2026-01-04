// components/gallery/GalleryImages.tsx
'use client'

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { FiImage, FiTrash2 } from 'react-icons/fi';
import { useGallery } from './GalleryProvider';
import { db } from '@/lib/firebase';

interface ImageType {
  id: string;
  url: string;
  publicId?: string;
  name: string;
  createdAt: any;
}

function GalleryImages() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { refreshTrigger, sortOrder } = useGallery();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const imagesData: ImageType[] = [];
        querySnapshot.forEach((doc) => {
          imagesData.push({ id: doc.id, ...doc.data() } as ImageType);
        });
        
        applySortOrder(imagesData);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    const applySortOrder = (imagesData: ImageType[]) => {
      if (sortOrder === 'random') {
        const shuffled = [...imagesData];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setImages(shuffled);
      } else {
        setImages(imagesData);
      }
    };

    fetchImages();
  }, [refreshTrigger, sortOrder]);

  const handleDeleteImage = async (img: ImageType) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      setDeletingId(img.id);
      
      // Nota: Para eliminar de Cloudinary necesitarías un endpoint backend
      // Por ahora solo eliminamos de Firebase
      
      await deleteDoc(doc(db, 'gallery', img.id));
      setImages(prev => prev.filter(image => image.id !== img.id));
      
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      alert('No se pudo eliminar la imagen');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-0">
      {images.length > 0 ? (
        <div className="w-full columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-7 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative mb-4 break-inside-avoid group">
              <img 
                src={img.url} 
                alt={img.name || 'Imagen de galería'} 
                className="w-full rounded-lg shadow-sm object-contain border border-[#d1d9e6]"
                loading="lazy"
              />
              <button
                onClick={() => handleDeleteImage(img)}
                disabled={deletingId === img.id}
                className={`absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                  deletingId === img.id 
                    ? 'bg-[#b8c2d3] cursor-wait' 
                    : 'bg-[#8a9bb5] hover:bg-[#7a8ba5] text-gray-900 border border-[#7a8ba5]'
                } shadow-sm`}
                aria-label="Eliminar imagen"
              >
                {deletingId === img.id ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <FiTrash2 size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#d1d9e6] rounded-lg border border-[#8a9bb5]">
          <FiImage className="mx-auto text-[#8a9bb5] text-4xl mb-3" />
          <p className="text-gray-700">No hay imágenes en la galería</p>
          <p className="text-[#7a8ba5] text-sm">Sube la primera imagen desde el panel de administración</p>
        </div>
      )}
    </div>
  );
}

export default GalleryImages;