"use client";

import { Sidebar } from "./sidebar";
import { MainContent } from "./main-content";
import { Header } from "./header";
import { SignInDialog } from "./sign-in-dialog";
import { LoadingOverlay } from "./loading-overlay";
import { DebugButton } from "./debug-button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useMediaQuery } from "../hooks/use-media-query";
import { cn } from "../lib/utils";
import { StoreInitializer } from "./store-initializer";
import { useAuth } from "../lib/auth-context";
import { ErrorBoundary } from "./error-boundary";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { user, loading } = useAuth();

  // Close sidebar when switching to desktop view
  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-background warm:bg-warm">
      {/* Add a loading indicator to prevent flashing content */}
      {loading && <LoadingOverlay />}

      {/* Initialize store first to ensure data is available */}
      <StoreInitializer />

      <SignInDialog />

      <Header>
        {!isDesktop && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="mr-2"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        )}
      </Header>

      {!loading && (
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Mobile sidebar - only visible when sidebarOpen is true */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-20 md:relative md:z-0",
              "transition-transform duration-300 ease-in-out transform",
              "bg-white dark:bg-sidebar warm:bg-warm-sidebar shadow-lg md:shadow-none",
              "w-64 md:w-auto md:flex-shrink-0",
              isDesktop
                ? "translate-x-0"
                : sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
            )}
          >
            <ErrorBoundary>
              <Sidebar open={true} onClose={() => setSidebarOpen(false)} />
            </ErrorBoundary>
          </div>

          {/* Overlay to close sidebar on mobile */}
          {sidebarOpen && !isDesktop && (
            <div
              className="fixed inset-0 bg-black/20 z-10"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Main content area */}
          <div className="flex-1 w-full overflow-auto">
            <MainContent sidebarOpen={sidebarOpen && !isDesktop} />
          </div>
        </div>
      )}
    </div>
  );
}
