import Link from "next/link"
import { notFound } from "next/navigation"
import { getMissionById, getPrerequisites, PHASES } from "@/lib/curriculum"
import {
  getMissionStatus,
  getNextMission,
  getCompletedFeatures,
  getUpcomingFeatures,
  getProjectVersion,
} from "@/lib/mission-engine"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { MissionLessonWrapper } from "@/components/mission-lesson-wrapper"
import {
  Clock,
  Star,
  Target,
  BookOpen,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
} from "lucide-react"

const difficultyLabels: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
}

const statusColors: Record<string, string> = {
  LOCKED: "bg-muted text-muted-foreground",
  AVAILABLE: "bg-blue-500/10 text-blue-500",
  IN_PROGRESS: "bg-amber-500/10 text-amber-500",
  CODE_REVIEW: "bg-purple-500/10 text-purple-500",
  QUIZ: "bg-cyan-500/10 text-cyan-500",
  PROJECT: "bg-green-500/10 text-green-500",
  COMPLETED: "bg-green-500/20 text-green-600",
}

interface MissionPageProps {
  params: Promise<{ id: string }>
}

export default async function MissionPage({ params }: MissionPageProps) {
  const { id } = await params
  const missionId = parseInt(id, 10)
  const mission = getMissionById(missionId)

  if (!mission || isNaN(missionId)) {
    notFound()
  }

  const prerequisites = getPrerequisites(missionId)

  // Mock: completed mission IDs for demo
  const completedMissionIds = Array.from(
    { length: missionId - 1 },
    (_, i) => i + 1
  )

  const status = getMissionStatus(missionId, completedMissionIds)
  const nextMission = getNextMission(missionId, completedMissionIds)
  const isLocked = status === "LOCKED"

  const allMissionIds = Array.from({ length: 31 }, (_, i) => i + 1)
  const completedCount = completedMissionIds.length

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/mission">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Missions
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {missionId > 1 && (
            <Link href={`/mission/${missionId - 1}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            </Link>
          )}
          {nextMission && (
            <Link href={`/mission/${nextMission.id}`}>
              <Button variant="outline" size="sm">
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <Badge variant="outline" className="font-mono text-xs">
            Mission {mission.id}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {mission.phase}
          </Badge>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {status === "LOCKED" && <Lock className="h-3 w-3 inline mr-1" />}
            {status.replace("_", " ")}
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{mission.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {mission.estimatedMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            {difficultyLabels[mission.difficulty]}
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {mission.xp} XP
          </span>
        </div>
      </div>

      {/* Locked state */}
      {isLocked && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6 text-center">
            <Lock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Mission Locked</h2>
            <p className="text-muted-foreground mb-4">
              Complete the following missions first:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {prerequisites.map((preReq) => (
                <Link key={preReq.id} href={`/mission/${preReq.id}`}>
                  <Badge
                    variant={
                      completedMissionIds.includes(preReq.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                  >
                    {completedMissionIds.includes(preReq.id) ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Lock className="h-3 w-3 mr-1" />
                    )}
                    Mission {preReq.id}: {preReq.title}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Learning Goal
          </CardTitle>
          <CardDescription className="text-base">
            {mission.goal}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What You&apos;ll Learn</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mission.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Project Feature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Project Milestone
          </CardTitle>
          <CardDescription className="text-base">
            {mission.projectFeature}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Prerequisites */}
      {prerequisites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {prerequisites.map((preReq) => (
                <Link key={preReq.id} href={`/mission/${preReq.id}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    Mission {preReq.id}: {preReq.title}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Official Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Official Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {mission.officialSources.map((source, i) => (
              <li key={i}>
                <a
                  href={source.startsWith("http") ? source : `https://${source}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {source}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Phase Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Phase: {mission.phase}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MISSION_LIST_IN_PHASE(mission.phase).map((m) => {
              const mStatus = getMissionStatus(m.id, completedMissionIds)
              const isCurrent = m.id === missionId
              return (
                <Link key={m.id} href={`/mission/${m.id}`}>
                  <div
                    className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                      isCurrent
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="w-6 text-center">
                      {mStatus === "COMPLETED" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                      ) : mStatus === "LOCKED" ? (
                        <Lock className="h-4 w-4 text-muted-foreground mx-auto" />
                      ) : (
                        <span className="text-xs font-mono">{m.id}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm truncate block ${
                          isCurrent ? "font-medium" : ""
                        }`}
                      >
                        {m.title}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {m.xp} XP
                    </Badge>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Button + Lesson View */}
      {!isLocked && status !== "COMPLETED" && (
        <MissionLessonWrapper
          missionId={mission.id}
          missionTitle={mission.title}
          learningObjectives={mission.learningObjectives}
          projectFeature={mission.projectFeature}
          startLabel={status === "AVAILABLE" ? "Start Mission" : "Continue Mission"}
        />
      )}

      {status === "COMPLETED" && (
        <div className="flex justify-center pt-4">
          <Badge className="px-6 py-3 text-base">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Mission Completed 🎉
          </Badge>
        </div>
      )}
    </div>
  )
}

/** Helper: get missions in the same phase */
function MISSION_LIST_IN_PHASE(phase: string) {
  const { getMissionsByPhase } = require("@/lib/curriculum")
  return getMissionsByPhase(phase) as import("@/types").MissionDefinition[]
}
