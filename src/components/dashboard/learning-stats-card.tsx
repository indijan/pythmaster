import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Zap, TrendingUp, Clock, Brain } from "lucide-react"
import type { Language } from "@/lib/i18n/translations"

interface LearningStatsCardProps {
  currentStreak: number
  totalXp: number
  currentLevel: number
  totalCodingMinutes: number
  quizAverage: number
  lang: Language
}

export function LearningStatsCard({
  currentStreak,
  totalXp,
  currentLevel,
  totalCodingMinutes,
  quizAverage,
  lang,
}: LearningStatsCardProps) {
  const codingHours = Math.floor(totalCodingMinutes / 60)

  const stats = [
    {
      icon: Flame,
      value: `${currentStreak} days`,
      label: lang === "hu" ? "Napi sorozat" : "Current Streak",
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
      label: lang === "hu" ? "Jelenlegi szint" : "Current Level",
      color: "text-blue-500",
    },
    {
      icon: Clock,
      value: `${codingHours}h`,
      label: lang === "hu" ? "Kódolási idő" : "Coding Time",
      color: "text-green-500",
    },
    {
      icon: Brain,
      value: `${quizAverage}%`,
      label: lang === "hu" ? "Kvíz átlag" : "Quiz Avg",
      color: "text-purple-500",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {lang === "hu" ? "Tanulási statisztika" : "Learning Statistics"}
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
