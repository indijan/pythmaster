"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { usePythonRunner } from "./use-python-runner"
import { useT } from "@/lib/i18n/context"
import {
  Play,
  RotateCcw,
  Loader2,
  Terminal,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

// Monaco Editor must be dynamically imported (client-only)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-muted/30 rounded-md">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

interface PlaygroundProps {
  defaultCode?: string
  example?: string
  height?: string
  code?: string
  onCodeChange?: (code: string) => void
  onRunComplete?: (result: { output: string; error: string | null }) => void
}

const DEFAULT_CODE = [
  "# Welcome to the Python Playground! 🐍",
  "# Try running this code:",
  "",
  'print("Hello, Crypto Exchange Analyzer!")',
  "",
  "# Calculate some basic metrics",
  "btc_price = 65000.00",
  "eth_price = 3200.00",
  "",
  "total = btc_price + eth_price",
  'print(f"BTC: ${btc_price:,.2f}")',
  'print(f"ETH: ${eth_price:,.2f}")',
  'print(f"Total: ${total:,.2f}")',
  "",
].join("\n")

export function Playground({
  defaultCode = DEFAULT_CODE,
  example,
  height = "400px",
  code,
  onCodeChange,
  onRunComplete,
}: PlaygroundProps) {
  const [internalCode, setInternalCode] = useState(() => code ?? (example || defaultCode))
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("output")
  const { runCode, runState } = usePythonRunner()
  const { lang } = useT()

  const currentCode = code ?? internalCode

  const handleRun = useCallback(async () => {
    setError(null)
    setOutput("")
    setActiveTab("output")

    const result = await runCode(currentCode)
    setOutput(result.output)
    setError(result.error)
    onRunComplete?.(result)

    if (result.error) {
      setActiveTab("output")
    }
  }, [currentCode, onRunComplete, runCode])

  const handleReset = useCallback(() => {
    const nextCode = example || defaultCode
    if (onCodeChange) {
      onCodeChange(nextCode)
    } else {
      setInternalCode(nextCode)
    }
    setOutput("")
    setError(null)
  }, [defaultCode, example, onCodeChange])

  const text = lang === "hu"
    ? {
        title: "Python Játszótér",
        loading: "Python betöltése...",
        runtimeError: "Futási hiba",
        reset: "Visszaállítás",
        run: "Futtatás",
        running: "Futtatás...",
        output: "Kimenet",
        hints: "Tippek",
        clickRun: 'Kattints a "Futtatás"-ra a kód futtatásához.',
        tip1: "Használd a `print()`-et a kimenet megjelenítéséhez.",
        tip2: "Ellenőrizd a behúzást, mert a Python szóközökkel jelöli a blokkokat.",
        tip3: "A változónevek kis- és nagybetű érzékenyek.",
        error: "Hiba",
        loadingRuntime: "Python futtatókörnyezet betöltése...",
      }
    : {
        title: "Python Playground",
        loading: "Loading Python...",
        runtimeError: "Runtime Error",
        reset: "Reset",
        run: "Run",
        running: "Running...",
        output: "Output",
        hints: "Hints",
        clickRun: 'Click "Run" to execute your code.',
        tip1: "Use `print()` to see output.",
        tip2: "Check your indentation - Python uses spaces to define blocks.",
        tip3: "Variable names are case-sensitive.",
        error: "Error",
        loadingRuntime: "Loading Python runtime...",
      }

  const isLoading = runState === "loading"
  const isRunning = runState === "running"
  const isError = runState === "error"

  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            {text.title}
            {isLoading && (
              <Badge variant="secondary" className="text-xs">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                {text.loading}
              </Badge>
            )}
            {isError && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {text.runtimeError}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isRunning || isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {text.reset}
            </Button>
            <Button
              size="sm"
              onClick={handleRun}
              disabled={isRunning || isLoading || isError}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  {text.running}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  {text.run}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Editor */}
        <div className="border rounded-md overflow-hidden" style={{ height }}>
          <MonacoEditor
            language="python"
            value={currentCode}
            onChange={(value) => {
              const nextValue = value || ""
              if (onCodeChange) {
                onCodeChange(nextValue)
              } else {
                setInternalCode(nextValue)
              }
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              padding: { top: 8 },
            }}
            loading={
              <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            }
          />
        </div>

        {/* Output Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8">
            <TabsTrigger value="output" className="text-xs gap-1 h-7">
              <Terminal className="h-3 w-3" />
              {text.output}
              {output && !error && (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="hints" className="text-xs gap-1 h-7">
              <Lightbulb className="h-3 w-3" />
              {text.hints}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="output">
            <div className="bg-muted/50 rounded-md p-3 min-h-[80px] max-h-[200px] overflow-auto font-mono text-sm">
              {output ? (
                <pre className="whitespace-pre-wrap break-words text-foreground">
                  {output}
                </pre>
              ) : error ? (
                <div className="text-destructive">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">{text.error}</span>
                  </div>
                  <pre className="whitespace-pre-wrap break-words">{error}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  {isLoading ? text.loadingRuntime : text.clickRun}
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="hints">
            <div className="bg-muted/50 rounded-md p-3 min-h-[80px] text-sm text-muted-foreground space-y-1">
              <p>💡 <strong>Tip:</strong> {text.tip1}</p>
              <p>💡 <strong>Tip:</strong> {text.tip2}</p>
              <p>💡 <strong>Tip:</strong> {text.tip3}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
