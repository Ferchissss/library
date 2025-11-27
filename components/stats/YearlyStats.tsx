// components/stats/YearlyStats.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3 } from "lucide-react"

interface YearlyData {
  year: number
  books: number
  pages: number
  avgRating: number
}

interface YearlyStatsProps {
  data: YearlyData[]
}

export function YearlyStats({ data }: YearlyStatsProps) {
  const maxBooks = Math.max(...data.map(d => d.books))

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-800">
          <BarChart3 className="h-5 w-5" />
          Estadísticas por Año
        </CardTitle>
        <CardDescription>Evolución de tu lectura a través de los años</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((yearData, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-pink-800">{yearData.year}</h3>
                <Badge variant="outline" className="bg-pink-50 text-pink-700">
                  ⭐ {yearData.avgRating}/10
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Libros:</span>
                  <div className="font-semibold text-lg text-pink-700">{yearData.books}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Páginas:</span>
                  <div className="font-semibold text-lg text-pink-700">{yearData.pages.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Promedio/mes:</span>
                  <div className="font-semibold text-lg text-pink-700">{(yearData.books / 12).toFixed(1)}</div>
                </div>
              </div>
              <div className="mt-3">
                <Progress
                  value={(yearData.books / maxBooks) * 100}
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}