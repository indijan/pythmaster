import { createServerClient } from "@nhost/nhost-js"
import { cookies } from "next/headers"

const NHOST_SESSION_KEY = "nhostSession"

export async function createNhostServerClient() {
  const cookieStore = await cookies()

  return createServerClient({
    subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
    region: process.env.NEXT_PUBLIC_NHOST_REGION,
    authUrl: process.env.NEXT_PUBLIC_NHOST_AUTH_URL,
    graphqlUrl: process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL,
    storageUrl: process.env.NEXT_PUBLIC_NHOST_STORAGE_URL,
    functionsUrl: process.env.NEXT_PUBLIC_NHOST_FUNCTIONS_URL,
    storage: {
      get: () => {
        const raw = cookieStore.get(NHOST_SESSION_KEY)?.value
        if (!raw) return null
        try {
          return JSON.parse(raw)
        } catch {
          return null
        }
      },
      set: (value) => {
        cookieStore.set(NHOST_SESSION_KEY, JSON.stringify(value), {
          path: "/",
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        })
      },
      remove: () => {
        cookieStore.delete(NHOST_SESSION_KEY)
      },
    },
  })
}
