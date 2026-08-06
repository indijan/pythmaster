import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Briefcase } from "lucide-react"
import type { ResumeSkill } from "@/types"

interface ResumeReadinessCardProps {
  skills: ResumeSkill[]
}

const levelColors: Record<string, string> = {
  Beginner: "bg-blue-500",
  Intermediate: "bg-amber-500",
  Advanced: "bg-green-500",
  Expert: "bg-purple-500",
  "Not started": "bg-muted-foreground/30",
}

export function ResumeReadinessCard({ skills }: ResumeReadinessCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Resume Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.skillName}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium">{skill.skillName}</span>
              <span className="text-xs text-muted-foreground">{skill.level}</span>
            </div>
            <Progress value={skill.progress} className="h-1.5" />
          </div>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete missions to build your resume skills.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
