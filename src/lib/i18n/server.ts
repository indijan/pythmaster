import { cookies } from "next/headers"
import type { Language } from "./translations"

export async function getServerLanguage(): Promise<Language> {
  const store = await cookies()
  const lang = store.get("pythmaster-lang")?.value
  return lang === "hu" ? "hu" : "en"
}
