import { NextRequest, NextResponse } from "next/server"
import { generateStructuredResponse } from "@/lib/openai/client"
import { buildHintSystemPrompt, buildHintUserPrompt, HINT_PROMPT_VERSION } from "@/lib/prompts"
import { getMissionById } from "@/lib/curriculum"

interface HintResponse {
  level: number
  hint: string
  nextLevelAvailable: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { missionId, challengeDescription, code, hintsAlreadyGiven } = body as {
      missionId: number
      challengeDescription: string
      code: string
      hintsAlreadyGiven: number
    }

    if (!missionId || !code) {
      return NextResponse.json({ error: "missionId and code are required" }, { status: 400 })
    }

    const mission = getMissionById(missionId)
    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 })
    }

    const systemPrompt = buildHintSystemPrompt()
    const userPrompt = buildHintUserPrompt(
      mission,
      challengeDescription || mission.projectFeature,
      code,
      hintsAlreadyGiven || 0
    )

    const hint = await generateStructuredResponse<HintResponse>(systemPrompt, userPrompt, {
      temperature: 0.5,
      maxTokens: 1024,
    })

    return NextResponse.json({
      ...hint,
      meta: { missionId, promptVersion: HINT_PROMPT_VERSION },
    })
  } catch (error) {
    console.error("Hint generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate hint", details: String(error) },
      { status: 500 }
    )
  }
}
