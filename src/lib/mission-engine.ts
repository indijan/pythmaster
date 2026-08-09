import { MISSIONS, getMissionById } from "./curriculum"
import type { MissionDefinition, MissionProgress } from "@/types"
import type { MissionStatus } from "@/types/database"

export type { MissionStatus }

/**
 * Determine mission status based on completed mission IDs.
 */
export function getMissionStatus(
  missionId: number,
  completedMissionIds: number[],
  progress?: MissionProgress | null
): MissionStatus {
  // List pages often load only the compact completed-ID set instead of every
  // MissionProgress row. That set is authoritative for completed missions.
  if (completedMissionIds.includes(missionId)) return "COMPLETED"

  // If in progress or further, return the stored status
  if (progress) {
    if (progress.status === "COMPLETED") return "COMPLETED"
    if (progress.status !== "LOCKED" && progress.status !== "AVAILABLE") {
      return progress.status
    }
  }

  const mission = getMissionById(missionId)
  if (!mission) return "LOCKED"

  // Check prerequisites
  const allPrereqsMet = mission.prerequisites.every((preReqId) =>
    completedMissionIds.includes(preReqId)
  )

  if (!allPrereqsMet) return "LOCKED"

  // If prerequisites met but no progress, it's available
  if (!progress) return "AVAILABLE"

  return progress.status
}

/**
 * Check if a mission can be unlocked.
 */
export function canUnlockMission(
  missionId: number,
  completedMissionIds: number[]
): boolean {
  const mission = getMissionById(missionId)
  if (!mission) return false
  return mission.prerequisites.every((id) => completedMissionIds.includes(id))
}

/**
 * Get the next available mission after the given one.
 */
export function getNextMission(
  currentMissionId: number,
  completedMissionIds: number[]
): MissionDefinition | null {
  const nextId = currentMissionId + 1
  const next = getMissionById(nextId)
  if (!next) return null

  if (canUnlockMission(nextId, completedMissionIds)) {
    return next
  }
  return null
}

/**
 * Calculate overall progress percentage.
 */
export function calculateProgress(completedMissionIds: number[]): {
  completed: number
  total: number
  percentage: number
} {
  const total = MISSIONS.length
  const completed = completedMissionIds.length
  const percentage = Math.round((completed / total) * 100)
  return { completed, total, percentage }
}

/**
 * Calculate XP earned from completed missions.
 */
export function calculateTotalXp(completedMissionIds: number[]): number {
  return completedMissionIds.reduce((sum, id) => {
    const mission = getMissionById(id)
    return sum + (mission?.xp || 0)
  }, 0)
}

/**
 * Determine current level from XP.
 * Level 1: 0-199 XP
 * Level 2: 200-499 XP
 * Level 3: 500-999 XP
 * Level 4: 1000-1999 XP
 * Level 5: 2000-3499 XP
 * Level 6: 3500-5499 XP
 * Level 7: 5500+ XP
 */
export function calculateLevel(totalXp: number): number {
  const thresholds = [0, 200, 500, 1000, 2000, 3500, 5500]
  let level = 1
  for (let i = 0; i < thresholds.length; i++) {
    if (totalXp >= thresholds[i]) {
      level = i + 1
    }
  }
  return level
}

/**
 * Get project version string from completed mission count.
 */
export function getProjectVersion(completedMissionCount: number): string {
  const major = Math.floor(completedMissionCount / 10)
  const minor = completedMissionCount % 10
  const patch = 0
  return `v${major}.${minor}.${patch}`
}

/**
 * Get list of completed features from completed mission IDs.
 */
export function getCompletedFeatures(
  completedMissionIds: number[]
): string[] {
  return completedMissionIds
    .map((id) => getMissionById(id)?.projectFeature)
    .filter(Boolean) as string[]
}

/**
 * Get upcoming features (next 3 uncompleted missions).
 */
export function getUpcomingFeatures(
  completedMissionIds: number[],
  limit = 3
): string[] {
  return MISSIONS.filter(
    (m) => !completedMissionIds.includes(m.id)
  )
    .slice(0, limit)
    .map((m) => m.projectFeature)
}

/**
 * Check if mission is fully completed.
 */
export function isMissionCompleted(progress: MissionProgress): boolean {
  return (
    progress.status === "COMPLETED" &&
    progress.lessonViewed &&
    progress.examplesExecuted &&
    progress.challengePassed &&
    progress.codeReviewCompleted &&
    progress.quizPassed &&
    progress.projectUpdated &&
    progress.summaryGenerated
  )
}
