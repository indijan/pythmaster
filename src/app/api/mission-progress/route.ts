import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { upsertMissionProgress } from "@/lib/mission-progress"
import type { MissionProgressUpdate } from "@/lib/mission-progress"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json() as MissionProgressUpdate & { missionId: number }
    if (!body.missionId) {
      return NextResponse.json({ error: "missionId is required" }, { status: 400 })
    }

    const progress = await upsertMissionProgress(supabase, user.id, body.missionId, body)
    return NextResponse.json({ ok: true, progress })
  } catch (error) {
    console.error("Mission progress update error:", error)
    return NextResponse.json(
      { error: "Failed to update mission progress", details: String(error) },
      { status: 500 }
    )
  }
}
