// components/stats/GenreStats.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface GenreStat {
  genre: string
  count: number
  percentage: number
}

interface GenreStatsProps {
  data: GenreStat[]
}

export function GenreStats({ data }: GenreStatsProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="text-pink-800">Géneros Favoritos</CardTitle>
        <CardDescription>Distribución por género</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((genre, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{genre.genre}</span>
                <span className="text-muted-foreground">{genre.count} libros</span>
              </div>
              <Progress value={genre.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}