import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <Settings className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <CardTitle className="text-2xl">Beállítások</CardTitle>
          <CardDescription>
            Szabd testre a tanulási élményed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>A beállítások oldal hamarosan érkezik.</p>
        </CardContent>
      </Card>
    </div>
  )
}
