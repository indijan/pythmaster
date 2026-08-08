import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Language } from "@/lib/i18n/translations"

interface CurrentMissionCardProps {
  missionId: number
  title: string
  estimatedMinutes: number
  difficulty: number
  status: string
  lang: Language
}

const difficultyLabels: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
}

export function CurrentMissionCard({
  missionId,
  title,
  estimatedMinutes,
  difficulty,
  status,
  lang,
}: CurrentMissionCardProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{lang === "hu" ? "Jelenlegi küldetés" : "Current Mission"}</CardTitle>
          {status === "IN_PROGRESS" && (
            <Badge variant="secondary" className="text-xs">
              {lang === "hu" ? "Folyamatban" : "In Progress"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xl font-semibold">{title}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {estimatedMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {difficultyLabels[difficulty] || "Beginner"}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/mission/${missionId}`}>
          <Button className="w-full">
            {status === "IN_PROGRESS"
              ? lang === "hu"
                ? "Küldetés folytatása"
                : "Continue Mission"
              : lang === "hu"
                ? "Küldetés indítása"
                : "Start Mission"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
