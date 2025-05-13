"use client"

import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"
import { Header } from "./header"
import { SignInDialog } from "./sign-in-dialog"
import { LoadingOverlay } from "./loading-overlay"
import { DebugButton } from "./debug-button"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "./ui/button"
import { useMediaQuery } from "../hooks/use-media-query"
import { cn } from "../lib/utils"
import { StoreInitializer } from "./store-initializer"
import { useAuth } from "../lib/auth-context"

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { user, loading } = useAuth()

  // Close sidebar when switching to desktop view
  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(false)
    }
  }, [isDesktop])

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-background warm:bg-warm">
     
      <StoreInitializer />
      <SignInDialog />
      <DebugButton />
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
            "grid transition-all duration-300 ease-in-out",
            isDesktop ? "grid-cols-4" : sidebarOpen ? "w-full" : "w-0",
          )}
        >
          <div className={cn(
            isDesktop ? "col-span-1" : sidebarOpen ? "w-full" : "w-0"
          )}>
            <Sidebar open={sidebarOpen || isDesktop} onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="col-span-3">
            <MainContent sidebarOpen={sidebarOpen && !isDesktop} />
          </div>
        </div>
      </div>
    </div>
  )
}
