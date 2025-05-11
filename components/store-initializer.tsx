"use client";

import { useEffect } from "react";
import { useStore } from "@/store/use-store";

export function StoreInitializer() {
  const hydrate = useStore((state: any) => state.hydrate);
  
  useEffect(() => {
    // Load data from file system when the app starts
    hydrate?.();
  }, [hydrate]);
  
  return null;
}
