"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DialogFormProps {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (value: string) => void
  initialValue?: string
  placeholder?: string
  defaultValue?: string
}

export function DialogForm({
  title,
  open,
  onOpenChange,
  onSubmit,
  initialValue = "",
  placeholder = "Enter name...",
  defaultValue,
}: DialogFormProps) {
  const [value, setValue] = useState(defaultValue || initialValue)
  
  // Update value when initialValue or defaultValue changes
  useEffect(() => {
    setValue(defaultValue || initialValue)
  }, [defaultValue, initialValue, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value.trim())
      setValue("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="name" className="sr-only">
              Name
            </Label>
            <Input
              id="name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" size="sm">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
