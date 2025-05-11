"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useSettings } from "@/store/use-settings"
import { useEffect } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { fontFamily, fontSize } = useSettings()
  
  // Apply font and size settings to HTML element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.fontFamily = fontFamily
      document.documentElement.dataset.fontSize = fontSize
    }
  }, [fontFamily, fontSize])
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
