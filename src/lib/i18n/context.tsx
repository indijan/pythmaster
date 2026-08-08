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

  const syncLanguage = useCallback((value: Language) => {
    document.documentElement.lang = value
    document.cookie = `pythmaster-lang=${value}; path=/; max-age=31536000; samesite=lax`
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("pythmaster-lang") as Language | null
    if (stored === "en" || stored === "hu") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(stored)
      syncLanguage(stored)
    }
  }, [syncLanguage])

  useEffect(() => {
    syncLanguage(lang)
  }, [lang, syncLanguage])

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    localStorage.setItem("pythmaster-lang", l)
    syncLanguage(l)
  }, [syncLanguage])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] as unknown as typeof translations.en }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useT() {
  return useContext(LanguageContext)
}
