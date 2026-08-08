"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Playground } from "@/components/playground/playground"
import { getMissionById } from "@/lib/curriculum"
import { useT } from "@/lib/i18n/context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Code2,
  CheckCircle2,
  ClipboardCheck,
  Lightbulb,
  FileText,
  Download,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface LessonExample {
  title: string
  code: string
  explanation: string
}

interface GuidedChallenge {
  description: string
  starterCode: string
  expectedOutput: string
}

interface IndependentChallenge {
  description: string
  requirements: string[]
}

interface BonusChallenge {
  description: string
}

interface CommonMistake {
  mistake: string
  correction: string
}

interface LessonData {
  theory: string
  examples?: LessonExample[]
  guidedChallenge?: GuidedChallenge
  independentChallenge?: IndependentChallenge
  bonusChallenge?: BonusChallenge
  keyTakeaways?: string[]
  commonMistakes?: CommonMistake[]
  sources?: string[]
}

interface ReviewData {
  score: number
  passed: boolean
  summary: string
  strengths: string[]
  improvements: { area: string; suggestion: string; example?: string }[]
  pythonicTips: string[]
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface QuizData {
  questions: QuizQuestion[]
}

interface SummaryData {
  summary: string
  cheatSheet: string
  nextMissionPreview: string
}

interface LessonViewProps {
  missionId: number
  missionTitle: string
  learningObjectives: string[]
  projectFeature: string
  requiredQuizScore: number
}

interface MissionProgressUpdate {
  status?: "IN_PROGRESS" | "CODE_REVIEW" | "QUIZ" | "PROJECT" | "COMPLETED"
  lessonViewed?: boolean
  examplesExecuted?: boolean
  challengePassed?: boolean
  codeReviewCompleted?: boolean
  quizPassed?: boolean
  quizScore?: number | null
  projectUpdated?: boolean
  summaryGenerated?: boolean
  completedAt?: string | null
  incrementAttempts?: boolean
}

export function MissionLessonView({
  missionId,
  missionTitle,
  learningObjectives,
  projectFeature,
  requiredQuizScore,
}: LessonViewProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loadingLesson, setLoadingLesson] = useState(false)
  const [fromCache, setFromCache] = useState(false)
  const [challengeCode, setChallengeCode] = useState("")
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const { lang } = useT()
  const nextMission = getMissionById(missionId + 1)

  const isHungarian = lang === "hu"

