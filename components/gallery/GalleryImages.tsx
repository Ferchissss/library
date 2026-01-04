'use client'

import { useEffect, useState } from 'react';
import { FiImage, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { useGallery } from './GalleryProvider';

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
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [clickedImageId, setClickedImageId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const { refreshTrigger, sortOrder } = useGallery();

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Reset confirmation click after 3 seconds
  useEffect(() => {
    if (clickedImageId) {
      const timer = setTimeout(() => {
        setClickedImageId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [clickedImageId]);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedImage]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/gallery');
        
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        
        const data = await response.json();
        applySortOrder(data.images);
      } catch (error) {
        console.error('Error fetching images:', error);
        showNotification('error', 'Error loading images');
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

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  const handleDeleteClick = (img: ImageType, e: React.MouseEvent) => {
    e.stopPropagation(); // Important: prevent opening the modal
    
    if (clickedImageId !== img.id) {
      setClickedImageId(img.id);
      return;
    }
    
    deleteImage(img);
  };

  const deleteImage = async (img: ImageType) => {
    try {
      setDeletingId(img.id);
      setClickedImageId(null);
      
      const response = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId: img.id, publicId: img.publicId }),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setImages(prev => prev.filter(image => image.id !== img.id));
      showNotification('success', 'Image deleted successfully');
      
      if (selectedImage?.id === img.id) {
        setSelectedImage(null);
      }
      
    } catch (error) {
      console.error('Error deleting image:', error);
      showNotification('error', 'Could not delete image');
    } finally {
      setDeletingId(null);
    }
  };

  const openImageModal = (img: ImageType) => {
    setSelectedImage(img);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8a9bb5]"></div>
    </div>
  );
}

  return (
    <>
      {/* Fullscreen image modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal} // Close when clicking background
        >
          <div 
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking container
          >
            <div className="bg-transparent rounded-lg overflow-hidden max-h-[80vh]">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.name || 'Enlarged image'} 
                className="w-full h-full max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : notification.type === 'error'
            ? 'bg-red-100 border border-red-400 text-red-700'
            : 'bg-blue-100 border border-blue-400 text-blue-700'
        }`}>
          {notification.type === 'success' ? (
            <FiCheck className="text-green-600" />
          ) : notification.type === 'error' ? (
            <FiX className="text-red-600" />
          ) : (
            <span className="text-blue-600 font-bold">!</span>
          )}
          <span className="text-sm font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-70"
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      <div className="w-full px-4 py-0">
        {images.length > 0 ? (
          <div className="w-full columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-7 gap-4">
            {images.map((img) => (
              <div 
                key={img.id} 
                className="relative mb-4 break-inside-avoid group cursor-pointer"
                onClick={() => openImageModal(img)}
              >
                <img 
                  src={img.url} 
                  alt={img.name || 'Gallery image'} 
                  className="w-full rounded-lg shadow-sm object-contain border border-[#d1d9e6]"
                  loading="lazy"
                />
                <button
                  onClick={(e) => handleDeleteClick(img, e)}
                  disabled={deletingId === img.id}
                  className={`absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    deletingId === img.id 
                      ? 'bg-[#b8c2d3] cursor-wait' 
                      : clickedImageId === img.id
                      ? 'bg-red-500 hover:bg-red-600 text-white border border-red-600'
                      : 'bg-[#8a9bb5] hover:bg-[#7a8ba5] text-gray-900 border border-[#7a8ba5]'
                  } shadow-sm`}
                  aria-label="Delete image"
                >
                  {deletingId === img.id ? (
                    <span className="animate-pulse">...</span>
                  ) : clickedImageId === img.id ? (
                    <span className="text-xs font-bold">✓</span>
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
            <p className="text-gray-700">No images in gallery</p>
          </div>
        )}
      </div>
    </>
  );
}

export default GalleryImages;