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
            AI-alapú tanulási platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Tanulj Python és{" "}
            <span className="text-primary">Data Engineering</span>{" "}
            építés közben
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Egy folyamatosan fejlődő valódi alkalmazás. Nincs eldobható kód.
            Minden lecke új funkciót ad hozzá. A végén portfólió minőségű projekted lesz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                Kezdd el ingyen
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Tanulás folytatása
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
              <h3 className="font-semibold text-lg mb-2">Projektvezérelt</h3>
              <p className="text-muted-foreground text-sm">
                A Crypto Exchange Analyzer lépésről lépésre épül. Minden küldetés
                ugyanazt az alkalmazást bővíti.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI mentor</h3>
              <p className="text-muted-foreground text-sm">
                A személyes AI senior fejlesztőd elmagyaráz, ellenőriz, bátorít,
                és a tempódhoz igazodik.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Portfólió az első</h3>
              <p className="text-muted-foreground text-sm">
                A végén önéletrajzba tehető készségprofilod és production stílusú
                projekted lesz, amit megmutathatsz a munkáltatóknak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="w-full py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Mit fogsz megtanulni</h2>
          <p className="text-muted-foreground mb-10">
            38 küldetés 6 fázisban - nulláról Data Engineer szintig
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "Változók",
              "Adattípusok",
              "Bemenet / kimenet",
              "Feltételek",
              "Ciklusok",
              "Függvények",
              "Listák és szótárak",
              "CSV és JSON",
              "REST API-k",
              "NumPy és Pandas",
              "DuckDB",
              "ETL pipeline-ok",
              "FastAPI",
              "Docker",
              "Tesztelés",
              "Deploy",
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
            Készen állsz elkezdeni a Python utazást?
          </h2>
          <p className="text-muted-foreground mb-6">
            Csatlakozz azokhoz, akik valódi szoftvert építenek a szintaxis biflázása helyett.
          </p>
          <Link href="/register">
            <Button size="lg">
              Kezdd el - ingyenes
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
