"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sparkles, FileText } from "lucide-react"

interface BulkInputSectionProps {
  onParse: (bulkData: string) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function BulkInputSection({ onParse, isOpen, onOpenChange }: BulkInputSectionProps) {
  const [bulkData, setBulkData] = useState("")

  const handleParse = () => {
    onParse(bulkData)
    setBulkData("") // Limpiar el textarea después de parsear
  }

  return (
    <Card className="bg-purple-50/50 border-purple-200">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>a
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-purple-100/50 transition-colors py-2">
            <CardTitle className="flex items-center gap-2 text-purple-800 text-base">
              <Sparkles className="h-4 w-4" />
              Entrada Rápida de Datos
            </CardTitle>
            <CardDescription className="text-sm">
              Pega todos los datos con saltos de línea para llenar automáticamente los campos
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-2">
            <div className="bg-purple-100 p-3 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2 text-sm">Orden esperado (uno por línea):</h4>
              <ol className="text-xs text-purple-700 space-y-1 grid grid-cols-2 gap-x-4">
                <li>1. Título del libro *</li>
                <li>2. Autor *</li>
                <li>3. Géneros (separados por comas)</li>
                <li>4. Calificación (1-10)</li>
                <li>5. Tipo de libro</li>
                <li>6. Número de páginas</li>
                <li>7. Fecha de inicio (YYYY-MM-DD)</li>
                <li>8. Fecha de finalización</li>
                <li>9. Año de publicación</li>
                <li>10. Editorial</li>
                <li>11. Idioma</li>
                <li>12. Época/Era</li>
                <li>13. Formato (Físico/Digital)</li>
                <li>14. Audiencia (Adulto/Juvenil/Infantil)</li>
                <li>15. Densidad de lectura</li>
                <li>16. Premios</li>
                <li>17. URL de portada</li>
                <li>18. Personajes Principales (separados por comas)</li>
                <li>19. Personaje Favorito</li>
                <li>20. Es favorito (true/false)</li>
                <li>21. Resumen</li>
                <li>22. Tu opinión</li>
                <li>23. Serie/Saga</li>
                <li>24+. Citas (texto|página|categoría)</li>
              </ol>
            </div>
            <Textarea
              placeholder="Ejemplo:
Cien años de soledad
Gabriel García Márquez
Realismo Mágico, Novela
9.2
Novela
417
2024-01-15
2024-02-20
1967
Editorial Sudamericana
Español
Siglo XX
Físico
Adulto
Densa
Premio Nobel Literatura 1982
/placeholder.svg?height=200&width=150
José Arcadio Buendía, Úrsula Iguarán
Aureliano Babilonia
true
La novela narra la historia de la familia Buendía...
Una obra maestra que transporta a Macondo...
Macondo
El amor en los tiempos del cólera es una enfermedad|123|Amor
Muchos años después, frente al pelotón de fusilamiento...|1|Filosofía"
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              rows={12}
              className="border-purple-200 focus:border-purple-400 font-mono text-sm"
            />
            <Button
              onClick={handleParse}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!bulkData.trim()}
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Llenar Campos Automáticamente
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}