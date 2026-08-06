import { NextRequest, NextResponse } from "next/server"
import { generateStructuredResponse } from "@/lib/openai/client"
import { buildSummarySystemPrompt, buildSummaryUserPrompt, SUMMARY_PROMPT_VERSION } from "@/lib/prompts"
import { getMissionById } from "@/lib/curriculum"

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
    }

    if (!missionId) {
      return NextResponse.json({ error: "missionId is required" }, { status: 400 })
    }

    const mission = getMissionById(missionId)
    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 })
    }

    const systemPrompt = buildSummarySystemPrompt()
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
