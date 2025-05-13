"use client"

import { useStore } from "../store/use-store"
import { useFirebaseStore } from "../store/use-firebase-store"
import { useAuth } from "../lib/auth-context"
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, MoreHorizontal, Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { DialogForm } from "./ui/dialog-form"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { ConfirmationDialog } from "./ui/confirmation-dialog"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { firebaseEnabled, user } = useAuth();
  
  // Use the appropriate store based on authentication state
  const store = user && firebaseEnabled ? useFirebaseStore() : useStore();
  
  const {
    subjects,
    topics,
    subtopics,
    currentSubjectId,
    currentTopicId,
    currentSubtopicId,
    setCurrentSubject,
    setCurrentTopic,
    setCurrentSubtopic,
    addTopic,
    addSubtopic,
    deleteSubject,
    deleteTopic,
    deleteSubtopic,
    updateSubject,
    updateTopic,
    updateSubtopic,
  } = store

  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({})
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({})

  // Dialog states
  const [addTopicOpen, setAddTopicOpen] = useState(false)
  const [addSubtopicOpen, setAddSubtopicOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState<{
    type: "subject" | "topic" | "subtopic"
    id: string
    title: string
  } | null>(null)

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleAddTopic = (title: string) => {
    if (currentSubjectId) {
      addTopic(currentSubjectId, title)
      setExpandedSubjects((prev) => ({
        ...prev,
        [currentSubjectId]: true,
      }))
    }
  }

  const handleAddSubtopic = (title: string) => {  
    if (currentTopicId) {
      addSubtopic(currentTopicId, title)
      setExpandedTopics((prev) => ({
        ...prev,
        [currentTopicId]: true,
      }))
    }
  }

  const handleRename = (title: string) => {
    if (!currentAction) return

    const { type, id } = currentAction

    if (type === "subject") {
      updateSubject(id, title)
    } else if (type === "topic") {
      updateTopic(id, title)
    } else if (type === "subtopic") {
      updateSubtopic(id, title)
    }
  }

  const openDeleteDialog = (type: "subject" | "topic" | "subtopic", id: string) => {
    setCurrentAction({
      type,
      id,
      title:
        type === "subject"
          ? subjects[id]?.title || ""
          : type === "topic"
          ? topics[id]?.title || ""
          : subtopics[id]?.title || "",
    })
    setDeleteDialogOpen(true)
  }

  const openRenameDialog = (type: "subject" | "topic" | "subtopic", id: string) => {
    setCurrentAction({
      type,
      id,
      title:
        type === "subject"
          ? subjects[id]?.title || ""
          : type === "topic"
          ? topics[id]?.title || ""
          : subtopics[id]?.title || "",
    })
    setRenameDialogOpen(true)
  }

  const handleDelete = () => {
    if (!currentAction) return

    const { type, id } = currentAction

    if (type === "subject") {
      deleteSubject(id)
    } else if (type === "topic") {
      deleteTopic(id)
    } else if (type === "subtopic") {
      deleteSubtopic(id)
    }
  }

  // Handle sidebar item click on mobile
  const handleItemClick = () => {
    if (!open) return
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  // Helper function to get subtopics for a topic
  const getTopicSubtopics = (topicId: string) => {
    const topic = topics[topicId];
    if (!topic) return [];
    
    // If topic has subtopicOrder property and it's not empty, use it to order subtopics
    if (topic.subtopicOrder && topic.subtopicOrder.length > 0) {
      // Return subtopics in the order specified by subtopicOrder
      return topic.subtopicOrder
        .map(id => subtopics[id])
        .filter(Boolean); // Filter out any undefined entries
    }
    
    // Fallback: just filter by topicId (unordered)
    return Object.values(subtopics).filter(subtopic => subtopic.topicId === topicId);
  }

  return (
    <div
      className={cn(
        "h-full overflow-y-auto border-r border-gray-100 dark:border-border bg-white dark:bg-background py-2 sidebar-transition",
        open ? "sidebar-open" : "sidebar-closed"
      )}
    >
      {/* Subject List */}
      <div className="space-y-1 px-2">
        <h2 className="text-sm font-medium px-2 py-1.5 text-gray-700 dark:text-gray-300">Subjects</h2>
        {Object.values(subjects).map((subject) => (
          <div key={subject.id} className="space-y-1">
            <div
              className={cn(
                "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm",
                currentSubjectId === subject.id
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "hover:bg-muted/30 text-gray-700 dark:text-gray-300"
              )}
            >
              <div
                className="flex items-center gap-2 flex-1"
                onClick={() => {
                  setCurrentSubject(subject.id)
                  toggleSubject(subject.id)
                  handleItemClick()
                }}
              >
                <button className="p-1" aria-label={expandedSubjects[subject.id] ? "Collapse subject" : "Expand subject"}>
                  {expandedSubjects[subject.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <div className="flex items-center gap-1.5">
                  {expandedSubjects[subject.id] ? (
                    <FolderOpen className="h-4 w-4 shrink-0" />
                  ) : (
                    <Folder className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate max-w-[140px]" title={subject.title}>
                    {subject.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentSubject(subject.id)
                        setAddTopicOpen(true)
                      }}
                      aria-label="Add topic"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Topic</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="More options"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openRenameDialog("subject", subject.id)}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog("subject", subject.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Topics */}
            {expandedSubjects[subject.id] && (
              <div className="pl-4 pt-1 space-y-1">
                {subject.topicOrder.map((topicId) => {
                  const topic = topics[topicId]
                  if (!topic) return null
                  
                  // Get subtopics for this topic
                  const topicSubtopics = getTopicSubtopics(topic.id);
                  const hasSubtopics = topicSubtopics.length > 0;

                  return (
                    <div key={topic.id} className="space-y-1">
                      <div
                        className={cn(
                          "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm",
                          currentTopicId === topic.id
                            ? "bg-primary/10 text-primary dark:bg-primary/20"
                            : "hover:bg-muted/30 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        <div
                          className="flex items-center gap-2 flex-1"
                          onClick={() => {
                            setCurrentTopic(topic.id)
                            if (hasSubtopics) toggleTopic(topic.id)
                            handleItemClick()
                          }}
                        >
                          {hasSubtopics ? (
                            <button className="p-1" aria-label={expandedTopics[topic.id] ? "Collapse topic" : "Expand topic"}>
                              {expandedTopics[topic.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          ) : (
                            <div className="w-6"></div> 
                          )}
                          
                          <div className="flex items-center gap-1.5">
                            {hasSubtopics && expandedTopics[topic.id] ? (
                              <FolderOpen className="h-4 w-4 shrink-0" />
                            ) : (
                              <Folder className="h-4 w-4 shrink-0" />
                            )}
                            <span className="truncate max-w-[120px]" title={topic.title}>
                              {topic.title}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCurrentTopic(topic.id)
                                  setAddSubtopicOpen(true)
                                }}
                                aria-label="Add subtopic"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add Subtopic</TooltipContent>
                          </Tooltip>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="More options"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openRenameDialog("topic", topic.id)}>
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog("topic", topic.id)}
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Subtopics - only show if topic is expanded */}
                      {hasSubtopics && expandedTopics[topic.id] && (
                        <div className="pl-7 pt-1 space-y-1">
                          {topicSubtopics.map(subtopic => (
                            <div
                              key={subtopic.id}
                              className={cn(
                                "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm",
                                currentSubtopicId === subtopic.id
                                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                                  : "hover:bg-muted/30 text-gray-700 dark:text-gray-300"
                              )}
                              onClick={() => {
                                setCurrentSubtopic(subtopic.id)
                                handleItemClick()
                              }}
                            >
                              <div className="flex items-center gap-1.5">
                                <File className="h-4 w-4 shrink-0" />
                                <span className="truncate max-w-[100px]" title={subtopic.title}>
                                  {subtopic.title}
                                </span>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="More options"
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => openRenameDialog("subtopic", subtopic.id)}
                                  >
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openDeleteDialog("subtopic", subtopic.id)}
                                    className="text-destructive"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dialog forms */}
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

      {currentAction && (
        <>
          <DialogForm
            title={`Rename ${currentAction.type.charAt(0).toUpperCase() + currentAction.type.slice(1)}`}
            open={renameDialogOpen}
            onOpenChange={setRenameDialogOpen}
            onSubmit={handleRename}
            placeholder={`Enter new ${currentAction.type} name...`}
            initialValue={currentAction.title}
          />

          <ConfirmationDialog
            title={`Delete ${currentAction.type.charAt(0).toUpperCase() + currentAction.type.slice(1)}`}
            description={`Are you sure you want to delete "${currentAction.title}"? This action cannot be undone.`}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  )
}