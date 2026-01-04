"use client"

import { BookOpen, Calendar, TrendingUp, Target, Award, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import type { Challenge } from "@/lib/types"
import { MonthlyStats } from "@/components/stats/MonthlyStats"
import { YearlyStats } from "@/components/stats/YearlyStats"
import { TimelineStats } from "@/components/stats/TimelineStats"
import { getIconColor } from "@/lib/colors"

interface StatsData {
  challenge: Challenge | null
  progress: number
  avgMonthlyBooks: number
  avgPagesPerDay: number
  avgDaysPerBook: number
  avgPagesPerDayPerBook: number
  monthlyData: Array<{ month: string; books: number; pages: number }>
  yearlyData: Array<{ year: number; books: number; pages: number; avgRating: number }>
  timelineBooks: Array<{
    id: number
    title: string
    author: string
    dateRead: string
    rating: number
    genre: string
    pages: number
  }>
  // Removed: genreStats no longer used
}

// Function to get icon component based on name
const getIconComponent = (iconName: string) => {
  const iconMap = {
    Book: BookOpen,
    Layers: BookOpen,
    Globe: BookOpen,
    Clock: Clock,
    FileText: BookOpen,
    Flame: Award,
    Star: Award,
    Trophy: Award,
    Pen: BookOpen,
    Library: BookOpen,
    Mountain: Award,
    Heart: Award,
    Sparkles: Award,
  }

  return iconMap[iconName as keyof typeof iconMap] || BookOpen
}

type ChallengeWithProgress = Challenge & {
  current_progress?: number
  status?: string
}

export default function Stats() {
  const [statsData, setStatsData] = useState<StatsData>({
    challenge: null,
    progress: 0,
    avgMonthlyBooks: 0,
    avgPagesPerDay: 0,
    avgDaysPerBook: 0,
    avgPagesPerDayPerBook: 0,
    monthlyData: [],
    yearlyData: [],
    timelineBooks: [],
    // Removed: genreStats no longer initialized
  })
  const [completedChallenges, setCompletedChallenges] = useState<ChallengeWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  const currentYear = new Date().getFullYear()

  const yearlyGoal = statsData.challenge ? statsData.challenge.goal_value! : 0
  const currentBooksRead = statsData.challenge ? statsData.progress : 0
  const goalProgress = (currentBooksRead / yearlyGoal) * 100

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        const response = await fetch(`/api/stats?year=${currentYear}`)
        const data = await response.json()

        // Only keep necessary data (without genreStats)
        setStatsData({
          challenge: data.challenge,
          progress: data.progress,
          avgMonthlyBooks: data.avgMonthlyBooks,
          avgPagesPerDay: data.avgPagesPerDay,
          avgDaysPerBook: data.avgDaysPerBook,
          avgPagesPerDayPerBook: data.avgPagesPerDayPerBook,
          monthlyData: data.monthlyData,
          yearlyData: data.yearlyData,
          timelineBooks: data.timelineBooks,
          // genreStats not included
        })
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    async function loadCompletedChallenges() {
      try {
        const response = await fetch("/api/challenges")

        if (!response.ok) {
          throw new Error("Error loading challenges")
        }

        const challenges = await response.json()
        // Filter only completed challenges
        const completed = challenges.filter((challenge: ChallengeWithProgress) => challenge.status === "Completed")
        setCompletedChallenges(completed)
      } catch (error) {
        console.error("Error loading completed challenges:", error)
      }
    }

    loadStats()
    loadCompletedChallenges()
  }, [currentYear])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fdebec" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-red-700">Loading statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdebec" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Annual Goal */}
        <Card className="mb-4 bg-gradient-to-r from-red-500 to-rose-600 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {statsData.challenge ? statsData.challenge.name : `Reading Goal ${currentYear}`}
            </CardTitle>
            <CardDescription className="text-red-100">
              {statsData.challenge ? statsData.challenge.description : "Your progress toward the annual goal"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {currentBooksRead} / {yearlyGoal} {statsData.challenge ? statsData.challenge.unit : "books"}
                </span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {Math.round(goalProgress)}% completed
                </Badge>
              </div>
              <Progress value={goalProgress} className="h-3 bg-white/20" />
              <p className="text-sm text-red-100">
                {yearlyGoal - currentBooksRead > 0
                  ? `You need ${yearlyGoal - currentBooksRead} more ${statsData.challenge ? statsData.challenge.unit : "books"} to reach your goal`
                  : "Congratulations! You've exceeded your annual goal"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Monthly Average</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{statsData.avgMonthlyBooks}</div>
              <p className="text-xs text-red-600">books per month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Pages per Day</CardTitle>
              <BookOpen className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{statsData.avgPagesPerDay}</div>
              <p className="text-xs text-red-600">daily average</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Time per Book</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{statsData.avgDaysPerBook}d</div>
              <p className="text-xs text-red-600">average per book</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Reading Speed</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{statsData.avgPagesPerDayPerBook}</div>
              <p className="text-xs text-red-600">pages per day</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views (only 3 now) */}
        <Tabs defaultValue="monthly" className="space-y-2">
          <TabsList className="w-full flex gap-2 bg-transparent p-0">
            <TabsTrigger
              value="monthly"
              className="flex-1 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:border-red-500 transition-all"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="yearly"
              className="flex-1 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:border-red-500 transition-all"
            >
              By Year
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="flex-1 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:border-red-500 transition-all"
            >
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Monthly View */}
          <TabsContent value="monthly" className="space-y-8">
            <MonthlyStats data={statsData.monthlyData} currentYear={currentYear} />
          </TabsContent>

          {/* Yearly View */}
          <TabsContent value="yearly" className="space-y-8">
            <YearlyStats data={statsData.yearlyData} />
          </TabsContent>

          {/* Timeline View */}
          <TabsContent value="timeline" className="space-y-8">
            <TimelineStats books={statsData.timelineBooks} />
          </TabsContent>
        </Tabs>

        {/* Completed Challenges - Replaces Achievements section */}
        {completedChallenges.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Award className="h-5 w-5" />
                Completed Challenges
              </CardTitle>
              <CardDescription>
                {completedChallenges.length > 0
                  ? `You have completed ${completedChallenges.length} challenges`
                  : "Complete challenges to see them here"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedChallenges.map((challenge) => {
                  const exceededGoal = (challenge.current_progress || 0) > (challenge.goal_value || 0)

                  return (
                    <div
                      key={challenge.id}
                      className="p-4 rounded-lg border-2 border-green-200 bg-green-50 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          {(() => {
                            const IconComponent = getIconComponent(challenge.icon_name || "Book")
                            const iconColor = getIconColor(challenge.icon_name || "Book")
                            return <IconComponent className="h-5 w-5" style={{ color: iconColor }} />
                          })()}
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{challenge.name}</h3>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">Achieved:</span>
                          <span className="font-bold text-green-700">
                            {challenge.current_progress || 0}/{challenge.goal_value || 0} {challenge.unit}
                          </span>
                        </div>
                        {exceededGoal && (
                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <Award className="w-3 h-3" />
                            Exceeded goal by {(challenge.current_progress || 0) - (challenge.goal_value || 0)}{" "}
                            {challenge.unit}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          Year {challenge.year}
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
    </div>
  )
}