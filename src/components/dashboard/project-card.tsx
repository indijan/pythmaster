import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderGit2, CheckCircle2, ArrowRight } from "lucide-react"
import type { Language } from "@/lib/i18n/translations"

interface ProjectCardProps {
  version: string
  completedFeatures: string[]
  upcomingFeatures: string[]
  lang: Language
}

export function ProjectCard({
  version,
  completedFeatures,
  upcomingFeatures,
  lang,
}: ProjectCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <FolderGit2 className="h-4 w-4" />
          Crypto Exchange Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Badge variant="outline" className="font-mono text-xs">
          {version}
        </Badge>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            {lang === "hu" ? "Elkészült funkciók" : "Completed Features"}
          </p>
          <ul className="space-y-1">
            {completedFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            {lang === "hu" ? "Következő" : "Upcoming"}
          </p>
          <ul className="space-y-1">
            {upcomingFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
