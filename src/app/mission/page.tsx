import Link from "next/link"
import { redirect } from "next/navigation"
import { MISSIONS, PHASES } from "@/lib/curriculum"
import { getMissionStatus, calculateProgress, calculateTotalXp, calculateLevel } from "@/lib/mission-engine"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lock, CheckCircle2, Clock, Star, ChevronRight } from "lucide-react"
import { getServerLanguage } from "@/lib/i18n/server"
import { getLocalizedMission, getLocalizedPhase } from "@/lib/curriculum"

const difficultyLabels: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
}

export default async function MissionListPage() {
  const lang = await getServerLanguage()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: progressRows } = await supabase
    .from("mission_progress")
    .select("mission_id, status")
    .eq("user_id", user.id)

  const completedMissionIds = ((progressRows || []) as { mission_id: number; status: string }[])
    .filter((row) => row.status === "COMPLETED")
    .map((row) => row.mission_id)
  const progress = calculateProgress(completedMissionIds)
  const totalXp = calculateTotalXp(completedMissionIds)
  const level = calculateLevel(totalXp)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {lang === "hu" ? "Tanulási útvonalad" : "Your Learning Path"}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{lang === "hu" ? "Szint" : "Level"} {level}</span>
          <span>·</span>
          <span>{totalXp} XP</span>
          <span>·</span>
          <span>{progress.completed}/{progress.total} {lang === "hu" ? "küldetés" : "Missions"}</span>
        </div>
        <Progress value={progress.percentage} className="h-1.5 mt-3" />
        <p className="text-xs text-muted-foreground mt-1">
          {progress.percentage}% {lang === "hu" ? "teljesítve" : "Complete"}
        </p>
      </div>

      {/* Phases */}
      <div className="space-y-8">
        {PHASES.map((phase) => {
          const phaseMissions = MISSIONS.filter((m) => phase.missions.includes(m.id))
          const phaseCompleted = phaseMissions.filter((m) =>
            completedMissionIds.includes(m.id)
          ).length
          const localizedPhase = getLocalizedPhase(phase.name, lang)
          return (
            <section key={phase.name}>
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold">{localizedPhase.name}</h2>
                  <p className="text-sm text-muted-foreground">{localizedPhase.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {phaseCompleted}/{phaseMissions.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {phaseMissions.map((mission) => {
                  const localizedMission = getLocalizedMission(mission, lang)
                  const status = getMissionStatus(mission.id, completedMissionIds)
                  const isLocked = status === "LOCKED"
                  const isCompleted = status === "COMPLETED"

                  return (
                    <Link key={mission.id} href={`/mission/${mission.id}`}>
                      <Card
                        className={`transition-colors hover:bg-muted/50 ${
                          isLocked ? "opacity-60" : ""
                        } ${status === "IN_PROGRESS" ? "border-primary/30 bg-primary/5" : ""}`}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          {/* Status Icon */}
                          <div className="shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : isLocked ? (
                              <Lock className="h-6 w-6 text-muted-foreground" />
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">{mission.id}</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{localizedMission.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">{localizedMission.goal}</p>
                          </div>

                          {/* Meta */}
                          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {mission.estimatedMinutes}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {difficultyLabels[mission.difficulty]}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {mission.xp} XP
                            </Badge>
                          </div>

                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
