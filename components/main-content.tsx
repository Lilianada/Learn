"use client"

import * as React from "react"
import { useStore } from "@/store/use-store"
import { Editor } from "@/components/editor"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { DialogForm } from "@/components/ui/dialog-form"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MainContentProps {
  sidebarOpen: boolean
}

export function MainContent({ sidebarOpen }: MainContentProps) {
  const {
    currentSubjectId,
    currentTopicId,
    currentSubtopicId,
    subjects,
    topics,
    subtopics,
    addSubject,
    addTopic,
    addSubtopic,
    updateTopicContent,
    updateSubtopicContent,
  } = useStore()

  const [addSubjectOpen, setAddSubjectOpen] = useState(false)
  const [addTopicOpen, setAddTopicOpen] = useState(false)
  const [addSubtopicOpen, setAddSubtopicOpen] = useState(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  const handleAddSubject = (title: string) => {
    addSubject(title)
  }

  const handleAddTopic = (title: string) => {
    if (!currentSubjectId) {
      setErrorMessage("Please select a subject first")
      setErrorDialogOpen(true)
      return
    }
    addTopic(currentSubjectId, title)
  }

  const handleAddSubtopic = (title: string) => {
    if (!currentTopicId) {
      setErrorMessage("Please select a topic first")
      setErrorDialogOpen(true)
      return
    }
    addSubtopic(currentTopicId, title)
  }

  let content: React.ReactElement | null = null
  let currentContent = ""
  let contentTitle = ""

  if (currentSubtopicId && subtopics[currentSubtopicId]) {
    // Display subtopic content
    const subtopic = subtopics[currentSubtopicId]
    const topic = topics[subtopic.topicId]
    const subject = topics[subtopic.topicId] ? subjects[topics[subtopic.topicId].subjectId] : null

    contentTitle = subtopic.title
    currentContent = subtopic.content

    content = (
      <>
        <div className="mb-4 flex items-center">
          <h2 className="text-xl font-semibold flex-1">{subtopic.title}</h2>
          <div className="text-muted-foreground text-sm">
            {subject?.title} / {topic?.title} / {subtopic.title}
          </div>
        </div>
        <Editor
          initialContent={subtopic.content}
          onChange={(content) => updateSubtopicContent(currentSubtopicId, content)}
        />
      </>
    )
  } else if (currentTopicId && topics[currentTopicId]) {
    // Display topic content or topic overview
    const topic = topics[currentTopicId]
    const subject = subjects[topic.subjectId]
    const topicSubtopics = Object.values(subtopics).filter((s) => s.topicId === currentTopicId)

    contentTitle = topic.title
    currentContent = topic.content || ""

    if (topicSubtopics.length === 0) {
      // No subtopics, allow editing the topic directly
      content = (
        <>
          <div className="mb-4 flex items-center">
            <h2 className="text-xl font-semibold flex-1">{topic.title}</h2>
            <div className="text-muted-foreground text-sm">
              {subject?.title} / {topic.title}
            </div>
          </div>
          <Editor
            initialContent={topic.content || ""}
            onChange={(content) => updateTopicContent(currentTopicId, content)}
          />
        </>
      )
    } else {
      // Show topic overview with links to subtopics
      content = (
        <>
          <div className="mb-6 flex items-center">
            <h2 className="text-xl font-semibold flex-1">{topic.title}</h2>
            <div className="text-muted-foreground text-sm">
              {subject?.title} / {topic.title}
            </div>
          </div>
          <div className="grid gap-3">
            {topicSubtopics.map((subtopic) => (
              <Button
                key={subtopic.id}
                variant="ghost"
                className="justify-start h-auto py-3 px-4 minimal-button hover:no-underline"
                onClick={() => useStore.getState().setCurrentSubtopic(subtopic.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{subtopic.title}</div>
                  <div className="text-muted-foreground text-sm mt-1 line-clamp-2">
                    {subtopic.content ? (
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{
                          __html: subtopic.content
                            .replace(/<[^>]*>/g, " ")
                            .substring(0, 150)
                            .trim() + "...",
                        }}
                      />
                    ) : (
                      <span className="italic text-muted-foreground">No content yet</span>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
          <div className="mt-6">
            <Button onClick={() => setAddSubtopicOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Subtopic
            </Button>
          </div>
        </>
      )
    }
  } else if (currentSubjectId && subjects[currentSubjectId]) {
    // Display subject overview
    const subject = subjects[currentSubjectId]
    const subjectTopics = subject.topicOrder
      .map((id) => topics[id])
      .filter(Boolean)

    contentTitle = subject.title

    content = (
      <>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{subject.title}</h2>
        </div>
        <div className="grid gap-3">
          {subjectTopics.length > 0 ? (
            subjectTopics.map((topic) => {
              const topicSubtopics = Object.values(subtopics).filter((s) => s.topicId === topic.id)

              return (
                <Button
                  key={topic.id}
                  variant="ghost"
                  className="justify-start h-auto py-3 px-4 minimal-button"
                  onClick={() => useStore.getState().setCurrentTopic(topic.id)}
                >
                  <div className="text-left w-full">
                    <div className="font-medium">{topic.title}</div>
                    <div className="text-muted-foreground text-sm mt-1">
                      {topicSubtopics.length > 0 ? (
                        <span>{topicSubtopics.length} subtopics</span>
                      ) : (
                        <span className="italic">No subtopics yet</span>
                      )}
                    </div>
                  </div>
                </Button>
              )
            })
          ) : (
            <div className="text-muted-foreground text-center py-8">No topics yet. Create one to get started!</div>
          )}
        </div>
        <div className="mt-6">
          <Button onClick={() => setAddTopicOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Topic
          </Button>
        </div>
      </>
    )
  } else {
    // No selection, show welcome screen
    content = (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold mb-2">Welcome to LearnIt</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create structured learning materials organized by subjects, topics, and subtopics.
        </p>
        <Button onClick={() => setAddSubjectOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Your First Subject
        </Button>
      </div>
    )
  }

  return (
    <>
      <main
        className={cn("flex-1 overflow-y-auto p-6", sidebarOpen && "opacity-50 md:opacity-100")}
      >
        <div className="mx-auto max-w-3xl">{content}</div>
      </main>

      {/* Dialog forms */}
      <DialogForm
        title="Create New Subject"
        open={addSubjectOpen}
        onOpenChange={setAddSubjectOpen}
        onSubmit={handleAddSubject}
        placeholder="Enter subject name..."
      />

      <DialogForm
        title="Add New Topic"
        open={addTopicOpen}
        onOpenChange={setAddTopicOpen}
        onSubmit={handleAddTopic}
        placeholder="Enter topic name..."
      />

      <DialogForm
        title="Add New Subtopic"
        open={addSubtopicOpen}
        onOpenChange={setAddSubtopicOpen}
        onSubmit={handleAddSubtopic}
        placeholder="Enter subtopic name..."
      />

      {/* Error dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
