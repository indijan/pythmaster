import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Zap, TrendingUp, Clock, Brain } from "lucide-react"

interface LearningStatsCardProps {
  currentStreak: number
  totalXp: number
  currentLevel: number
  totalCodingMinutes: number
  quizAverage: number
}

export function LearningStatsCard({
  currentStreak,
  totalXp,
  currentLevel,
  totalCodingMinutes,
  quizAverage,
}: LearningStatsCardProps) {
  const codingHours = Math.floor(totalCodingMinutes / 60)

  const stats = [
    {
      icon: Flame,
      value: `${currentStreak} days`,
      label: "Current Streak",
      color: "text-orange-500",
    },
    {
      icon: Zap,
      value: `${totalXp}`,
      label: "XP",
      color: "text-amber-500",
    },
    {
      icon: TrendingUp,
      value: `Level ${currentLevel}`,
      label: "Current Level",
      color: "text-blue-500",
    },
    {
      icon: Clock,
      value: `${codingHours}h`,
      label: "Coding Time",
      color: "text-green-500",
    },
    {
      icon: Brain,
      value: `${quizAverage}%`,
      label: "Quiz Avg",
      color: "text-purple-500",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Learning Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-2">
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
