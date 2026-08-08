import { NextRequest, NextResponse } from "next/server"
import { generateStructuredResponse } from "@/lib/openai/client"
import { buildReviewSystemPrompt, buildReviewUserPrompt, REVIEW_PROMPT_VERSION } from "@/lib/prompts"
import { getMissionById } from "@/lib/curriculum"
import { createClient } from "@/lib/supabase/server"
import { upsertMissionProgress } from "@/lib/mission-progress"

interface ReviewResponse {
  score: number
  passed: boolean
  summary: string
  strengths: string[]
  improvements: { area: string; suggestion: string; example?: string }[]
  pythonicTips: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { missionId, code, challengeDescription, requirements } = body as {
      missionId: number
      code: string
      challengeDescription: string
      requirements: string[]
      language?: string
    }

    if (!missionId || !code) {
      return NextResponse.json({ error: "missionId and code are required" }, { status: 400 })
    }

    const mission = getMissionById(missionId)
    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 })
    }

    const language = body.language === "hu" ? "Hungarian" : "English"
    const systemPrompt = buildReviewSystemPrompt(language)
    const userPrompt = buildReviewUserPrompt(
      mission,
      challengeDescription || mission.projectFeature,
      requirements || mission.learningObjectives,
      code
    )

    const review = await generateStructuredResponse<ReviewResponse>(systemPrompt, userPrompt, {
      temperature: 0.3,
      maxTokens: 2048,
    })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await upsertMissionProgress(supabase, user.id, missionId, {
        status: review.passed ? "CODE_REVIEW" : "IN_PROGRESS",
        challengePassed: review.passed,
        codeReviewCompleted: true,
      })
    }

    return NextResponse.json({
      ...review,
      meta: { missionId, promptVersion: REVIEW_PROMPT_VERSION },
    })
  } catch (error) {
    console.error("Review generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate review", details: String(error) },
      { status: 500 }
    )
  }
}
