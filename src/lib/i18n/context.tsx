"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { translations, type Language } from "./translations"

interface LanguageContextType {
  lang: Language
  setLang: (l: Language) => void
  t: typeof translations.en
}

export { type Language } from "./translations"

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en")

  useEffect(() => {
    const stored = localStorage.getItem("pythmaster-lang") as Language | null
    if (stored === "en" || stored === "hu") setLangState(stored)
  }, [])

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    localStorage.setItem("pythmaster-lang", l)
    document.documentElement.lang = l === "hu" ? "hu" : "en"
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] as unknown as typeof translations.en }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useT() {
  return useContext(LanguageContext)
}
