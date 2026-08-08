import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, FileText, Trophy, FolderGit2, Code2, Clock } from "lucide-react"
import type { RecentActivity } from "@/types"
import type { Language } from "@/lib/i18n/translations"

interface RecentActivityCardProps {
  activities: RecentActivity[]
  lang: Language
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  mission_completed: CheckCircle2,
  quiz_passed: FileText,
  badge_earned: Trophy,
  project_updated: FolderGit2,
  challenge_solved: Code2,
}

const activityColors: Record<string, string> = {
  mission_completed: "text-green-500",
  quiz_passed: "text-blue-500",
  badge_earned: "text-amber-500",
  project_updated: "text-purple-500",
  challenge_solved: "text-orange-500",
}

export function RecentActivityCard({ activities, lang }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {lang === "hu" ? "Legutóbbi aktivitás" : "Recent Activity"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {lang === "hu"
              ? "Még nincs aktivitás. Indítsd el az első küldetésed!"
              : "No activity yet. Start your first mission!"}
          </p>
        ) : (
          <ul className="space-y-2">
            {activities.map((activity, i) => {
              const Icon = activityIcons[activity.type] || CheckCircle2
              const color = activityColors[activity.type] || ""
              return (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                  <div>
                    <p>{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString(lang === "hu" ? "hu-HU" : "en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
