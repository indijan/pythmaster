"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { usePythonRunner } from "./use-python-runner"
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
}: PlaygroundProps) {
  const [code, setCode] = useState(example || defaultCode)
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("output")
  const { runCode, runState } = usePythonRunner()

  const handleRun = useCallback(async () => {
    setError(null)
    setOutput("")
    setActiveTab("output")

    const result = await runCode(code)
    setOutput(result.output)
    setError(result.error)

    if (result.error) {
      setActiveTab("output")
    }
  }, [code, runCode])

  const handleReset = useCallback(() => {
    setCode(example || defaultCode)
    setOutput("")
    setError(null)
  }, [defaultCode, example])

  const isLoading = runState === "loading"
  const isRunning = runState === "running"
  const isError = runState === "error"

  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Python Playground
            {isLoading && (
              <Badge variant="secondary" className="text-xs">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading Python...
              </Badge>
            )}
            {isError && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Runtime Error
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
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleRun}
              disabled={isRunning || isLoading || isError}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Run
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Editor */}
        <div
          className="border rounded-md overflow-hidden"
          style={{ height }}
        >
          <MonacoEditor
            language="python"
            value={code}
            onChange={(value) => setCode(value || "")}
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
              Output
              {output && !error && (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="hints" className="text-xs gap-1 h-7">
              <Lightbulb className="h-3 w-3" />
              Hints
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
                    <span className="font-semibold">Error</span>
                  </div>
                  <pre className="whitespace-pre-wrap break-words">{error}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  {isLoading
                    ? "Loading Python runtime..."
                    : 'Click "Run" to execute your code. Output will appear here.'}
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="hints">
            <div className="bg-muted/50 rounded-md p-3 min-h-[80px] text-sm text-muted-foreground">
              <p>💡 <strong>Tip:</strong> Use <code>print()</code> to see output.</p>
              <p>💡 <strong>Tip:</strong> Check your indentation — Python uses spaces to define blocks.</p>
              <p>💡 <strong>Tip:</strong> Variable names are case-sensitive.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
