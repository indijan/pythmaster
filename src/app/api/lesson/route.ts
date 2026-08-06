import { NextRequest, NextResponse } from "next/server"
import { generateStructuredResponse } from "@/lib/openai/client"
import { buildLessonSystemPrompt, buildLessonUserPrompt, LESSON_PROMPT_VERSION } from "@/lib/prompts"
import { getMissionById } from "@/lib/curriculum"

interface LessonResponse {
  theory: string
  examples: { title: string; code: string; explanation: string }[]
  guidedChallenge: { description: string; starterCode: string; expectedOutput: string }
  independentChallenge: { description: string; requirements: string[] }
  bonusChallenge: { description: string }
  keyTakeaways: string[]
  commonMistakes: { mistake: string; correction: string }[]
  sources: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { missionId } = body as { missionId: number }

    if (!missionId) {
      return NextResponse.json({ error: "missionId is required" }, { status: 400 })
    }

    const mission = getMissionById(missionId)
    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 })
    }

    // Build student context (simplified — in production, fetch from DB)
    const student = {
      level: 3,
      weakTopics: [] as string[],
      quizAverage: 91,
      preferredStyle: "visual" as string | null,
    }

    const projectContext = {
      version: "v0.0.7",
      completedFeatures: ["Variables", "User Input", "Decision Engine", "Loops", "Functions"],
    }

    // Knowledge snippets (simplified — in production, fetch from knowledge cache)
    const knowledgeSnippets = mission.officialSources.map(
      (url) => `Source: ${url}\n(Content would be fetched from cache in production)`
    )

    const systemPrompt = buildLessonSystemPrompt()
    const userPrompt = buildLessonUserPrompt(mission, student, projectContext, knowledgeSnippets)

    const lesson = await generateStructuredResponse<LessonResponse>(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: 4096,
    })

    return NextResponse.json({
      ...lesson,
      meta: {
        missionId: mission.id,
        promptVersion: LESSON_PROMPT_VERSION,
        pythonVersion: "3.12",
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Lesson generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate lesson", details: String(error) },
      { status: 500 }
    )
  }
}
