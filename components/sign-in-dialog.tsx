"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import { useAuth } from "../lib/auth-context";

export function SignInDialog() {
  const [userDismissedDialog, setUserDismissedDialog] = useState(false);
  const { user, signIn, isSigningIn, firebaseEnabled, loading } = useAuth();
  
  const shouldShowDialog = firebaseEnabled && !user && !userDismissedDialog && !loading;
  
  // Handle dialog close without signing in
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUserDismissedDialog(true);
    }
  };
  
  useEffect(() => {
    if (user) {
      // Once user is authenticated, no need to show dialog
      setUserDismissedDialog(false);
    }
  }, [user]);
  
  return (
    <Dialog open={shouldShowDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to LearnDev</DialogTitle>
          <DialogDescription>
            Sign in with your Google account to save your data and sync across devices.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <Button onClick={signIn} disabled={isSigningIn} className="gap-2">
            <LogIn className="h-4 w-4" />
            {isSigningIn ? "Signing in..." : "Sign in with Google"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
