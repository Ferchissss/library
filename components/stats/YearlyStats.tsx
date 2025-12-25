// components/stats/YearlyStats.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Star } from "lucide-react"

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
  const maxBooks = Math.max(...data.map((d) => d.books))

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <BarChart3 className="h-5 w-5" />
          Yearly Statistics
        </CardTitle>
        <CardDescription>Evolution of your reading through the years</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((yearData, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-rose-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-red-800">{yearData.year}</h3>
                <Badge variant="outline" className="bg-red-50 text-red-700 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {yearData.avgRating}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Books:</span>
                  <div className="font-semibold text-lg text-red-700">{yearData.books}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Pages:</span>
                  <div className="font-semibold text-lg text-red-700">{yearData.pages.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg/month:</span>
                  <div className="font-semibold text-lg text-red-700">{(yearData.books / 12).toFixed(1)}</div>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={(yearData.books / maxBooks) * 100} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}