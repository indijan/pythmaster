import { NextRequest, NextResponse } from "next/server"
import { generateStructuredResponse } from "@/lib/openai/client"
import { buildQuizSystemPrompt, buildQuizUserPrompt, QUIZ_PROMPT_VERSION } from "@/lib/prompts"
import { getMissionById } from "@/lib/curriculum"

interface QuizResponse {
  questions: {
    id: string
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { missionId, lessonSummary } = body as {
      missionId: number
      lessonSummary: string
    }

    if (!missionId) {
      return NextResponse.json({ error: "missionId is required" }, { status: 400 })
    }

    const mission = getMissionById(missionId)
    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 })
    }

    const student = {
      weakTopics: [] as string[],
      previousMistakes: [] as string[],
    }

    const systemPrompt = buildQuizSystemPrompt()
    const userPrompt = buildQuizUserPrompt(
      mission,
      student,
      lessonSummary || `Lesson covering: ${mission.learningObjectives.join(", ")}`
    )

    const quiz = await generateStructuredResponse<QuizResponse>(systemPrompt, userPrompt, {
      temperature: 0.5,
      maxTokens: 3072,
    })

    return NextResponse.json({
      ...quiz,
      meta: { missionId, promptVersion: QUIZ_PROMPT_VERSION, generatedAt: new Date().toISOString() },
    })
  } catch (error) {
    console.error("Quiz generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate quiz", details: String(error) },
      { status: 500 }
    )
  }
}
