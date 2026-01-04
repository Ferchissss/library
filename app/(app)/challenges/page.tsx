// app/challenges/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Book, Calendar, CheckCircle, Clock, FileText, Flame, Globe, Heart, Layers, Library, MoreVertical, Mountain, Pen, Sparkles, Star, Trophy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateChallengeDialog } from "@/components/challenges/CreateChallengeDialog"
import { getIconColor } from "@/lib/colors"
import type { Challenge } from "@/lib/types"
import { toast } from "sonner"
import { EditChallengeDialog } from "@/components/challenges/EditChallengeDialog"
import { DeleteChallengeDialog } from "@/components/challenges/DeleteChallengeDialog"

type ChallengeWithProgress = Challenge & {
  current_progress?: number
  status?: string
}

// Function to get icon component based on name
const getIconComponent = (iconName: string) => {
  const iconMap = {
    "Book": Book,
    "Layers": Layers,
    "Globe": Globe,
    "Clock": Clock,
    "FileText": FileText,
    "Flame": Flame,
    "Star": Star,
    "Trophy": Trophy,
    "Pen": Pen,
    "Library": Library,
    "Mountain": Mountain,
    "Heart": Heart,
    "Sparkles": Sparkles,
  }
  
  return iconMap[iconName as keyof typeof iconMap] || Book // Fallback to Book
}

