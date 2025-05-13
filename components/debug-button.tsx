"use client";

import { Button } from "./ui/button";
import { BugPlay } from "lucide-react";
import { debugFirebase } from "../lib/firebase-debug";
import { useState } from "react";

export function DebugButton() {
  const [isDebugging, setIsDebugging] = useState(false);
  
  const handleDebug = async () => {
    setIsDebugging(true);
    try {
      await debugFirebase();
      console.log("Debug complete. Check console for results.");
    } catch (error) {
      console.error("Error running debug:", error);
    } finally {
      setIsDebugging(false);
    }
  };
  
  // Only show in development
  if (process.env.NODE_ENV !== "development") return null;
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDebug} 
      disabled={isDebugging}
      className="fixed bottom-4 right-4 z-50 bg-black/10 hover:bg-black/20"
      title="Debug Firebase"
    >
      <BugPlay className="h-5 w-5" />
    </Button>
  );
}
