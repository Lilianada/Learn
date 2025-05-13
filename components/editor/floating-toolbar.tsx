"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Circle,
  Download,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  TableIcon,
  ImageIcon,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FloatingToolbarProps {
  editor: Editor;
  isActive: boolean;
  position: { top: number; left: number; transform: string };
  onImageAdd?: () => void;
}

// Colors based on the image
const colorOptions = [
  { name: "Pink", value: "#ff5a90" },
  { name: "Orange", value: "#f5780d" },
  { name: "Brown", value: "#8a5c37" },
  { name: "Black", value: "#000000" },
  { name: "Light Pink", value: "#ffb4c0" },
  { name: "Purple", value: "#8b2ee8" },
  { name: "Green", value: "#36c786" },
  { name: "Blue", value: "#2e9cf6" },
  { name: "Red", value: "#e63946" },
  { name: "Yellow", value: "#ffdd00" },
  { name: "Teal", value: "#00b4d8" },
  { name: "Lavender", value: "#9a8ce8" },
  { name: "Mint", value: "#7ae582" },
  { name: "Coral", value: "#ff6b6b" },
];

export function FloatingToolbar({
  editor,
  isActive,
  position,
  onImageAdd,
}: FloatingToolbarProps) {
  const [showColors, setShowColors] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Get current text color for display in the UI
  const currentTextColor = useMemo(() => {
    if (!editor) return null;
    return editor.getAttributes("textStyle").color;
  }, [editor, isActive]);

  // Ensure the toolbar is contained within the viewport when it becomes active
  useEffect(() => {
    if (isActive && toolbarRef.current) {
      // Check if the toolbar is outside the visible area
      const toolbarRect = toolbarRef.current.getBoundingClientRect();
      const contentContainer = document.querySelector(".max-w-4xl");

      if (contentContainer) {
        const containerRect = contentContainer.getBoundingClientRect();

        // Adjust horizontal position if needed
        if (toolbarRect.right > containerRect.right - 8) {
          const offset = toolbarRect.right - containerRect.right + 8;
          if (toolbarRef.current) {
            toolbarRef.current.style.left = `${
              parseFloat(toolbarRef.current.style.left) - offset
            }px`;
          }
        } else if (toolbarRect.left < containerRect.left + 8) {
          const offset = containerRect.left + 8 - toolbarRect.left;
          if (toolbarRef.current) {
            toolbarRef.current.style.left = `${
              parseFloat(toolbarRef.current.style.left) + offset
            }px`;
          }
        }
      }
    }
  }, [isActive, position]);

  if (!isActive || !editor) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 bg-background border rounded shadow-md transition-opacity duration-200 overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: position.transform,
        maxWidth: "calc(100% - 16px)",
      }}
    >
      <div className="flex items-center overflow-x-auto scrollbar-hide py-1 px-1 max-w-full">
        {/* Headings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 px-2 flex items-center gap-1"
            >
              <span className="text-sm hidden sm:inline">Heading</span>
              <span className="text-sm sm:hidden">H</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className={
                editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""
              }
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              <Heading1 className="h-4 w-4 mr-2" />
              <span>Heading 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""
              }
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              <Heading2 className="h-4 w-4 mr-2" />
              <span>Heading 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""
              }
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              <Heading3 className="h-4 w-4 mr-2" />
              <span>Heading 3</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={editor.isActive("paragraph") ? "bg-accent" : ""}
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              <span>Normal text</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Font size dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 px-2 flex items-center gap-1"
            >
              <span className="text-sm">
                {editor
                  .getAttributes("textStyle")
                  .fontSize?.replace("px", "") || "14"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[12, 14, 16, 18, 20, 24, 30].map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() =>
                  editor.chain().focus().setFontSize(`${size}px`).run()
                }
                className={
                  editor.getAttributes("textStyle").fontSize === `${size}px`
                    ? "bg-accent"
                    : ""
                }
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Text formatting options - visible on larger screens */}
        <div className="hidden md:flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-none ${
              editor.isActive("bold") ? "bg-muted" : ""
            }`}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-none ${
              editor.isActive("italic") ? "bg-muted" : ""
            }`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-none ${
              editor.isActive("underline") ? "bg-muted" : ""
            }`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-none ${
              editor.isActive("strike") ? "bg-muted" : ""
            }`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        {/* Text formatting dropdown - visible on smaller screens */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 px-2 flex items-center gap-1"
              >
                <Bold className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className={editor.isActive("bold") ? "bg-accent" : ""}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4 mr-2" />
                <span>Bold</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={editor.isActive("italic") ? "bg-accent" : ""}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4 mr-2" />
                <span>Italic</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={editor.isActive("underline") ? "bg-accent" : ""}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <Underline className="h-4 w-4 mr-2" />
                <span>Underline</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={editor.isActive("strike") ? "bg-accent" : ""}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <Strikethrough className="h-4 w-4 mr-2" />
                <span>Strikethrough</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Alignment options dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 px-2 flex items-center gap-1"
            >
              <AlignLeft className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className={
                editor.isActive({ textAlign: "left" }) ? "bg-accent" : ""
              }
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="h-4 w-4 mr-2" />
              <span>Align left</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""
              }
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <AlignCenter className="h-4 w-4 mr-2" />
              <span>Align center</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                editor.isActive({ textAlign: "right" }) ? "bg-accent" : ""
              }
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="h-4 w-4 mr-2" />
              <span>Align right</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* List formatting dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 px-2 flex items-center gap-1"
            >
              <List className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className={editor.isActive("bulletList") ? "bg-accent" : ""}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4 mr-2" />
              <span>Bullet list</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={editor.isActive("orderedList") ? "bg-accent" : ""}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4 mr-2" />
              <span>Numbered list</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Color picker - remains in a separate popover to handle the color grid UI */}
        <Popover open={showColors} onOpenChange={setShowColors}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none"
              onClick={() => setShowColors(true)}
            >
              <Circle
                className="h-4 w-4"
                fill={currentTextColor || "transparent"}
                stroke={currentTextColor ? currentTextColor : "currentColor"}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2">
            <div className="grid grid-cols-4 gap-1">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    editor.chain().focus().setColor(color.value).run();
                    setShowColors(false);
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Advanced formatting dropdown - now used on all screen sizes for better UI consolidation */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 px-2 flex items-center gap-1"
            >
              <span className="text-sm hidden sm:inline">Insert</span>
              <span className="text-sm sm:hidden">+</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className={editor.isActive("blockquote") ? "bg-accent" : ""}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4 mr-2" />
              <span>Quote</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={editor.isActive("codeBlock") ? "bg-accent" : ""}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Code className="h-4 w-4 mr-2" />
              <span>Code block</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
              }
            >
              <TableIcon className="h-4 w-4 mr-2" />
              <span>Table</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (onImageAdd) {
                  onImageAdd();
                } else {
                  // Create a file input element if no handler is provided
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (event) => {
                    const file = (event.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const result = e.target?.result;
                        if (typeof result === "string") {
                          editor
                            .chain()
                            .focus()
                            .setImage({ src: result })
                            .run();
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }
              }}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              <span>Image</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Utility options dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 px-2 flex items-center gap-1"
            >
              <span className="text-sm hidden sm:inline">More</span>
              <span className="text-sm sm:hidden">⋯</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                // Clear formatting
                editor.chain().focus().unsetAllMarks().run();
              }}
            >
              <Circle className="h-4 w-4 mr-2" />
              <span>Clear formatting</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // Download functionality could be added here
                console.log("Download");
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              <span>Download</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
