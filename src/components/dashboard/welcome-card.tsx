import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Language } from "@/lib/i18n/translations"

interface WelcomeCardProps {
  displayName: string
  currentMissionTitle: string | null
  missionId: number | null
  lang: Language
}

export function WelcomeCard({ displayName, currentMissionTitle, missionId, lang }: WelcomeCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {lang === "hu" ? "Üdv újra," : "Welcome back,"}
            </p>
            <h2 className="text-2xl font-bold">{displayName} 👋</h2>
            {currentMissionTitle && (
              <p className="text-muted-foreground mt-2">
                {lang === "hu" ? "Folytasd ezzel:" : "Continue with"}{" "}
                <span className="font-medium text-foreground">
                  Mission {missionId}: {currentMissionTitle}
                </span>
              </p>
            )}
          </div>
          {currentMissionTitle && missionId && (
            <Link href={`/mission/${missionId}`}>
              <Button className="shrink-0">
                {lang === "hu" ? "Küldetés folytatása" : "Continue Mission"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
