import { createClient } from "@/lib/supabase/server"
import { MISSIONS, getMissionById } from "@/lib/curriculum"
import { calculateProgress, calculateTotalXp, calculateLevel, getProjectVersion, getCompletedFeatures, getUpcomingFeatures, getMissionStatus } from "@/lib/mission-engine"
import type { DashboardData, MissionProgress, UserBadge, RecentActivity, ResumeSkill } from "@/types"
import type { MissionStatus } from "@/types/database"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

function mapProgress(row: Row, userId: string): MissionProgress {
  return {
    id: row.id,
    userId,
    missionId: row.mission_id,
    status: row.status as MissionStatus,
    lessonViewed: row.lesson_viewed,
    examplesExecuted: row.examples_executed,
    challengePassed: row.challenge_passed,
    codeReviewCompleted: row.code_review_completed,
    quizPassed: row.quiz_passed,
    quizScore: row.quiz_score,
    projectUpdated: row.project_updated,
    summaryGenerated: row.summary_generated,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    attempts: row.attempts,
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const userId = user.id

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  const { data: missionProgressRows } = await supabase
    .from("mission_progress")
    .select("*")
    .eq("user_id", userId)

  const progressMap = new Map<number, MissionProgress>()
  const mpRows = (missionProgressRows || []) as Row[]
  for (const row of mpRows) {
    progressMap.set(row.mission_id, mapProgress(row, userId))
  }

  const completedMissionIds = Array.from(progressMap.entries())
    .filter(([, p]) => p.status === "COMPLETED")
    .map(([id]) => id)

  let currentMissionId = 1
  let currentProgress: MissionProgress | null = null
  for (const mission of MISSIONS) {
    const status = getMissionStatus(mission.id, completedMissionIds, progressMap.get(mission.id) || null)
    if (status !== "COMPLETED" && status !== "LOCKED") {
      currentMissionId = mission.id
      currentProgress = progressMap.get(mission.id) || null
      break
    }
  }

  const currentMission = getMissionById(currentMissionId)!
  const nextMissionDef = getMissionById(currentMissionId + 1) || null

  const overallProgress = calculateProgress(completedMissionIds)
  const projectVersion = getProjectVersion(completedMissionIds.length)
  const completedFeatures = getCompletedFeatures(completedMissionIds).slice(-5)
  const upcomingFeatures = getUpcomingFeatures(completedMissionIds, 3)

  const { data: badgeRows } = await supabase
    .from("badges")
    .select("*")
    .eq("user_id", userId)

  const badges = (badgeRows || []) as Row[]

  const recentBadges: UserBadge[] = badges
    .filter((b) => b.unlocked_at)
    .map((b) => ({
      badgeKey: b.badge_key,
      name: b.name,
      description: b.description,
      unlockedAt: b.unlocked_at,
      progress: b.progress,
    }))

  const nextBadge: UserBadge | null = (() => {
    const nb = badges.find((b) => !b.unlocked_at)
    if (!nb) return null
    return {
      badgeKey: nb.badge_key,
      name: nb.name,
      description: nb.description,
      unlockedAt: null,
      progress: nb.progress,
    }
  })()

  const { data: skillRows } = await supabase
    .from("resume_skills")
    .select("*")
    .eq("user_id", userId)

  const skills = (skillRows || []) as Row[]
  const resumeSkills: ResumeSkill[] = skills.map((s) => ({
    skillName: s.skill_name,
    level: s.level,
    progress: s.progress,
  }))

  const totalXp = (profile as unknown as Row)?.total_xp || calculateTotalXp(completedMissionIds)
  const currentLevel = (profile as unknown as Row)?.current_level || calculateLevel(totalXp)

  const { data: xpRows } = await supabase
    .from("xp_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)

  const xpHistory = (xpRows || []) as Row[]
  const recentActivity: RecentActivity[] = xpHistory.map((x) => ({
    type: "mission_completed",
    description: x.source,
    timestamp: x.created_at,
  }))

  const p = (profile || {}) as unknown as Row

  return {
    profile: {
      id: userId,
      displayName: p?.display_name || user.email?.split("@")[0] || "Learner",
      avatarUrl: p?.avatar_url || null,
      currentLevel,
      totalXp,
      currentStreak: p?.current_streak || 0,
      longestStreak: p?.longest_streak || 0,
      totalCodingMinutes: p?.total_coding_minutes || 0,
      preferredLearningStyle: p?.preferred_learning_style || null,
      createdAt: p?.created_at || new Date().toISOString(),
      updatedAt: p?.updated_at || new Date().toISOString(),
    },
    currentMission: currentProgress
      ? { ...currentProgress, mission: currentMission }
      : {
        id: "",
        userId,
        missionId: currentMission.id,
        status: "AVAILABLE" as MissionStatus,
        lessonViewed: false,
        examplesExecuted: false,
        challengePassed: false,
        codeReviewCompleted: false,
        quizPassed: false,
        quizScore: null,
        projectUpdated: false,
        summaryGenerated: false,
        startedAt: null,
        completedAt: null,
        attempts: 0,
        mission: currentMission,
      },
    nextMission: nextMissionDef,
    overallProgress,
    projectVersion,
    completedFeatures,
    upcomingFeatures,
    resumeSkills,
    recentBadges,
    nextBadge,
    dailyGoal: {
      description: `Complete Mission ${currentMission.id}: ${currentMission.title}`,
      estimatedMinutes: currentMission.estimatedMinutes,
      xpReward: currentMission.xp,
      badgeProgress: nextBadge ? { name: nextBadge.name, progress: nextBadge.progress } : undefined,
    },
    recentActivity,
    streak: p?.current_streak || 0,
  }
}
