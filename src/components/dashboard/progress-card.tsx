import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressCardProps {
  completedMissions: number
  totalMissions: number
  percentage: number
  currentPhase: string
}

export function ProgressCard({
  completedMissions,
  totalMissions,
  percentage,
  currentPhase,
}: ProgressCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-3xl font-bold">{percentage}%</span>
            <span className="text-sm text-muted-foreground">
              {completedMissions} / {totalMissions} Missions
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        <p className="text-sm text-muted-foreground">
          Current phase: <span className="font-medium text-foreground">{currentPhase}</span>
        </p>
      </CardContent>
    </Card>
  )
}
