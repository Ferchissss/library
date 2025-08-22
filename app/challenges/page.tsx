"use client"

import { Target, Trophy, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const challengesData = [
  {
    id: 1,
    title: "Desafío de Lectura 2024",
    description: "Lee 30 libros durante el año",
    type: "Anual",
    target: 30,
    current: 24,
    deadline: "2024-12-31",
    status: "En progreso",
    reward: "Insignia de Lector Dedicado",
    icon: "📚",
  },
  {
    id: 2,
    title: "Explorador de Géneros",
    description: "Lee al menos un libro de 10 géneros diferentes",
    type: "Diversidad",
    target: 10,
    current: 7,
    deadline: "2024-12-31",
    status: "En progreso",
    reward: "Insignia de Explorador",
    icon: "🌟",
  },
  {
    id: 3,
    title: "Maratón de Páginas",
    description: "Lee 1000 páginas en un mes",
    type: "Mensual",
    target: 1000,
    current: 1200,
    deadline: "2024-07-31",
    status: "Completado",
    reward: "Insignia de Maratonista",
    icon: "🏃",
  },
  {
    id: 4,
    title: "Clásicos Universales",
    description: "Lee 5 libros considerados clásicos de la literatura",
    type: "Temático",
    target: 5,
    current: 3,
    deadline: "2024-12-31",
    status: "En progreso",
    reward: "Insignia de Erudito",
    icon: "🎭",
  },
  {
    id: 5,
    title: "Racha de Lectura",
    description: "Lee al menos 30 minutos durante 30 días consecutivos",
    type: "Hábito",
    target: 30,
    current: 45,
    deadline: "Continuo",
    status: "Completado",
    reward: "Insignia de Constancia",
    icon: "🔥",
  },
]

const achievements = [
  { title: "Primer Libro", description: "Completaste tu primera lectura", icon: "📖", unlocked: true },
  { title: "Lector Constante", description: "30 días consecutivos leyendo", icon: "🔥", unlocked: true },
  { title: "Explorador", description: "5 géneros diferentes", icon: "🌟", unlocked: true },
  { title: "Maratonista", description: "1000 páginas en un mes", icon: "🏃", unlocked: true },
  { title: "Crítico", description: "10 reseñas escritas", icon: "✍️", unlocked: false },
  { title: "Bibliófilo", description: "50 libros leídos", icon: "📚", unlocked: false },
]

export default function Challenges() {
  const activechallenges = challengesData.filter((c) => c.status === "En progreso").length
  const completedChallenges = challengesData.filter((c) => c.status === "Completado").length
  const totalProgress =
    challengesData.reduce((sum, challenge) => {
      return sum + Math.min((challenge.current / challenge.target) * 100, 100)
    }, 0) / challengesData.length

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fbecdd" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-orange-700">Desafíos Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">{activechallenges}</div>
              <p className="text-sm text-orange-600">en progreso</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-orange-700">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">{completedChallenges}</div>
              <p className="text-sm text-orange-600">desafíos logrados</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-orange-700">Progreso Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">{Math.round(totalProgress)}%</div>
              <p className="text-sm text-orange-600">de todos los desafíos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-orange-700">Logros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">{achievements.filter((a) => a.unlocked).length}</div>
              <p className="text-sm text-orange-600">insignias obtenidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Challenges */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-bold text-orange-800">Desafíos Activos</h2>
          {challengesData.map((challenge) => (
            <Card
              key={challenge.id}
              className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{challenge.icon}</div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-orange-600 transition-colors">
                          {challenge.title}
                        </h3>
                        <p className="text-muted-foreground">{challenge.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            {challenge.type}
                          </Badge>
                          <Badge
                            variant={challenge.status === "Completado" ? "default" : "secondary"}
                            className={challenge.status === "Completado" ? "bg-green-100 text-green-800" : ""}
                          >
                            {challenge.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {challenge.current}/{challenge.target}
                        </div>
                        <div className="text-sm text-muted-foreground">progreso</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Progreso</span>
                        <span className="text-muted-foreground">
                          {Math.min(Math.round((challenge.current / challenge.target) * 100), 100)}%
                        </span>
                      </div>
                      <Progress value={Math.min((challenge.current / challenge.target) * 100, 100)} className="h-3" />
                    </div>

                    {/* Challenge Details */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {challenge.deadline === "Continuo"
                              ? "Continuo"
                              : `Hasta ${new Date(challenge.deadline).toLocaleDateString("es-ES")}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span>{challenge.reward}</span>
                        </div>
                      </div>
                      {challenge.status === "Completado" && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          🏆 Completado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Trophy className="h-5 w-5" />
              Logros Desbloqueados
            </CardTitle>
            <CardDescription>Insignias que has ganado por tus hábitos de lectura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{achievement.title}</h3>
                      {achievement.unlocked && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Desbloqueado
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create New Challenge */}
        <Card className="mt-8 bg-gradient-to-r from-orange-100 to-amber-100 border-0">
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 mx-auto text-orange-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">¿Listo para un nuevo desafío?</h3>
            <p className="text-muted-foreground mb-4">
              Crea desafíos personalizados para mantener tu motivación de lectura
            </p>
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
              Crear Nuevo Desafío
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
