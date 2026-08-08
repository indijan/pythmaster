import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen, MessageCircle } from "lucide-react"
import type { Language } from "@/lib/i18n/translations"

interface AIMentorCardProps {
  recommendation: string
  lang: Language
}

export function AIMentorCard({ recommendation, lang }: AIMentorCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          {lang === "hu" ? "AI mentor" : "AI Mentor"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-sm">{recommendation}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            {lang === "hu" ? "Ellenőrzés" : "Review"}
          </Button>
          <Button size="sm" variant="secondary">
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            {lang === "hu" ? "Kérdezz" : "Ask AI"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
