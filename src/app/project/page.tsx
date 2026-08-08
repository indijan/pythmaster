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
            A portfólió projekted minden küldetéssel bővül.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>A projekt oldal hamarosan érkezik. Teljesíts küldetéseket, és itt épülnek be az új funkciók.</p>
        </CardContent>
      </Card>
    </div>
  )
}
