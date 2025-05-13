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
import { FloatingToolbar } from "./floating-toolbar"

const lowlight = createLowlight(common)

interface EditorProps {
  initialContent: string
  onChange: (content: string) => void
}

export function Editor({ initialContent, onChange }: EditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [selectionActive, setSelectionActive] = useState(false)
  const [floatingMenuPosition, setFloatingMenuPosition] = useState({ 
    top: 0, 
    left: 0, 
    transform: 'translateY(-100%)' 
  })
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
      // New extensions for text formatting
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
    },
  })

 useEffect(() => {
  // Only update content from props when it's significantly different
  // This prevents disruptions while typing
  if (editor && initialContent && editor.isEmpty) {
    editor.commands.setContent(initialContent)
  } else if (
    editor && 
    initialContent && 
    // Only update if there's a substantial difference
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
      // Cursor position might be invalid after content change
      console.debug('Could not restore cursor position after content update')
    }
  }
}, [editor, initialContent])
  
  // Function to update toolbar position based on selection
  const updateToolbarPosition = useCallback(() => {
    if (!editor || editor.view.state.selection.empty) return
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    
    if (rect.width === 0) return
    
    // Get the editor DOM element for relative positioning
    const editorElement = document.querySelector('.ProseMirror')
    if (!editorElement) return
    const editorRect = editorElement.getBoundingClientRect()
    
    // Get the parent container (max-w-3xl)
    const contentContainer = document.querySelector('.max-w-3xl')
    if (!contentContainer) return
    const containerRect = contentContainer.getBoundingClientRect()
    
    // Calculate position relative to the editor element and ensure the toolbar is visible
    const menuWidth = Math.min(containerRect.width * 0.95, 600) // Responsive width based on container
    
    // Calculate horizontal position centered on selection
    let leftPos = rect.left + (rect.width / 2) - (menuWidth / 2)
    
    // Constrain to container boundaries, not window boundaries
    const containerLeft = containerRect.left
    const containerRight = containerRect.right
    
    // Keep toolbar within container bounds (with small margins)
    const margin = 8 // Small margin from container edge
    leftPos = Math.max(
      containerLeft + margin,
      Math.min(leftPos, containerRight - menuWidth - margin)
    )
    
    // Check if the toolbar would be positioned above the viewport
    const spaceAbove = rect.top - window.scrollY
    const transformDirection = spaceAbove < 50 ? 'translateY(10px)' : 'translateY(-100%)'
    
    // Vertical positioning with container boundaries in mind
    const topPosition = rect.top - editorRect.top
    
    // Adjust position based on whether toolbar displays above or below text
    let adjustedTop = topPosition
    if (transformDirection === 'translateY(-100%)') {
      // When showing above text, ensure there's room
      if (topPosition < 50) {
        // Not enough room above, show below
        adjustedTop = topPosition + rect.height + 10
      } else {
        // Show above with offset
        adjustedTop = topPosition - 10
      }
    } else {
      // When showing below text, add offset from selection
      adjustedTop = topPosition + rect.height + 10
    }
    
    // Calculate the absolute position of the toolbar relative to the container
    const absoluteTop = adjustedTop + editorRect.top - containerRect.top
    
    // Check if toolbar would overflow the container vertically
    if (absoluteTop < margin) {
      // Too close to top of container, move it down
      adjustedTop = margin + (editorRect.top - containerRect.top)
    } else if (absoluteTop + 50 > containerRect.height - margin) {
      // Too close to bottom of container, move it up
      adjustedTop = containerRect.height - margin - 50 - (editorRect.top - containerRect.top)
    }
    
    setFloatingMenuPosition({
      top: adjustedTop,
      left: leftPos - editorRect.left, // Adjust for editor position
      transform: transformDirection
    })
  }, [editor])

  useEffect(() => {
    if (editor) {
      // Handle selection changes to detect active selection and position floating menu
      editor.on('selectionUpdate', () => {
        if (editor.view.state.selection.empty) {
          setSelectionActive(false)
          return
        }
        
        setSelectionActive(true)
        updateToolbarPosition()
      })
      
      // Also update on scroll to keep toolbar positioned correctly relative to selection
      const handleScroll = () => {
        if (selectionActive) {
          updateToolbarPosition()
        }
      }
      
      // Detect click outside to hide floating menu
      const handleClickOutside = (event: MouseEvent) => {
        if (editor.view && !editor.view.state.selection.empty) return
        setSelectionActive(false)
      }
      
      // Update position on window resize to handle responsive layout changes
      const handleResize = () => {
        if (selectionActive) {
          updateToolbarPosition()
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleResize)
      
      return () => {
        editor.off("selectionUpdate")
        document.removeEventListener('mousedown', handleClickOutside)
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [editor, selectionActive, updateToolbarPosition])

  if (!editor) {
    return null
  }

  return (
    <div className="relative min-h-[calc(100vh_-_10rem)]" ref={editorContainerRef}>
      {/* Floating formatting toolbar */}
      <FloatingToolbar 
        editor={editor}
        isActive={selectionActive}
        position={floatingMenuPosition}
        onImageAdd={() => setImageDialogOpen(true)}
      />
      
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
