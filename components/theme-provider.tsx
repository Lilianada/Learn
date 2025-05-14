"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useSettings } from "@/store/use-settings"
import { useEffect, useState } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { fontFamily, fontSize, theme } = useSettings()
  const [mounted, setMounted] = useState(false)
  
  // Ensure hydration completes
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Apply font and size settings to HTML element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.fontFamily = fontFamily
      document.documentElement.dataset.fontSize = fontSize
      
      // Handle warm theme separately since it's custom
      if (theme === 'warm' && mounted) {
        document.documentElement.classList.add('warm')
      } else {
        document.documentElement.classList.remove('warm')
      }
    }
  }, [fontFamily, fontSize, theme, mounted])
  
  // Get the theme to use with NextThemesProvider
  const resolvedTheme = theme === 'warm' ? 'light' : theme
  
  return (
    <NextThemesProvider 
      {...props} 
      defaultTheme={resolvedTheme}
      forcedTheme={mounted ? resolvedTheme : undefined}
    >
      {children}
    </NextThemesProvider>
  )
}
