import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import "./theme.css"
import "./editor.css" // Custom editor styles for paragraph spacing
import { ThemeProvider } from "../components/theme-provider"
import { TooltipProvider } from "../components/ui/tooltip"
import { AuthProvider } from "../lib/auth-context"
import { ClientFirebaseInit } from "../components/client-firebase-init"
import { StoreInitializer } from "../components/store-initializer"

export const metadata: Metadata = {
  title: "LearnIt - Structured Self-Learning App",
  description: "Organize your learning with a structured hierarchy",
  generator: 'Lily'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`} data-font-family="sans">
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <AuthProvider>
              <ClientFirebaseInit />
              {children}
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
