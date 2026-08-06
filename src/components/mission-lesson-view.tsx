"use client"

import { useState, useEffect } from "react"
import { Playground } from "@/components/playground/playground"
import { useT } from "@/lib/i18n/context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"

interface LessonViewProps {
  missionId: number
  missionTitle: string
  learningObjectives: string[]
  projectFeature: string
}

export function MissionLessonView({
  missionId,
  missionTitle,
  learningObjectives,
  projectFeature,
}: LessonViewProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [lessonContent, setLessonContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fromCache, setFromCache] = useState(false)
  const { lang } = useT()

  // Auto-load existing lesson on mount
  useEffect(() => {
    loadLesson()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const steps = [
    { id: "lesson", label: "Lesson", icon: BookOpen },
    { id: "playground", label: "Practice", icon: Code2 },
    { id: "challenge", label: "Challenge", icon: ClipboardCheck },
    { id: "review", label: "Review", icon: CheckCircle2 },
    { id: "quiz", label: "Quiz", icon: FileText },
    { id: "summary", label: "Summary", icon: Download },
  ]

  const loadLesson = async (forceGenerate = false) => {
    setLoading(true)
    try {
      if (!forceGenerate) {
        // Try cached lesson first
        const cached = await fetch(`/api/lesson?missionId=${missionId}`)
        if (cached.ok) {
          const data = await cached.json()
          if (data?.theory) {
            setLessonContent(data.theory)
            setFromCache(true)
            setLoading(false)
            return
          }
        }
      }

      // Generate new lesson
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, language: lang }),
      })
      const data = await res.json()
      if (data.theory) {
        setLessonContent(data.theory)
        setFromCache(false)
      }
    } catch (err) {
      console.error("Failed to load lesson:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">{missionTitle}</h3>
            <Badge variant="outline">Step {activeStep + 1} of {steps.length}</Badge>
          </div>
          <Progress value={((activeStep + 1) / steps.length) * 100} className="h-1.5 mb-3" />
          <Tabs value={steps[activeStep].id} onValueChange={(v) => {
            const idx = steps.findIndex((s) => s.id === v)
            if (idx >= 0) setActiveStep(idx)
          }}>
            <TabsList className="w-full justify-start h-9 overflow-x-auto">
              {steps.map((step, i) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className="text-xs gap-1 h-7"
                >
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
              Lesson
            </CardTitle>
            <CardDescription>
              AI-generated lesson tailored to your learning style
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!lessonContent && !loading && (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Generate your personalized lesson for this mission.
                </p>
                <Button onClick={() => loadLesson()}>
                  {fromCache ? "📖 Continue Reading" : "Generate Lesson"}
                </Button>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Generating your lesson...</span>
              </div>
            )}
            {lessonContent && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{lessonContent}</div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => setActiveStep(1)}>
                    Continue to Practice
                    <Code2 className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Playground */}
      {activeStep === 1 && (
        <Playground
          defaultCode={`# ${missionTitle} — Practice Area
# ${projectFeature}

# Write your code here:
print("Let's build something!")

# Learning objectives:
${learningObjectives.map((o) => `# - ${o}`).join("\n")}
`}
          height="350px"
        />
      )}

      {/* Challenge */}
      {activeStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              {lang === "hu" ? "Feladat" : "Challenge"}
            </CardTitle>
            <CardDescription>
              {lang === "hu"
                ? "Írd meg a megoldást és kérd az AI ellenőrzést"
                : "Write your solution and submit for AI review"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              {lang === "hu"
                ? `Cél: ${projectFeature}`
                : `Goal: ${projectFeature}`}
            </p>
            <Playground height="350px" />
            <div className="flex justify-end">
              <Button onClick={async () => {
                setActiveStep(3)
              }}>
                {lang === "hu" ? "Beküldés" : "Submit for Review"}
                <CheckCircle2 className="h-4 w-4 ml-2" />
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
              {lang === "hu" ? "AI Ellenőrzés" : "AI Review"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {lang === "hu"
                ? "Az AI átnézi a kódod helyességét, olvashatóságát és pythonic stílusát."
                : "The AI will review your code for correctness, readability, and Pythonic style."}
            </p>
            <p className="text-sm">
              {lang === "hu"
                ? "💡 Tipp: futtasd a kódot a Playground-ban, mielőtt továbblépsz!"
                : "💡 Tip: run your code in the Playground before moving on!"}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveStep(2)}>
                {lang === "hu" ? "Vissza a feladathoz" : "Back to Challenge"}
              </Button>
              <Button onClick={() => setActiveStep(4)}>
                {lang === "hu" ? "Tovább a kvízhez" : "Continue to Quiz"}
                <ArrowRight className="h-4 w-4 ml-2" />
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
              {lang === "hu" ? "Kvíz" : "Quiz"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {lang === "hu"
                ? "10 kérdéses kvíz következik. A továbblépéshez 80% szükséges."
                : "10-question quiz coming up. 80% required to pass."}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveStep(3)}>
                {lang === "hu" ? "Vissza" : "Back"}
              </Button>
              <Button onClick={() => setActiveStep(5)}>
                {lang === "hu" ? "Tovább az összegzéshez" : "Continue to Summary"}
                <ArrowRight className="h-4 w-4 ml-2" />
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
              {lang === "hu" ? "Összegzés" : "Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {lang === "hu"
                ? "Gratulálunk! Teljesítetted a küldetést. Az összegzés tartalmazza a fő tanulságokat és egy cheat sheet-et."
                : "Congratulations! You completed the mission. The summary includes key takeaways and a cheat sheet."}
            </p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setActiveStep(4)}>
                {lang === "hu" ? "Vissza a kvízhez" : "Back to Quiz"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
