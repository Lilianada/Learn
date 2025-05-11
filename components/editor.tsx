"use client"

// This file re-exports the editor component from the editor folder
// to maintain backward compatibility with existing imports
import { Editor as EditorComponent } from "@/components/editor/editor"

// Export the editor component
export default EditorComponent
export { EditorComponent as Editor }

