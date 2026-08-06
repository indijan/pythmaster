"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  BookOpen,
  FolderGit2,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  Sparkles,
  Trophy,
  Zap,
  Type,
  Languages,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"

import { useT, type Language } from "@/lib/i18n/context"

type FontSize = "sm" | "md" | "lg" | "xl"

const fontSizes: Record<FontSize, string> = { sm: "text-xs", md: "", lg: "text-base", xl: "text-lg" }
const fontSizeLabels: Record<FontSize, string> = { sm: "A-", md: "A", lg: "A+", xl: "A++" }

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mission", label: "Missions", icon: BookOpen },
  { href: "/project", label: "Project", icon: FolderGit2 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  const { lang, setLang, t } = useT()
  const [xp, setXp] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [fontSize, setFontSize] = useState<FontSize>("md")

  const cycleFontSize = useCallback(() => {
    setFontSize((prev) => {
      const order: FontSize[] = ["sm", "md", "lg", "xl"]
      const idx = order.indexOf(prev)
      const next = order[(idx + 1) % order.length]
      // Remove all font classes, add only if not default (md)
      document.documentElement.classList.remove("text-xs", "text-base", "text-lg")
      if (fontSizes[next]) document.documentElement.classList.add(fontSizes[next])
      return next
    })
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "hu" : "en")
  }, [lang, setLang])

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        // Fetch real profile data
        fetch("/api/profile")
          .then((r) => r.json())
          .then((p) => {
            if (p.xp !== undefined) setXp(p.xp)
            if (p.level !== undefined) setUserLevel(p.level)
          })
          .catch(() => {})
      }
    })
  }, [])

  if (!mounted) return null

  if (pathname === "/login" || pathname === "/register") return null

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Pythmaster</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <div className={`inline-flex items-center gap-1.5 px-2.5 h-7 text-[0.8rem] font-medium rounded-[min(var(--radius-md),12px)] transition-colors whitespace-nowrap ${isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"}`}>
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              <span>{xp} XP</span>
            </Badge>
          )}

          {/* Font Size */}
          <div
            className="hidden sm:inline-flex items-center justify-center rounded-lg size-7 hover:bg-muted transition-colors cursor-pointer text-[10px] font-bold gap-0.5"
            onClick={cycleFontSize}
            role="button"
            tabIndex={0}
            aria-label="Change font size"
            title={`Font: ${fontSizeLabels[fontSize]}`}
          >
            <Type className="h-3 w-3" />
            {fontSizeLabels[fontSize]}
          </div>

          {/* Language */}
          <div
            className="hidden sm:inline-flex items-center justify-center rounded-lg px-1.5 h-7 hover:bg-muted transition-colors cursor-pointer text-xs font-medium"
            onClick={toggleLang}
            role="button"
            tabIndex={0}
            aria-label="Switch language"
          >
            {lang === "en" ? "🇬🇧 EN" : "🇭🇺 HU"}
          </div>

          <div
            className="inline-flex items-center justify-center rounded-lg size-8 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            role="button"
            tabIndex={0}
            aria-label="Toggle theme"
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setTheme(theme === "dark" ? "light" : "dark") }}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full">
                <div className="inline-flex items-center justify-center rounded-full size-8 hover:bg-muted transition-colors cursor-pointer bg-primary/10 text-primary font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {user.email?.split("@")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Level {userLevel} · {xp} XP
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/project")}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Achievements
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <div className="inline-flex items-center gap-1 px-2.5 h-7 text-[0.8rem] font-medium rounded-[min(var(--radius-md),12px)] hover:bg-muted transition-colors">
                  Sign in
                </div>
              </Link>
              <Link href="/register">
                <div className="inline-flex items-center gap-1.5 px-2.5 h-7 text-[0.8rem] font-medium rounded-[min(var(--radius-md),12px)] bg-primary text-primary-foreground hover:bg-primary/80 transition-colors">
                  Get Started
                </div>
              </Link>
            </div>
          )}

          <Sheet>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-lg size-8 hover:bg-muted transition-colors cursor-pointer">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-1 mt-6">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"}`}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
