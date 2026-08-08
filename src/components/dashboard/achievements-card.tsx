import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Lock } from "lucide-react"
import type { UserBadge } from "@/types"
import type { Language } from "@/lib/i18n/translations"

interface AchievementsCardProps {
  unlockedBadges: UserBadge[]
  nextBadge: UserBadge | null
  lang: Language
}

export function AchievementsCard({
  unlockedBadges,
  nextBadge,
  lang,
}: AchievementsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          {lang === "hu" ? "Kitüntetések" : "Achievements"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Unlocked badges */}
        <div className="flex flex-wrap gap-2">
          {unlockedBadges.map((badge) => (
            <div
              key={badge.badgeKey}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primary/10 text-sm font-medium"
              title={badge.description}
            >
              🏅 {badge.name}
            </div>
          ))}
        </div>

        {/* Next badge */}
        {nextBadge && (
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{nextBadge.name}</span>
            </div>
            <Progress value={nextBadge.progress} className="h-1.5 mb-1" />
            <p className="text-xs text-muted-foreground">
              {nextBadge.progress}% {lang === "hu" ? "feloldva" : "unlocked"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