// Componente reutilizable para el menú de acciones
function ChallengeActionsMenu({ 
  challenge, 
  onEdit, 
  onDelete 
}: { 
  challenge: ChallengeWithProgress
  onEdit: (challenge: ChallengeWithProgress) => void
  onDelete: (challenge: ChallengeWithProgress) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 border-orange-200 bg-white/95 backdrop-blur-sm shadow-lg">
        <DropdownMenuItem 
          onSelect={() => onEdit(challenge)}
          className="flex items-center gap-2 cursor-pointer text-orange-700 hover:bg-orange-50 hover:text-orange-800 text-xs"
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onSelect={() => onDelete(challenge)}
          className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 text-xs"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Challenges() {
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [editingChallenge, setEditingChallenge] = useState<ChallengeWithProgress  | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<ChallengeWithProgress | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/challenges')
      
      if (!response.ok) {
        throw new Error('Error loading challenges')
      }
      
      const data = await response.json()
      setChallenges(data)
    } catch (error) {
      console.error('Error loading challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddChallenge = (newChallenge: Challenge) => {
    setChallenges([newChallenge, ...challenges])
    setTimeout(() => fetchChallenges(), 1000)
  }

  // Function to handle update
  const handleUpdateChallenge = (updatedChallenge: Challenge) => {
    setChallenges(prev => 
      prev.map(challenge => 
        challenge.id === updatedChallenge.id 
          ? { ...challenge, ...updatedChallenge }
          : challenge
      )
    )
    setTimeout(() => fetchChallenges(), 500) // Reload data
  }

  // Function to handle deletion (CORRECTED)
  const handleDeleteChallenge = async (challengeId: number) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error deleting challenge')
      }

      setChallenges(prev => prev.filter((c) => c.id !== challengeId))
      setDeleteConfirm(null)
      
      toast.success("Challenge deleted", {
        description: "The challenge has been successfully deleted"
      })
      
    } catch (error) {
      console.error('Error deleting challenge:', error)
      let message = 'Unknown error'
      if (error instanceof Error) {
        message = error.message
      }
      toast.error("Error deleting challenge", {
        description: message
      })
    } finally {
      setDeleting(false)
    }
  }

  const currentYear = new Date().getFullYear()
  
  // Filter challenges by year and status
  const currentYearChallenges = challenges.filter(c => c.year === currentYear)
  const previousYearChallenges = challenges.filter(c => c.year === currentYear - 1)

  const activeChallenges = currentYearChallenges.filter((c) => c.status !== "Completed").length
  const activeChallengesList = currentYearChallenges.filter(c => c.status !== "Completed")
  const completedChallenges = challenges.filter((c) => c.status === "Completed").length
  const expiredChallenges = previousYearChallenges.filter((c) => c.status === "Expired").length
  const totalChallenges = challenges.length
  
  const totalProgress = challenges.length > 0 
    ? challenges.reduce((sum, challenge) => {
        const progress = challenge.current_progress && challenge.goal_value
          ? Math.min((challenge.current_progress / challenge.goal_value) * 100, 100)
          : 0
        return sum + progress
      }, 0) / challenges.length
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fbecdd" }}>
        <div className="text-center">
          <div className="h-12 w-12 border-t-2 border-orange-500 border-orange-200 rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-orange-600">Loading challenges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fbecdd" }}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-serif text-3xl font-bold text-orange-800 mb-2">Reading Challenges {new Date().getFullYear()}</h1>
            <p className="text-orange-600">Maintain your reading motivation with personalized challenges</p>
          </div>
          <CreateChallengeDialog onAdd={handleAddChallenge} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-orange-700">Total Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">{totalChallenges}</div>
              <p className="text-sm text-orange-600">created</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-orange-700">Active Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">{activeChallenges}</div>
              <p className="text-sm text-orange-600">in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-orange-700">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">{completedChallenges}</div>
              <p className="text-sm text-orange-600">achieved challenges</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 h-28 flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-orange-700">Average Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">{Math.round(totalProgress)}%</div>
              <p className="text-sm text-orange-600">of all challenges</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 mb-4">
          <h2 className="text-xl font-bold text-orange-800">
            {activeChallengesList.length === 0 ? "No active challenges" : "My Active Challenges"}
          </h2>
          
           {activeChallengesList.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 text-center py-12">
              <CardContent>
                <div className="text-orange-600 text-lg mb-4">Create your first reading challenge for {new Date().getFullYear()}!</div>
                <p className="text-orange-500">Use the "New Challenge" button to start</p>
              </CardContent>
            </Card>
          ) : (
            activeChallengesList.map((challenge) => {
              const progressPercentage = challenge.current_progress && challenge.goal_value
                ? Math.min((challenge.current_progress / challenge.goal_value) * 100, 100)
                : 0

              return (
                <Card
                  key={challenge.id}
                  className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {(() => {
                        const IconComponent = getIconComponent(challenge.icon_name || "Book")
                        const iconColor = getIconColor(challenge.icon_name || "Book")
                        return (
                          <IconComponent 
                            className="h-8 w-8" 
                            style={{ color: iconColor }} 
                          />
                        )
                      })()}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-orange-600 transition-colors">
                              {challenge.name}
                            </h3>
                            <p className="text-muted-foreground">{challenge.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                {challenge.unit}
                              </Badge>
                              <Badge
                                variant={challenge.status === "Completed" ? "default" : "secondary"}
                                className={
                                  challenge.status === "Completed" 
                                    ? "bg-green-100 text-green-800" 
                                    : challenge.status === "Error"
                                    ? "bg-red-100 text-red-800"
                                    : ""
                                }
                              >
                                {challenge.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="text-right mr-2">
                              <div className="text-2xl font-bold text-orange-600">
                                {challenge.current_progress || 0}/{challenge.goal_value || 0}
                              </div>
                              <div className="text-sm text-muted-foreground">progress</div>
                            </div>
                            <ChallengeActionsMenu 
                              challenge={challenge}
                              onEdit={setEditingChallenge}
                              onDelete={setDeleteConfirm}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={progressPercentage} className="h-3 flex-1" />
                          <span className="text-sm font-medium text-muted-foreground min-w-12 text-right">
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Year {challenge.year}</span>
                            </div>
                          </div>
                          {challenge.status === "Completed" && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              🏆 Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Trophy className="h-5 w-5" />
              Unlocked Achievements
            </CardTitle>
            <CardDescription>
              {completedChallenges > 0 
                ? `You've completed ${completedChallenges} challenges!` 
                : "Complete challenges to unlock achievements"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge, index) => {
                const unlocked = challenge.status === "Completed"
                return (
                  <div
                    key={challenge.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      unlocked ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        {(() => {
                          const IconComponent = getIconComponent(challenge.icon_name || "Book")
                          const iconColor = getIconColor(challenge.icon_name || "Book")
                          return (
                            <IconComponent 
                              className="h-5 w-5" 
                              style={{ color: iconColor }} 
                            />
                          )
                        })()}
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{challenge.name}</h3>
                          {unlocked ? (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Unlocked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              To unlock
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChallengeActionsMenu 
                        challenge={challenge}
                        onEdit={setEditingChallenge}
                        onDelete={setDeleteConfirm}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{challenge.description}</p>

                    {unlocked && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">Achieved:</span>
                          <span className="font-bold text-green-700">
                            {challenge.current_progress || 0}/{challenge.goal_value || 0} {challenge.unit}
                          </span>
                        </div>
                        {(challenge.current_progress || 0) > (challenge.goal_value || 0) && (
                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Exceeded goal by{" "}
                            {(challenge.current_progress || 0) - (challenge.goal_value || 0)}{" "}
                            {challenge.unit}
                          </div>
                        )}
                      </div>
                    )}
                    {!unlocked && completedChallenges > 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        {completedChallenges}/{index + 1} completed
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {expiredChallenges > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Clock className="h-5 w-5" />
                Expired Achievements
              </CardTitle>
              <CardDescription>
                Challenges from last year that couldn't be completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {previousYearChallenges
                  .filter(challenge => challenge.status === "Expired")
                  .map((challenge) => {
                    const progressPercentage = challenge.current_progress && challenge.goal_value
                      ? Math.min((challenge.current_progress / challenge.goal_value) * 100, 100)
                      : 0

                    return (
                      <div
                        key={challenge.id}
                        className="p-4 rounded-lg border-2 border-gray-300 bg-gray-100 opacity-70 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1">
                            {(() => {
                              const IconComponent = getIconComponent(challenge.icon_name || "Book")
                              const iconColor = getIconColor(challenge.icon_name || "Book")
                              return (
                                <IconComponent 
                                  className="h-5 w-5" 
                                  style={{ color: iconColor }} 
                                />
                              )
                            })()}
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{challenge.name}</h3>
                              <Badge variant="outline" className="text-xs bg-gray-200 text-gray-700">
                                {challenge.year}
                              </Badge>
                            </div>
                          </div>
                          <ChallengeActionsMenu 
                            challenge={challenge}
                            onEdit={setEditingChallenge}
                            onDelete={setDeleteConfirm}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>
                        
                        {/* Show achieved progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">Achieved progress:</span>
                            <span>{challenge.current_progress || 0}/{challenge.goal_value || 0}</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2 bg-gray-300" />
                          <div className="text-right text-xs text-gray-500">
                            {Math.round(progressPercentage)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <EditChallengeDialog
        challenge={editingChallenge}
        open={!!editingChallenge}
        onOpenChange={(open) => !open && setEditingChallenge(null)}
        onUpdate={handleUpdateChallenge}
      />

      <DeleteChallengeDialog
        challenge={deleteConfirm}
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        onConfirm={handleDeleteChallenge}
        loading={deleting}
      />
    </div>
  )
}