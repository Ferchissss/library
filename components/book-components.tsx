// components/book-components.tsx
import { Star, StarHalf, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StarRatingProps {
  rating: number // Rating de 0 a 10
  size?: number // Tamaño de las estrellas en píxeles
  showNumber?: boolean // Mostrar el número del rating - LO ELIMINAMOS
  className?: string // Clases adicionales
}

export function StarRating({ rating, size = 5, showNumber = false, className = "" }: StarRatingProps) {
  // Función para renderizar todas las estrellas (llenas, medias y vacías)
  const renderAllStars = (rating: number) => {
    const stars = []
    const starCount = rating / 2 // Convertir de 0-10 a 0-5
    const totalStars = 5
    
    const fullStars = Math.floor(starCount)
    const hasHalfStar = starCount % 1 !== 0
    const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0)

    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className={`h-${size} w-${size} fill-yellow-400 text-yellow-400`}
        />
      )
    }
    
    // Media estrella
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className={`h-${size} w-${size} fill-yellow-400 text-yellow-400`}
        />
      )
    }
    
    // Estrellas vacías
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className={`h-${size} w-${size} text-gray-300`}
        />
      )
    }
    
    return stars
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {renderAllStars(rating)}
      </div>
      {/* ELIMINAMOS COMPLETAMENTE LA PARTE QUE MUESTRA EL NÚMERO */}
    </div>
  )
}

// Componente para cuando no hay rating
export function EmptyStarRating({ size = 5, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-${size} w-${size} text-gray-300`}
          />
        ))}
      </div>
    </div>
  )
}

// Props para el componente FavoriteButton
interface FavoriteButtonProps {
  isFavorite: boolean
  onToggle: () => void
  size?: "sm" | "md" | "lg"
  className?: string
  showTooltip?: boolean
}

export function FavoriteButton({ 
  isFavorite, 
  onToggle, 
  size = "md", 
  className = "",
  showTooltip = true 
}: FavoriteButtonProps) {
  const sizeClasses = {
    sm: "h-6 w-6 p-0",
    md: "h-8 w-8 p-0", 
    lg: "h-10 w-10 p-0"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200 group/heart ${sizeClasses[size]} ${className}`}
      onClick={onToggle}
      title={showTooltip ? (isFavorite ? "Quitar de favoritos" : "Marcar como favorito") : undefined}
    >
      <Heart 
        className={`${iconSizes[size]} transition-all duration-200 ${
          isFavorite 
            ? "fill-red-600 text-red-600" 
            : "text-red-600 fill-transparent group-hover/heart:fill-red-600"
        }`}
      />
    </Button>
  )
}

// Componente para mostrar el ícono de favorito en tarjetas (sin botón interactivo)
interface FavoriteBadgeProps {
  isFavorite: boolean
  className?: string
}

export function FavoriteBadge({ isFavorite, className = "" }: FavoriteBadgeProps) {
  if (!isFavorite) return null

  return (
    <div className={`p-2 bg-white/80 rounded-full shadow-md backdrop-blur-sm ${className}`}>
      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
    </div>
  )
}