import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <Settings className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <CardTitle className="text-2xl">Settings</CardTitle>
          <CardDescription>
            Customize your learning experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>Settings page coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