  const copy = useMemo(
    () =>
      isHungarian
        ? {
            lesson: "Lecke",
            practice: "Gyakorlás",
            challenge: "Feladat",
            review: "AI ellenőrzés",
            quiz: "Kvíz",
            summary: "Összegzés",
            generateLesson: "Lecke generálása",
            continueReading: "Olvasás folytatása",
            generatingLesson: "A személyre szabott lecke készül...",
            continuePractice: "Tovább a gyakorláshoz",
            backToPractice: "Vissza a gyakorláshoz",
            submitReview: "Beküldés ellenőrzésre",
            generatingReview: "AI ellenőrzés készül...",
            continueToQuiz: "Tovább a kvízhez",
            generatingQuiz: "Kvíz generálása...",
            submitQuiz: "Kvíz beküldése és összegzés",
            generatingSummary: "Összegzés készül...",
            expectedOutput: "Elvárt kimenet",
            starterCode: "Kezdőkód",
            requirements: "Követelmények",
            takeaways: "Fő tanulságok",
            mistakes: "Gyakori hibák",
            examples: "Példák",
            sources: "Források",
            strengths: "Erősségek",
            improvements: "Javítási javaslatok",
            tips: "Pythonic tippek",
            quizPassMark: "A továbblépéshez szükséges pontszám",
            answer: "Válasz",
            score: "Pontszám",
            passed: "Sikeres",
            retry: "Újrapróbálás",
            quizReady: "A kérdések a lecke és a tanulói hibák alapján készültek.",
            summaryReady: "Az összegzés a visszajelzést, a kódot és a kvíz eredményt használja.",
            reviewPrompt: "Írd meg a megoldást, majd kérj AI ellenőrzést.",
          }
        : {
            lesson: "Lesson",
            practice: "Practice",
            challenge: "Challenge",
            review: "AI Review",
            quiz: "Quiz",
            summary: "Summary",
            generateLesson: "Generate Lesson",
            continueReading: "Continue Reading",
            generatingLesson: "Generating your personalized lesson...",
            continuePractice: "Continue to Practice",
            backToPractice: "Back to Practice",
            submitReview: "Submit for Review",
            generatingReview: "Running AI review...",
            continueToQuiz: "Continue to Quiz",
            generatingQuiz: "Generating quiz...",
            submitQuiz: "Submit Quiz and Generate Summary",
            generatingSummary: "Generating summary...",
            expectedOutput: "Expected Output",
            starterCode: "Starter Code",
            requirements: "Requirements",
            takeaways: "Key Takeaways",
            mistakes: "Common Mistakes",
            examples: "Examples",
            sources: "Sources",
            strengths: "Strengths",
            improvements: "Improvement Notes",
            tips: "Pythonic Tips",
            quizPassMark: "Required to pass",
            answer: "Answer",
            score: "Score",
            passed: "Passed",
            retry: "Retry",
            quizReady: "The questions are based on the lesson and your code review context.",
            summaryReady: "The summary uses the review feedback, code, and quiz result.",
            reviewPrompt: "Write your solution, then submit it for AI review.",
          },
    [isHungarian]
  )

  const steps = useMemo(
    () => [
      { id: "lesson", label: copy.lesson, icon: BookOpen },
      { id: "playground", label: copy.practice, icon: Code2 },
      { id: "challenge", label: copy.challenge, icon: ClipboardCheck },
      { id: "review", label: copy.review, icon: CheckCircle2 },
      { id: "quiz", label: copy.quiz, icon: FileText },
      { id: "summary", label: copy.summary, icon: Download },
    ],
    [copy.challenge, copy.lesson, copy.practice, copy.quiz, copy.review, copy.summary]
  )

  const saveProgress = async (update: MissionProgressUpdate) => {
    try {
      const response = await fetch("/api/mission-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          ...update,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error || "Mission progress update failed")
      }
    } catch (error) {
      console.error("Failed to save mission progress:", error)
    }
  }

