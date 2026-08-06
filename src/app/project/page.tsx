import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FolderGit2 } from "lucide-react"

export default function ProjectPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <FolderGit2 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <CardTitle className="text-2xl">Crypto Exchange Analyzer</CardTitle>
          <CardDescription>
            Your portfolio project is growing with every mission.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>Project page coming soon. Complete missions to build features here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
