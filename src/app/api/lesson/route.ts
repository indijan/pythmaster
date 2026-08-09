import { NextRequest, NextResponse } from "next/server"
import { generateStructuredResponse } from "@/lib/openai/client"
import { buildLessonSystemPrompt, buildLessonUserPrompt, LESSON_PROMPT_VERSION } from "@/lib/prompts"
import { getMissionById, getMissionLevelBand, getMissionRecommendedLevel, getLocalizedMission } from "@/lib/curriculum"
import { calculateTotalXp, calculateLevel } from "@/lib/mission-engine"
import { createClient } from "@/lib/supabase/server"
import { upsertMissionProgress } from "@/lib/mission-progress"

// GET — return existing lesson from DB (no regeneration)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const missionId = request.nextUrl.searchParams.get("missionId")
  if (!missionId) {
    return NextResponse.json({ error: "missionId is required" }, { status: 400 })
  }

  const requestedLanguage = request.nextUrl.searchParams.get("language") === "hu" ? "hu" : "en"
  const requestedStudentLevelRaw = Number(request.nextUrl.searchParams.get("studentLevel"))
  const requestedStudentLevel = Number.isFinite(requestedStudentLevelRaw) && requestedStudentLevelRaw > 0
    ? Math.min(7, Math.max(1, Math.round(requestedStudentLevelRaw)))
    : null
  const expectedStudentLevel = requestedStudentLevel ?? getMissionRecommendedLevel(parseInt(missionId, 10))

  const { data: lesson } = await supabase
    .from("generated_lessons")
    .select("content, created_at, prompt_version")
    .eq("user_id", user.id)
    .eq("mission_id", parseInt(missionId))
    .single()

  if (!lesson) {
    return NextResponse.json(null, { status: 404 })
  }

  const cachedContent = (lesson as Record<string, string>).content
  try {
    const parsed = JSON.parse(cachedContent) as Partial<LessonResponse> & {
      meta?: {
        language?: string
        studentLevel?: number
        promptVersion?: string
      }
    }
    const promptVersionMatches = (lesson as Record<string, string>).prompt_version === LESSON_PROMPT_VERSION
    const languageMatches = parsed?.meta?.language === requestedLanguage
    const levelMatches = parsed?.meta?.studentLevel === expectedStudentLevel
    if (promptVersionMatches && languageMatches && levelMatches && parsed && typeof parsed === "object" && parsed.theory) {
      return NextResponse.json({
        ...parsed,
        cached: true,
        createdAt: (lesson as Record<string, string>).created_at,
      })
    }
  } catch {
    // fall back to regeneration for legacy content
  }

  return NextResponse.json(null, { status: 404 })
}

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
    const { missionId, language, studentLevel } = body as { missionId: number; language?: string; studentLevel?: number }
    if (!missionId) {
      return NextResponse.json({ error: "missionId is required" }, { status: 400 })
    }

    const normalizedLanguage = language === "hu" ? "hu" : "en"
    const lang = normalizedLanguage === "hu" ? "Hungarian" : "English"

    const mission = getMissionById(missionId)
    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 })
    }
    const localizedMission = getLocalizedMission(mission, normalizedLanguage)
    const levelBand = getMissionLevelBand(missionId)
    const requestedStudentLevel = typeof studentLevel === "number" && Number.isFinite(studentLevel)
      ? Math.min(7, Math.max(1, Math.round(studentLevel)))
      : getMissionRecommendedLevel(missionId)

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

    const knowledgeSnippets = localizedMission.officialSources.map(
      (url) => `Source: ${url}\n(Content fetched from official documentation)`
    )

    const systemPrompt = buildLessonSystemPrompt(lang, requestedStudentLevel)
    const userPrompt = buildLessonUserPrompt(localizedMission, student, projectContext, knowledgeSnippets, levelBand)

    const lesson = await generateStructuredResponse<LessonResponse>(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: 4096,
    })

    const lessonRecord = {
      ...lesson,
      meta: {
        missionId: mission.id,
        language: normalizedLanguage,
        studentLevel: requestedStudentLevel,
        promptVersion: LESSON_PROMPT_VERSION,
        generatedAt: new Date().toISOString(),
      },
    }

    // Save lesson to DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("generated_lessons").upsert({
      user_id: user.id,
      mission_id: missionId,
      content: JSON.stringify(lessonRecord),
      python_version: "3.12",
      library_versions: {},
      documentation_version: "2025.1",
      prompt_version: LESSON_PROMPT_VERSION,
      source_urls: mission.officialSources,
    }, { onConflict: "user_id,mission_id" })

    await upsertMissionProgress(supabase, user.id, missionId, {
      status: "IN_PROGRESS",
      lessonViewed: true,
    })

    return NextResponse.json({
      ...lessonRecord,
      meta: {
        ...lessonRecord.meta,
        missionId: mission.id,
        promptVersion: LESSON_PROMPT_VERSION,
        pythonVersion: "3.12",
        recommendedLevel: {
          label: levelBand.label,
          min: levelBand.min,
          max: levelBand.max,
        },
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
