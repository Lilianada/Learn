"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type FontFamily = "sans" | "mono"
export type FontSize = "small" | "medium" | "large"
export type Theme = "light" | "dark" | "warm"

interface SettingsState {
  fontFamily: FontFamily
  fontSize: FontSize
  theme: Theme
  setFontFamily: (family: FontFamily) => void
  setFontSize: (size: FontSize) => void
  setTheme: (theme: Theme) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      fontFamily: "sans",
      fontSize: "medium",
      theme: "light",
      setFontFamily: (family) => set({ fontFamily: family }),
      setFontSize: (size) => set({ fontSize: size }),
      setTheme: (theme) => set({ theme: theme }),
    }),
    {
      name: "learnit-settings",
    }
  )
)
