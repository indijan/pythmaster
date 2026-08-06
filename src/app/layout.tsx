import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { LayoutWrapper } from "@/components/layout-wrapper"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Pythmaster – Learn Python & Data Engineering",
  description:
    "AI-powered learning platform that teaches Python from absolute beginner to intermediate Data Engineer level through one continuously evolving real-world application.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
