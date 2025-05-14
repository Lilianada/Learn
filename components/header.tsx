"use client"

import type React from "react"

import { SettingsMenu } from "./settings-menu"
import { Button } from "./ui/button"
import { useStore } from "../store/use-store"
import { useFirebaseStore } from "../store/use-firebase-store"
import { useAuth } from "../lib/auth-context"
import { Download, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { exportToPDF, exportToMarkdown } from "../lib/export"
import { useState } from "react"
import { DialogForm } from "./ui/dialog-form"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

interface HeaderProps {
  children?: React.ReactNode
}

export function Header({ children }: HeaderProps) {
  const { firebaseEnabled, user } = useAuth();
  
  // Use the appropriate store based on Firebase enablement and auth state
  const store = user && firebaseEnabled ? useFirebaseStore() : useStore();
  
  const { currentSubjectId, currentTopicId, currentSubtopicId, subjects, topics, subtopics, addSubject } = store;
  const [addSubjectOpen, setAddSubjectOpen] = useState(false)

  const handleAddSubject = (title: string) => {
    addSubject(title)
  }

  const handleExport = async (format: "pdf" | "markdown") => {
    if (!currentSubtopicId && !currentSubjectId) return

    if (currentSubtopicId) {
      const subtopic = subtopics[currentSubtopicId]
      const topic = topics[subtopic.topicId]
      const subject = subjects[topic.subjectId]

      if (format === "pdf") {
        await exportToPDF(subtopic.content, `${subject.title} - ${topic.title} - ${subtopic.title}`)
      } else {
        exportToMarkdown(subtopic.content, `${subject.title} - ${topic.title} - ${subtopic.title}`)
      }
    } else if (currentSubjectId) {
      // Export entire subject
      const subject = subjects[currentSubjectId]
      const subjectTopics = Object.values(topics).filter((t) => t.subjectId === currentSubjectId)

      let allContent = `# ${subject.title}\n\n`

      for (const topic of subjectTopics) {
        allContent += `## ${topic.title}\n\n`

        const topicSubtopics = Object.values(subtopics).filter((s) => s.topicId === topic.id)
        for (const subtopic of topicSubtopics) {
          allContent += `### ${subtopic.title}\n\n${subtopic.content}\n\n`
        }
      }

      if (format === "pdf") {
        await exportToPDF(allContent, subject.title)
      } else {
        exportToMarkdown(allContent, subject.title)
      }
    }
  }

  return (
      <header className="flex h-14 items-center justify-between border-b border-gray-100 dark:border-border px-4 bg-white dark:bg-background shadow-sm w-full">
        <div className="flex items-center gap-2">
          {children}
          <h1 className="text-base font-medium text-gray-900 dark:text-gray-50">
            LearnDev
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {firebaseEnabled && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`h-2 w-2 m-3 rounded-full ${user ? "bg-green-500" : "bg-red-500"}`}
                  aria-label={user ? "Signed in" : "Not signed in"}
                />
              </TooltipTrigger>
              <TooltipContent>{user ? "Signed in" : "Not signed in"}</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAddSubjectOpen(true)}
                aria-label="Add new subject"
                tabIndex={0}
                className="text-gray-700 dark:text-gray-300 md:hidden"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Subject</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Export options"
                    tabIndex={0}
                    disabled={!currentSubjectId && !currentSubtopicId}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>Export to PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("markdown")}>Export to Markdown</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>Export</TooltipContent>
          </Tooltip>
          <SettingsMenu />
        </div>

        <DialogForm
          title="Add New Subject"
          open={addSubjectOpen}
          onOpenChange={setAddSubjectOpen}
          onSubmit={handleAddSubject}
          placeholder="Enter subject name..."
        />
      </header>
  )
}
