"use client"

import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"
import { Header } from "@/components/header"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { StoreInitializer } from "@/components/store-initializer"

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Close sidebar when switching to desktop view
  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(false)
    }
  }, [isDesktop])

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-background">
      <StoreInitializer />
      <Header>
        {!isDesktop && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="mr-2"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}
      </Header>
      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isDesktop ? "w-64" : sidebarOpen ? "w-full md:w-64" : "w-0",
          )}
        >
          <Sidebar open={sidebarOpen || isDesktop} onClose={() => setSidebarOpen(false)} />
        </div>
        <MainContent sidebarOpen={sidebarOpen && !isDesktop} />
      </div>
    </div>
  )
}
