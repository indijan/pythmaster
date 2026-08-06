import { NextRequest, NextResponse } from "next/server"
import { generateStructuredResponse } from "@/lib/openai/client"
import { buildLessonSystemPrompt, buildLessonUserPrompt, LESSON_PROMPT_VERSION } from "@/lib/prompts"
import { getMissionById } from "@/lib/curriculum"
import { calculateTotalXp, calculateLevel } from "@/lib/mission-engine"
import { createClient } from "@/lib/supabase/server"

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { missionId } = body as { missionId: number }
    if (!missionId) {
      return NextResponse.json({ error: "missionId is required" }, { status: 400 })
    }

    const mission = getMissionById(missionId)
    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 })
    }

    // Get real student data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    // Get completed missions
    const { data: completed } = await supabase
      .from("mission_progress")
      .select("mission_id")
      .eq("user_id", user.id)
      .eq("status", "COMPLETED")

    const completedMissionIds = ((completed || []) as { mission_id: number }[]).map((r) => r.mission_id)
    const totalXp = calculateTotalXp(completedMissionIds)
    const level = calculateLevel(totalXp)

    // Get project features
    const completedFeatures = completedMissionIds
      .map((id) => getMissionById(id)?.projectFeature)
      .filter(Boolean) as string[]

    const student = {
      level,
      weakTopics: [] as string[],
      quizAverage: 0,
      preferredStyle: (profile as unknown as Record<string, unknown>)?.preferred_learning_style as string | null || null,
    }

    const projectContext = {
      version: `v0.0.${completedMissionIds.length}`,
      completedFeatures: completedFeatures.slice(-5),
    }

    const knowledgeSnippets = mission.officialSources.map(
      (url) => `Source: ${url}\n(Content fetched from official documentation)`
    )

    const systemPrompt = buildLessonSystemPrompt()
    const userPrompt = buildLessonUserPrompt(mission, student, projectContext, knowledgeSnippets)

    const lesson = await generateStructuredResponse<LessonResponse>(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: 4096,
    })

    // Save lesson to DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("generated_lessons").upsert({
      user_id: user.id,
      mission_id: missionId,
      content: lesson.theory,
      python_version: "3.12",
      library_versions: {},
      documentation_version: "2025.1",
      prompt_version: LESSON_PROMPT_VERSION,
      source_urls: mission.officialSources,
    }, { onConflict: "user_id,mission_id" })

    // Create/update mission progress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("mission_progress").upsert({
      user_id: user.id,
      mission_id: missionId,
      status: "IN_PROGRESS",
      lesson_viewed: true,
      started_at: new Date().toISOString(),
    }, { onConflict: "user_id,mission_id" })

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
