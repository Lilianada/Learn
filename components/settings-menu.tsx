"use client";

import { EllipsisVertical, LogIn, LogOut } from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";
import { useStore } from "../store/use-store";
import { useSettings } from "../store/use-settings";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useFirebaseStore } from "../store/use-firebase-store";
import { useAuth } from "../lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

export function SettingsMenu() {
  const { setTheme: setNextTheme } = useNextTheme();
  const { fontFamily, fontSize, theme, setFontFamily, setFontSize, setTheme } =
    useSettings();
  const { firebaseEnabled, user, signIn, isSigningIn, signOut, loading } =
    useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // Use the appropriate store based on authentication state
  const store = user && firebaseEnabled ? useFirebaseStore() : useStore();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme changes to next-themes
  useEffect(() => {
    if (mounted) {
      // The ThemeProvider now handles this logic
      // This effect is kept for backward compatibility
    }
  }, [theme, mounted]);

  // Apply font family
  useEffect(() => {
    if (mounted) {
      document.documentElement.dataset.fontFamily = fontFamily;
    }
  }, [fontFamily, mounted]);

  // Apply font size
  useEffect(() => {
    if (mounted) {
      document.documentElement.dataset.fontSize = fontSize;
    }
  }, [fontSize, mounted]);

  if (!mounted) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Settings"
            >
              <EllipsisVertical className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Font Family</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setFontFamily("sans");
                      setOpen(false);
                    }}
                    className={fontFamily === "sans" ? "bg-accent" : ""}
                  >
                    Sans-serif
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setFontFamily("mono");
                      setOpen(false);
                    }}
                    className={fontFamily === "mono" ? "bg-accent" : ""}
                  >
                    Monospace
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Font Size</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setFontSize("small");
                      setOpen(false);
                    }}
                    className={fontSize === "small" ? "bg-accent" : ""}
                  >
                    Small (12px)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setFontSize("medium");
                      setOpen(false);
                    }}
                    className={fontSize === "medium" ? "bg-accent" : ""}
                  >
                    Medium (14px)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setFontSize("large");
                      setOpen(false);
                    }}
                    className={fontSize === "large" ? "bg-accent" : ""}
                  >
                    Large (16px)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setTheme("light");
                      setOpen(false);
                    }}
                    className={theme === "light" ? "bg-accent" : ""}
                  >
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setTheme("dark");
                      setOpen(false);
                    }}
                    className={theme === "dark" ? "bg-accent" : ""}
                  >
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setTheme("warm");
                      setOpen(false);
                    }}
                    className={theme === "warm" ? "bg-accent" : ""}
                  >
                    Warm
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipTrigger>
      <TooltipContent>Settings</TooltipContent>
    </Tooltip>
  );
}
