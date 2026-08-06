import { createServerClient } from "@nhost/nhost-js"
import { NextResponse, type NextRequest } from "next/server"

const NHOST_SESSION_KEY = "nhostSession"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  const nhost = createServerClient({
    subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
    region: process.env.NEXT_PUBLIC_NHOST_REGION,
    authUrl: process.env.NEXT_PUBLIC_NHOST_AUTH_URL,
    graphqlUrl: process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL,
    storageUrl: process.env.NEXT_PUBLIC_NHOST_STORAGE_URL,
    functionsUrl: process.env.NEXT_PUBLIC_NHOST_FUNCTIONS_URL,
    storage: {
      get: () => {
        const raw = request.cookies.get(NHOST_SESSION_KEY)?.value
        if (!raw) return null
        try {
          return JSON.parse(raw)
        } catch {
          return null
        }
      },
      set: (value) => {
        response.cookies.set(NHOST_SESSION_KEY, JSON.stringify(value), {
          path: "/",
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
        })
      },
      remove: () => {
        response.cookies.delete(NHOST_SESSION_KEY)
      },
    },
  })

  const session = nhost.getUserSession()
  const isAuthenticated = session !== null

  // Protected routes
  const protectedPaths = ["/dashboard", "/mission", "/project", "/settings"]
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Auth pages (redirect to dashboard if already logged in)
  const authPaths = ["/login", "/register"]
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!isAuthenticated && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthenticated && isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return response
}
