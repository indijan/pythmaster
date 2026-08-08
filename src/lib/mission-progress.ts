import type { SupabaseClient } from "@supabase/supabase-js"
import { getMissionById } from "@/lib/curriculum"
import { calculateLevel } from "@/lib/mission-engine"
import type { Database, MissionStatus } from "@/types/database"

export interface MissionProgressUpdate {
  status?: MissionStatus
  lessonViewed?: boolean
  examplesExecuted?: boolean
  challengePassed?: boolean
  codeReviewCompleted?: boolean
  quizPassed?: boolean
  quizScore?: number | null
  projectUpdated?: boolean
  summaryGenerated?: boolean
  completedAt?: string | null
  incrementAttempts?: boolean
}

interface MissionProgressRow {
  lesson_viewed: boolean
  examples_executed: boolean
  challenge_passed: boolean
  code_review_completed: boolean
  quiz_passed: boolean
  quiz_score: number | null
  project_updated: boolean
  summary_generated: boolean
  status: MissionStatus
  started_at: string | null
  completed_at: string | null
  attempts: number
}

export async function upsertMissionProgress(
  supabase: SupabaseClient<Database>,
  userId: string,
  missionId: number,
  update: MissionProgressUpdate
) {
  const mission = getMissionById(missionId)
  if (!mission) {
    throw new Error("Mission not found")
  }

  type MissionProgressTable = {
    select: (columns: string) => {
      eq: (column: string, value: string | number) => {
        eq: (column: string, value: string | number) => {
          maybeSingle: () => Promise<{ data: MissionProgressRow | null }>
        }
      }
    }
    upsert: (
      values: Record<string, unknown>,
      options?: { onConflict?: string }
    ) => Promise<{ error: unknown }>
  }

  type ProfileTable = {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: { total_xp: number; current_level: number } | null }>
      }
    }
    update: (values: { total_xp: number; current_level: number }) => {
      eq: (column: string, value: string) => Promise<unknown>
    }
  }

  type XpHistoryTable = {
    insert: (values: {
      user_id: string
      amount: number
      source: string
      mission_id: number
    }) => Promise<unknown>
  }

  const missionProgressTable = supabase.from("mission_progress") as unknown as MissionProgressTable
  const profilesTable = supabase.from("profiles") as unknown as ProfileTable
  const xpHistoryTable = supabase.from("xp_history") as unknown as XpHistoryTable

  const { data: existingRow } = await missionProgressTable
    .select("*")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .maybeSingle()

  const existing = existingRow as MissionProgressRow | null
  const now = new Date().toISOString()
  const quizScore = update.quizScore ?? existing?.quiz_score ?? null
  const quizPassed =
    update.quizPassed ??
    existing?.quiz_passed ??
    (quizScore !== null ? quizScore >= mission.requiredQuizScore : false)
  const completionReady =
    (existing?.lesson_viewed || update.lessonViewed || false) &&
    (existing?.examples_executed || update.examplesExecuted || false) &&
    (existing?.challenge_passed || update.challengePassed || false) &&
    (existing?.code_review_completed || update.codeReviewCompleted || false) &&
    quizPassed &&
    (existing?.project_updated || update.projectUpdated || false) &&
    (existing?.summary_generated || update.summaryGenerated || false)

  const merged = {
    user_id: userId,
    mission_id: missionId,
    status: completionReady ? "COMPLETED" : update.status ?? existing?.status ?? "IN_PROGRESS",
    lesson_viewed: existing?.lesson_viewed || update.lessonViewed || false,
    examples_executed: existing?.examples_executed || update.examplesExecuted || false,
    challenge_passed: existing?.challenge_passed || update.challengePassed || false,
    code_review_completed: existing?.code_review_completed || update.codeReviewCompleted || false,
    quiz_passed: existing?.quiz_passed || quizPassed,
    quiz_score: quizScore,
    project_updated: existing?.project_updated || update.projectUpdated || false,
    summary_generated: existing?.summary_generated || update.summaryGenerated || false,
    started_at: existing?.started_at || now,
    completed_at:
      update.completedAt ??
      existing?.completed_at ??
      (completionReady ? now : update.status === "COMPLETED" ? now : null),
    attempts: (existing?.attempts || 0) + (update.incrementAttempts ? 1 : 0),
  }

  const { error } = await missionProgressTable.upsert(merged, {
    onConflict: "user_id,mission_id",
  })

  if (error) {
    throw error
  }

  const isNewCompletion =
    existing?.status !== "COMPLETED" && merged.status === "COMPLETED"

  if (isNewCompletion) {
    const { data: profile } = await profilesTable
      .select("total_xp, current_level")
      .eq("id", userId)
      .maybeSingle()

    const currentXp = (profile?.total_xp as number | null | undefined) || 0
    const nextXp = currentXp + (mission.xp || 0)
    const nextLevel = calculateLevel(nextXp)

    await Promise.all([
      profilesTable.update({
        total_xp: nextXp,
        current_level: nextLevel,
      }).eq("id", userId),
      xpHistoryTable.insert({
        user_id: userId,
        amount: mission.xp,
        source: `Completed Mission ${missionId}: ${mission.title}`,
        mission_id: missionId,
      }),
    ])
  }

  return merged
}
