"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Image from "@tiptap/extension-image"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import FontSize from "@tiptap/extension-font-size"
import { useCallback, useEffect, useState, useRef } from "react"
import { FloatingButtonToolbar } from "./floating-button-toolbar"

const lowlight = createLowlight(common)

interface EditorProps {
  initialContent: string
  onChange: (content: string) => void
}

export function Editor({ initialContent, onChange }: EditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start typing here...",
        emptyEditorClass: 'is-editor-empty',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      // Text formatting extensions
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      TextStyle,
      Color,
      FontSize,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose max-w-none dark:prose-invert focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  // Handle content updates from props
  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(initialContent)
    } else if (
      editor && 
      initialContent && 
      Math.abs(initialContent.length - editor.getHTML().length) > 10
    ) {
      // Store cursor position
      const { from, to } = editor.state.selection
      
      // Update content
      editor.commands.setContent(initialContent)
      
      // Restore cursor position if possible
      try {
        editor.commands.setTextSelection({ from, to })
      } catch (e) {
        console.debug('Could not restore cursor position after content update')
      }
    }
  }, [editor, initialContent])
  
  if (!editor) {
    return null
  }

  return (
    <div className="relative min-h-[calc(100vh_-_10rem)]" ref={editorContainerRef}>
      {/* Floating button toolbar */}
      <FloatingButtonToolbar 
        editor={editor}
        onImageAdd={() => setImageDialogOpen(true)}
      />
      <div className="absolute bottom-4 right-4 pointer-events-none text-xs text-muted-foreground/30">
        <span className="hidden sm:inline">Click the keyboard button for formatting options</span>
      </div>
      
      {/* Main editor - completely borderless design */}
      <div>
        <EditorContent 
          editor={editor} 
          className="min-h-[calc(100vh_-_10rem)] py-4 focus:outline-none prose prose-sm sm:prose max-w-none dark:prose-invert border-none editor-borderless"
        />
      </div>
    </div>
  )
}