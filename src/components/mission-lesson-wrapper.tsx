"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MissionLessonView } from "./mission-lesson-view"
import { ArrowRight } from "lucide-react"

interface MissionLessonWrapperProps {
  missionId: number
  missionTitle: string
  learningObjectives: string[]
  projectFeature: string
  requiredQuizScore: number
  startLabel: string
}

export function MissionLessonWrapper({
  missionId,
  missionTitle,
  learningObjectives,
  projectFeature,
  requiredQuizScore,
  startLabel,
}: MissionLessonWrapperProps) {
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={() => setStarted(true)}>
          {startLabel}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    )
  }

  return (
    <div className="pt-6">
      <MissionLessonView
        missionId={missionId}
        missionTitle={missionTitle}
        learningObjectives={learningObjectives}
        projectFeature={projectFeature}
        requiredQuizScore={requiredQuizScore}
      />
    </div>
  )
}
