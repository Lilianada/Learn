"use client";

import * as React from "react";
import { useStore } from "../store/use-store";
import { useFirebaseStore } from "../store/use-firebase-store";
import { useAuth } from "../lib/auth-context";
import { Editor } from "./editor";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { DialogForm } from "./ui/dialog-form";
import { cn } from "../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface MainContentProps {
  sidebarOpen: boolean;
}

export function MainContent({ sidebarOpen }: MainContentProps) {
  const { firebaseEnabled, user } = useAuth();

  // Choose the store based on authentication state
  const store = user && firebaseEnabled ? useFirebaseStore() : useStore();

  // Helper function to format dates consistently across the component
  // Helper function to format dates consistently across the component
const formatDate = (dateString?: string, showTime: boolean = false) => {
  if (!dateString) return "Unknown";

  // Try to parse the date string (handles both ISO strings and Firebase timestamps)
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(showTime ? {
        hour: "2-digit",
        minute: "2-digit"
      } : {})
    }).format(date);
  } catch (e) {
    return "Invalid date";
  }
};

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
  } = store;

  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [addSubtopicOpen, setAddSubtopicOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddSubject = (title: string) => {
    addSubject(title);
  };

  const handleAddTopic = (title: string) => {
    if (!currentSubjectId) {
      setErrorMessage("Please select a subject first");
      setErrorDialogOpen(true);
      return;
    }
    addTopic(currentSubjectId, title);
  };

  const handleAddSubtopic = (title: string) => {
    if (!currentTopicId) {
      setErrorMessage("Please select a topic first");
      setErrorDialogOpen(true);
      return;
    }
    addSubtopic(currentTopicId, title);
  };

  let content: React.ReactElement | null = null;
  let currentContent = "";
  let contentTitle = "";

  if (currentSubtopicId && subtopics[currentSubtopicId]) {
    // Display subtopic content
    const subtopic = subtopics[currentSubtopicId];
    const topic = topics[subtopic.topicId];
    const subject = topics[subtopic.topicId]
      ? subjects[topics[subtopic.topicId].subjectId]
      : null;
    const topicSubtopics = Object.values(subtopics).filter(
      (s) => s.topicId === subtopic.topicId
    );

    contentTitle = subtopic.title;
    currentContent = subtopic.content;

    // Get formatted dates for display
    const updatedAt = formatDate(subtopic.updatedAt);

    content = (
      <>
        <div className="w-full mb-4 flex justify-between gap-4 flex-wrap sm:flex-row">
          {/* <div className="flex items-center">
            <h2 className="text-lg font-semibold flex-1">{subtopic.title}</h2>
          </div> */}
          <div className="text-muted-foreground text-sm">
            {subject?.title} / {topic?.title} / {subtopic.title}
          </div>
          <div className=" text-xs text-muted-foreground mt-1 space-x-4">
              <span className="font-medium">Last edited:</span> {updatedAt}
          </div>
        </div>
        <Editor
          initialContent={subtopic.content}
          onChange={(content) =>
            updateSubtopicContent(currentSubtopicId, content)
          }
        />
      </>
    );
  } else if (currentTopicId && topics[currentTopicId]) {
    // Display topic content or topic overview
    const topic = topics[currentTopicId];
    const subject = subjects[topic.subjectId];
    const topicSubtopics = Object.values(subtopics).filter(
      (s) => s.topicId === currentTopicId
    );

    contentTitle = topic.title;
    currentContent = topic.content || "";

    if (topicSubtopics.length === 0) {
      // No subtopics, allow editing the topic directly
      const updatedAt = formatDate(topic.updatedAt);

      content = (
        <>
          <div className="mb-4 flex flex-col">
            <div className="flex items-center">
              {/* <h2 className="text-xl font-semibold flex-1">{topic.title}</h2> */}
              <div className="text-muted-foreground text-sm">
                {subject?.title} / {topic.title}
              </div>
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-4">
              <div>
                <span className="font-medium">Last edited:</span> {updatedAt}
              </div>
            </div>
          </div>
          <Editor
            initialContent={topic.content || ""}
            onChange={(content) => updateTopicContent(currentTopicId, content)}
          />
        </>
      );
    } else {
      // Show topic overview with links to subtopics
      const updatedAt = formatDate(topic.updatedAt);

      content = (
        <>
          <div className="mb-6 flex flex-col">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold flex-1">{topic.title}</h2>
              <div className="text-muted-foreground text-sm">
                {subject?.title} / {topic.title}
              </div>
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-4">
              <div>
                <span className="font-medium">Last edited:</span> {updatedAt}
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            {topicSubtopics.map((subtopic) => (
              <Button
                key={subtopic.id}
                variant="ghost"
                className="justify-start h-auto py-3 px-4 minimal-button hover:no-underline"
                onClick={() =>
                  useStore.getState().setCurrentSubtopic(subtopic.id)
                }
              >
                <div className="text-left">
                  <div className="font-medium">{subtopic.title}</div>
                  <div className="text-muted-foreground text-sm mt-1 line-clamp-2">
                    {subtopic.content ? (
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{
                          __html:
                            subtopic.content
                              .replace(/<[^>]*>/g, " ")
                              .substring(0, 150)
                              .trim() + "...",
                        }}
                      />
                    ) : (
                      <span className="italic text-muted-foreground">
                        No content yet
                      </span>
                    )}
                  </div>
                  <div className="flex text-xs text-muted-foreground mt-2">
                    <span>
                      <span className="font-medium">Updated:</span>{" "}
                      {formatDate(subtopic.updatedAt)}
                    </span>
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
      );
    }
  } else if (currentSubjectId && subjects[currentSubjectId]) {
    // Display subject overview
    const subject = subjects[currentSubjectId];
    const subjectTopics = subject.topicOrder
      .map((id) => topics[id])
      .filter(Boolean);

    contentTitle = subject.title;

    // Format subject dates
    const updatedAt = formatDate(subject.updatedAt);

    content = (
      <>
        <div className="mb-6 flex flex-col">
          <div className="flex items-center">
            <h2 className="text-lg font-medium">{subject.title}</h2>
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-4">
            <div>
              <span className="font-medium">Last edited:</span> {updatedAt}
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          {subjectTopics.length > 0 ? (
            subjectTopics.map((topic) => {
              const topicSubtopics = Object.values(subtopics).filter(
                (s) => s.topicId === topic.id
              );

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
                    <div className="flex text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Updated:</span>{" "}
                      {formatDate(topic.updatedAt)}
                    </div>
                  </div>
                </Button>
              );
            })
          ) : (
            <div className="text-muted-foreground text-center py-8">
              No topics yet. Create one to get started!
            </div>
          )}
        </div>
        <div className="grid place-items-center">
          <Button onClick={() => setAddTopicOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Topic
          </Button>
        </div>
      </>
    );
  } else {
    // No selection, show welcome screen
    content = (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh_-_10rem)] text-center">
        <h2 className="text-xl font-semibold mb-2">Welcome to LearnIt</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create structured learning materials organized by subjects, topics,
          and subtopics.
        </p>
        <Button onClick={() => setAddSubjectOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Your First Subject
        </Button>
      </div>
    );
  }

  return (
    <>
      <main
        className={cn(
          "flex-1 overflow-y-auto p-6 h-full",
          sidebarOpen && "opacity-50 md:opacity-100"
        )}
      >
        <div className="mx-auto max-w-3xl h-full">{content}</div>
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
  );
}
