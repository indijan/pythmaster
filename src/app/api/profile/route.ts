import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

  return NextResponse.json({
    email: user.email,
    displayName: (profile as Record<string, unknown> | null)?.display_name || user.email?.split("@")[0],
    xp: (profile as Record<string, unknown> | null)?.total_xp || 0,
    level: (profile as Record<string, unknown> | null)?.current_level || 1,
    streak: (profile as Record<string, unknown> | null)?.current_streak || 0,
  })
}
