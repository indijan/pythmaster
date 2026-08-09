import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calculateLevel, calculateTotalXp } from "@/lib/mission-engine"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp, current_level, current_streak, display_name")
    .eq("id", user.id)
    .single()

  const { data: missionRows } = await supabase
    .from("mission_progress")
    .select("mission_id, status")
    .eq("user_id", user.id)

  const completedMissionIds = ((missionRows || []) as { mission_id: number; status: string }[])
    .filter((row) => row.status === "COMPLETED")
    .map((row) => row.mission_id)
  const computedXp = calculateTotalXp(completedMissionIds)
  const computedLevel = calculateLevel(computedXp)
  const profileRow = profile as Record<string, unknown> | null
  const xp = computedXp || ((profileRow?.total_xp as number | undefined) || 0)
  const level = computedXp ? computedLevel : ((profileRow?.current_level as number | undefined) || 1)

  return NextResponse.json({
    email: user.email,
    displayName: profileRow?.display_name || user.email?.split("@")[0],
    xp,
    level,
    streak: profileRow?.current_streak || 0,
  })
}
