"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LanguageProvider } from "@/lib/i18n/context"
import { Toaster } from "sonner"
import { Navbar } from "@/components/navbar"
import type { ReactNode } from "react"

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        <TooltipProvider delay={300}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster position="bottom-right" richColors />
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
