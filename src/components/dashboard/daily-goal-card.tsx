import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Target } from "lucide-react"
import type { Language } from "@/lib/i18n/translations"

interface DailyGoalCardProps {
  description: string
  estimatedMinutes: number
  xpReward: number
  badgeProgress?: {
    name: string
    progress: number
  }
  lang: Language
}

export function DailyGoalCard({
  description,
  estimatedMinutes,
  xpReward,
  badgeProgress,
  lang,
}: DailyGoalCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Target className="h-4 w-4" />
          {lang === "hu" ? "Mai cél" : "Today's Goal"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium">{description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            ~{estimatedMinutes} min
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-500" />
            +{xpReward} XP
          </Badge>
          {badgeProgress && (
            <Badge variant="outline" className="flex items-center gap-1">
              🏅 {badgeProgress.name} {lang === "hu" ? "haladás" : "Progress"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 15 15" fill="none">
      <path
        d="M7.5 0C3.35786 0 0 3.35786 0 7.5C0 11.6421 3.35786 15 7.5 15C11.6421 15 15 11.6421 15 7.5C15 3.35786 11.6421 0 7.5 0ZM7.5 14C3.90914 14 1 11.0909 1 7.5C1 3.90914 3.90914 1 7.5 1C11.0909 1 14 3.90914 14 7.5C14 11.0909 11.0909 14 7.5 14ZM7.5 3C7.22386 3 7 3.22386 7 3.5V7.5C7 7.77614 7.22386 8 7.5 8H11.5C11.7761 8 12 7.77614 12 7.5C12 7.22386 11.7761 7 11.5 7H8V3.5C8 3.22386 7.77614 3 7.5 3Z"
        fill="currentColor"
      />
    </svg>
  )
}
