"use client"

import { useState, useEffect, useCallback, useRef } from "react"

type PyodideInterface = {
  runPython: (code: string) => unknown
  loadPackage: (name: string) => Promise<void>
}

type RunState = "idle" | "loading" | "ready" | "running" | "error"

interface UsePythonRunnerReturn {
  runCode: (code: string) => Promise<{ output: string; error: string | null }>
  runState: RunState
  loadingMessage: string
}

export function usePythonRunner(): UsePythonRunnerReturn {
  const [runState, setRunState] = useState<RunState>("idle")
  const [loadingMessage, setLoadingMessage] = useState("")
  const pyodideRef = useRef<PyodideInterface | null>(null)
  const stdoutRef = useRef<string[]>([])

  // Initialize Pyodide
  useEffect(() => {
    let cancelled = false

    async function initPyodide() {
      setRunState("loading")
      setLoadingMessage("Loading Python runtime...")

      try {
        // Load Pyodide from CDN
        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve()
          script.onerror = () => reject(new Error("Failed to load Pyodide script"))
          document.head.appendChild(script)
        })

        const pyodide = await (window as unknown as { loadPyodide: (opts: { indexURL: string; stdout?: (msg: string) => void; stderr?: (msg: string) => void }) => Promise<PyodideInterface> }).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
          stdout: (msg: string) => {
            stdoutRef.current.push(msg)
          },
          stderr: (msg: string) => {
            stdoutRef.current.push(`[stderr] ${msg}`)
          },
        })

        if (!cancelled) {
          pyodideRef.current = pyodide
          setRunState("ready")
          setLoadingMessage("")
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Pyodide init error:", err)
          setRunState("error")
          setLoadingMessage(
            err instanceof Error ? err.message : "Failed to load Python runtime"
          )
        }
      }
    }

    initPyodide()

    return () => {
      cancelled = true
    }
  }, [])

  const runCode = useCallback(
    async (code: string): Promise<{ output: string; error: string | null }> => {
      if (!pyodideRef.current) {
        return { output: "", error: "Python runtime not ready" }
      }

      setRunState("running")
      stdoutRef.current = []

      try {
        await pyodideRef.current.runPython(code)
        const output = stdoutRef.current.join("")
        setRunState("ready")
        return { output, error: null }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : String(err)
        // Remove traceback-like content for cleaner display
        const cleaned = errorMessage
          .replace(/File "<exec>", line \d+, in <module>\n?/g, "")
          .replace(/File "<exec>",/g, "Line")
          .trim()
        setRunState("ready")
        return {
          output: stdoutRef.current.join(""),
          error: cleaned || errorMessage,
        }
      }
    },
    []
  )

  return { runCode, runState, loadingMessage }
}
