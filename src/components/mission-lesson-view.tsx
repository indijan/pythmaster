"use client"

import { useState, useEffect } from "react"
import { Playground } from "@/components/playground/playground"
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
        body: JSON.stringify({ missionId }),
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
                  disabled={i > activeStep + 1}
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

      {/* Challenge placeholder */}
      {activeStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Challenge</CardTitle>
            <CardDescription>Apply what you learned</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Complete the coding challenge to unlock the review.
            </p>
            <Playground height="350px" />
          </CardContent>
        </Card>
      )}

      {/* Review / Quiz / Summary placeholders */}
      {activeStep >= 3 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Complete the previous steps to unlock this section.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
