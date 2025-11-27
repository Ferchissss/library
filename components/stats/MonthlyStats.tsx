// components/stats/MonthlyStats.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3 } from "lucide-react"

interface MonthlyData {
  month: string
  books: number
  pages: number
}

interface MonthlyStatsProps {
  data: MonthlyData[]
  currentYear: number
}

export function MonthlyStats({ data, currentYear }: MonthlyStatsProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-800">
          <BarChart3 className="h-5 w-5" />
          Progreso Mensual {currentYear}
        </CardTitle>
        <CardDescription>Libros leídos por mes en el año actual</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((monthData, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium w-8">{monthData.month}</span>
                <div className="flex-1">
                  <Progress value={(monthData.books / 5) * 100} className="h-2" />
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">{monthData.books} libros</div>
                <div className="text-muted-foreground">{monthData.pages} páginas</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}