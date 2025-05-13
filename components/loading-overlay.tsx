"use client";

import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      </div>
    </div>
  );
}
