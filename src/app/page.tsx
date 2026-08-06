import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen, Code2, Rocket, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Learning Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Learn Python &amp;{" "}
            <span className="text-primary">Data Engineering</span>{" "}
            by Building
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            One continuously evolving real-world application. No throwaway code.
            Every lesson adds a feature. Finish with a portfolio-quality project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                Start Learning Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Continue Learning
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Project-Driven</h3>
              <p className="text-muted-foreground text-sm">
                Build the Crypto Exchange Analyzer step by step. Every mission
                extends one application.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Mentor</h3>
              <p className="text-muted-foreground text-sm">
                Your personal AI senior developer — explains, reviews, encourages,
                and adapts to your pace.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Portfolio First</h3>
              <p className="text-muted-foreground text-sm">
                Finish with a resume-ready skill profile and a production-style
                project to show employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="w-full py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">What You&apos;ll Learn</h2>
          <p className="text-muted-foreground mb-10">
            38 missions across 6 phases — from zero to Data Engineer
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "Variables",
              "Data Types",
              "Input / Output",
              "Conditions",
              "Loops",
              "Functions",
              "Lists & Dicts",
              "CSV & JSON",
              "REST APIs",
              "NumPy & Pandas",
              "DuckDB",
              "ETL Pipelines",
              "FastAPI",
              "Docker",
              "Testing",
              "Deployment",
            ].map((topic) => (
              <div
                key={topic}
                className="p-3 rounded-lg bg-muted/50 text-sm font-medium"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to start your Python journey?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join learners who build real software instead of memorizing syntax.
          </p>
          <Link href="/register">
            <Button size="lg">
              Get Started — It&apos;s Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