  const loadLesson = async (forceGenerate = false) => {
    setLoadingLesson(true)
    try {
      if (!forceGenerate) {
        const cached = await fetch(`/api/lesson?missionId=${missionId}`)
        if (cached.ok) {
          const data = (await cached.json()) as LessonData & { cached?: boolean }
          if (data?.theory) {
            setLesson(data)
            setFromCache(Boolean(data.cached))
            if (data.guidedChallenge?.starterCode) {
              setChallengeCode(data.guidedChallenge.starterCode)
            }
            void saveProgress({ lessonViewed: true, status: "IN_PROGRESS" })
            setLoadingLesson(false)
            return
          }
        }
      }

      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, language: lang }),
      })
      const data = (await res.json()) as LessonData
      if (data?.theory) {
        setLesson(data)
        setFromCache(false)
        if (data.guidedChallenge?.starterCode) {
          setChallengeCode(data.guidedChallenge.starterCode)
        }
        void saveProgress({ lessonViewed: true, status: "IN_PROGRESS" })
      }
    } catch (err) {
      console.error("Failed to load lesson:", err)
    } finally {
      setLoadingLesson(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLesson()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadReview = async () => {
    if (!lesson) return
    setReviewLoading(true)
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          code: challengeCode,
          challengeDescription:
            lesson.guidedChallenge?.description || projectFeature,
          requirements:
            lesson.independentChallenge?.requirements || learningObjectives,
          language: lang,
        }),
      })
      const data = (await response.json()) as ReviewData
      if (!response.ok) {
        throw new Error(data?.summary || "Review generation failed")
      }
      setReviewData(data)
      setActiveStep(3)
      void saveProgress({
        challengePassed: data.passed,
        codeReviewCompleted: true,
        status: data.passed ? "CODE_REVIEW" : "IN_PROGRESS",
        incrementAttempts: true,
      })
    } catch (error) {
      console.error("Failed to generate review:", error)
    } finally {
      setReviewLoading(false)
    }
  }

  const loadQuiz = async () => {
    if (!lesson) return
    setQuizLoading(true)
    try {
      const lessonSummary = [
        lesson.theory,
        ...(lesson.keyTakeaways || []).map((takeaway) => `- ${takeaway}`),
      ].join("\n")

      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          lessonSummary,
          language: lang,
        }),
      })
      const data = (await response.json()) as QuizData
      if (!response.ok) {
        throw new Error("Quiz generation failed")
      }
      setQuizData(data)
      setQuizAnswers({})
      setQuizScore(null)
      setActiveStep(4)
      void saveProgress({ status: "QUIZ" })
    } catch (error) {
      console.error("Failed to generate quiz:", error)
    } finally {
      setQuizLoading(false)
    }
  }

  const submitQuiz = async () => {
    if (!lesson || !quizData) return
    const correct = quizData.questions.reduce((count, question) => {
      return count + (quizAnswers[question.id] === question.correctIndex ? 1 : 0)
    }, 0)
    const score = Math.round((correct / quizData.questions.length) * 100)
    setQuizScore(score)
    void saveProgress({
      quizPassed: score >= requiredQuizScore,
      quizScore: score,
      status: score >= requiredQuizScore ? "PROJECT" : "QUIZ",
    })
    setSummaryLoading(true)
    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          code: challengeCode,
          quizScore: score,
          reviewFeedback: reviewData?.summary || "",
          language: lang,
        }),
      })
      const data = (await response.json()) as SummaryData
      if (!response.ok) {
        throw new Error("Summary generation failed")
      }
      setSummaryData(data)
      setActiveStep(5)
      void saveProgress({
        summaryGenerated: true,
        projectUpdated: true,
        quizPassed: score >= requiredQuizScore,
        quizScore: score,
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to generate summary:", error)
    } finally {
      setSummaryLoading(false)
    }
  }

  const currentStep = steps[activeStep]
  const missionCompleted = quizScore !== null && quizScore >= requiredQuizScore

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium text-sm">{missionTitle}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {copy.quizPassMark}: {requiredQuizScore}%
              </p>
            </div>
            <Badge variant="outline">
              Step {activeStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={((activeStep + 1) / steps.length) * 100} className="h-1.5 mb-3" />
          <Tabs
            value={currentStep.id}
            onValueChange={(v) => {
              const idx = steps.findIndex((step) => step.id === v)
              if (idx >= 0) setActiveStep(idx)
            }}
          >
            <TabsList className="w-full justify-start h-9 overflow-x-auto">
              {steps.map((step) => (
                <TabsTrigger key={step.id} value={step.id} className="text-xs gap-1 h-7">
                  <step.icon className="h-3 w-3" />
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lesson Content */}
      {activeStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {copy.lesson}
            </CardTitle>
            <CardDescription>
              {isHungarian
                ? "A lecke a szintedhez, a projektkörnyezethez és a hivatalos Python dokumentációhoz igazodik."
                : "The lesson adapts to your level, project context, and the official Python docs."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!lesson && !loadingLesson && (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {isHungarian
                    ? "Generáld a személyre szabott leckét ehhez a küldetéshez."
                    : "Generate the personalized lesson for this mission."}
                </p>
                <Button onClick={() => void loadLesson(true)}>
                  {fromCache ? copy.continueReading : copy.generateLesson}
                </Button>
              </div>
            )}
            {loadingLesson && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">{copy.generatingLesson}</span>
              </div>
            )}
            {lesson && (
              <div className="space-y-5">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{lesson.theory}</div>
                </div>
                {lesson.examples?.length ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {copy.examples}
                    </h4>
                    <div className="grid gap-3">
                      {lesson.examples.map((example, index) => (
                        <Card key={`${example.title}-${index}`} className="border-dashed">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{example.title}</CardTitle>
                            <CardDescription>{example.explanation}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <pre className="rounded-md bg-muted/60 p-3 text-xs overflow-auto whitespace-pre-wrap">
                              {example.code}
                            </pre>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : null}
                {lesson.keyTakeaways?.length ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{copy.takeaways}</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {lesson.keyTakeaways.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {lesson.commonMistakes?.length ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{copy.mistakes}</h4>
                    <div className="grid gap-2">
                      {lesson.commonMistakes.map((item) => (
                        <div key={item.mistake} className="rounded-md border bg-muted/20 p-3 text-sm">
                          <p className="font-medium">{item.mistake}</p>
                          <p className="text-muted-foreground mt-1">{item.correction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {lesson.sources?.length ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{copy.sources}</h4>
                    <ul className="space-y-1 text-sm">
                      {lesson.sources.map((source) => (
                        <li key={source}>
                          <a
                            href={source}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {source}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="flex justify-end mt-2">
                  <Button onClick={() => setActiveStep(1)}>
                    {copy.continuePractice}
                    <Code2 className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Practice */}
      {activeStep === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                {copy.practice}
              </CardTitle>
              <CardDescription>
                {isHungarian
                  ? "Itt kipróbálhatod a megoldásodat a teljes ellenőrzés előtt."
                  : "Use this space to explore before the formal challenge."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Playground
                code={challengeCode}
                onCodeChange={setChallengeCode}
                onRunComplete={({ error }) => {
                  if (!error) {
                    void saveProgress({ examplesExecuted: true, status: "IN_PROGRESS" })
                  }
                }}
                defaultCode={
                  lesson?.guidedChallenge?.starterCode ||
                  `# ${missionTitle}\n# ${projectFeature}\n\nprint("Let's start building.")\n`
                }
                height="350px"
              />
              <div className="flex justify-end">
                <Button onClick={() => setActiveStep(2)}>
                  {copy.review}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Challenge */}
      {activeStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              {copy.challenge}
            </CardTitle>
            <CardDescription>{copy.reviewPrompt}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{copy.starterCode}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="rounded-md bg-muted/60 p-3 text-xs overflow-auto whitespace-pre-wrap">
                    {lesson?.guidedChallenge?.starterCode || challengeCode}
                  </pre>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{copy.expectedOutput}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {lesson?.guidedChallenge?.expectedOutput ||
                    (isHungarian
                      ? "Az elvárt kimenetet a megoldásod alapján fogja az AI ellenőrizni."
                      : "The AI review will validate the output pattern from your solution.")}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{copy.requirements}</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {(lesson?.independentChallenge?.requirements || learningObjectives).map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Playground
              code={challengeCode}
              onCodeChange={setChallengeCode}
              onRunComplete={({ error }) => {
                if (!error) {
                  void saveProgress({ examplesExecuted: true, status: "IN_PROGRESS" })
                }
              }}
              height="350px"
            />

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setActiveStep(1)}>
                {copy.backToPractice}
              </Button>
              <Button onClick={() => void loadReview()} disabled={reviewLoading}>
                {reviewLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {copy.generatingReview}
                  </>
                ) : (
                  <>
                    {copy.submitReview}
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review */}
      {activeStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {copy.review}
            </CardTitle>
            <CardDescription>
              {isHungarian
                ? "A visszajelzés a helyességet, az olvashatóságot és a Python-stílust értékeli."
                : "The feedback evaluates correctness, readability, and Pythonic style."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!reviewData && reviewLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">{copy.generatingReview}</span>
              </div>
            )}
            {reviewData && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={reviewData.passed ? "default" : "secondary"} className="text-xs">
                    {copy.score}: {reviewData.score}%
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {reviewData.passed ? copy.passed : copy.retry}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{reviewData.summary}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{copy.strengths}</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {reviewData.strengths.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{copy.improvements}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {reviewData.improvements.map((item) => (
                        <li key={`${item.area}-${item.suggestion}`} className="rounded-md border bg-muted/20 p-3">
                          <p className="font-medium text-foreground">{item.area}</p>
                          <p className="mt-1">{item.suggestion}</p>
                          {item.example ? (
                            <pre className="mt-2 overflow-auto rounded bg-background p-2 text-xs">
                              {item.example}
                            </pre>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">{copy.tips}</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {reviewData.pythonicTips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setActiveStep(2)}>
                {copy.backToPractice}
              </Button>
              <Button onClick={() => void loadQuiz()} disabled={quizLoading || !reviewData}>
                {quizLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {copy.generatingQuiz}
                  </>
                ) : (
                  <>
                    {copy.continueToQuiz}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz */}
      {activeStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {copy.quiz}
            </CardTitle>
            <CardDescription>{copy.quizReady}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!quizData && quizLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">{copy.generatingQuiz}</span>
              </div>
            )}
            {quizData && (
              <div className="space-y-4">
                {quizData.questions.map((question, index) => (
                  <Card key={question.id} className="border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        {index + 1}. {question.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const selected = quizAnswers[question.id] === optionIndex
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setQuizAnswers((current) => ({
                                ...current,
                                [question.id]: optionIndex,
                              }))
                            }
                            className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                              selected ? "border-primary bg-primary/10" : "hover:bg-muted/50"
                            }`}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {quizScore !== null && (
              <div className="rounded-md border bg-muted/20 p-4 text-sm">
                <p className="font-medium">
                  {copy.score}: {quizScore}%
                </p>
                <p className="text-muted-foreground mt-1">
                  {quizScore >= requiredQuizScore ? copy.passed : copy.retry}
                </p>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setActiveStep(3)}>
                {copy.backToPractice}
              </Button>
              <Button onClick={() => void submitQuiz()} disabled={summaryLoading || !quizData}>
                {summaryLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {copy.generatingSummary}
                  </>
                ) : (
                  <>
                    {copy.submitQuiz}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {activeStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {copy.summary}
            </CardTitle>
            <CardDescription>{copy.summaryReady}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!summaryData && summaryLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">{copy.generatingSummary}</span>
              </div>
            )}
            {summaryData && (
              <div className="space-y-4">
                <div className="rounded-md border bg-muted/20 p-4">
                  <pre className="whitespace-pre-wrap text-sm leading-6">{summaryData.summary}</pre>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border bg-muted/20 p-4">
                    <h4 className="text-sm font-semibold mb-2">{isHungarian ? "Cheat sheet" : "Cheat Sheet"}</h4>
                    <pre className="whitespace-pre-wrap text-xs leading-5">{summaryData.cheatSheet}</pre>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-4">
                    <h4 className="text-sm font-semibold mb-2">
                      {isHungarian ? "Következő lépés" : "What's Next"}
                    </h4>
                    <p className="text-sm text-muted-foreground">{summaryData.nextMissionPreview}</p>
                    {quizScore !== null && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                        {copy.score}: {quizScore}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              {missionCompleted ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline">
                      {isHungarian ? "Irányítópult" : "Dashboard"}
                    </Button>
                  </Link>
                  {nextMission && (
                    <Link href={`/mission/${nextMission.id}`}>
                      <Button>
                        {isHungarian ? "Következő küldetés" : "Next Mission"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <Button variant="outline" onClick={() => setActiveStep(4)}>
                  {isHungarian ? "Vissza a kvízhez" : "Back to Quiz"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
