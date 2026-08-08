import { NextRequest, NextResponse } from "next/server"
import { generateStructuredResponse } from "@/lib/openai/client"
import { buildSummarySystemPrompt, buildSummaryUserPrompt, SUMMARY_PROMPT_VERSION } from "@/lib/prompts"
import { getMissionById } from "@/lib/curriculum"
import { createClient } from "@/lib/supabase/server"
import { upsertMissionProgress } from "@/lib/mission-progress"

interface SummaryResponse {
  summary: string
  cheatSheet: string
  nextMissionPreview: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { missionId, code, quizScore, reviewFeedback } = body as {
      missionId: number
      code: string
      quizScore: number
      reviewFeedback: string
      language?: string
    }

    if (!missionId) {
      return NextResponse.json({ error: "missionId is required" }, { status: 400 })
    }

    const mission = getMissionById(missionId)
    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 })
    }

    const systemPrompt = buildSummarySystemPrompt(body.language === "hu" ? "Hungarian" : "English")
    const userPrompt = buildSummaryUserPrompt(
      mission,
      code || "# No code submitted",
      quizScore || 0,
      reviewFeedback || "No review feedback available"
    )

    const summary = await generateStructuredResponse<SummaryResponse>(systemPrompt, userPrompt, {
      temperature: 0.4,
      maxTokens: 2048,
    })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const quizValue = quizScore || 0
      const quizPassed = quizValue >= mission.requiredQuizScore

      await upsertMissionProgress(supabase, user.id, missionId, {
        status: "PROJECT",
        quizScore: quizValue,
        quizPassed,
        projectUpdated: true,
        summaryGenerated: true,
      })
    }

    return NextResponse.json({
      ...summary,
      meta: { missionId, promptVersion: SUMMARY_PROMPT_VERSION },
    })
  } catch (error) {
    console.error("Summary generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate summary", details: String(error) },
      { status: 500 }
    )
  }
}
