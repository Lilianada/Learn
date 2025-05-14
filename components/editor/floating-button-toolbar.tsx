"use client";

import { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Code,
  Keyboard,
  XCircle,
  Palette,
  Type,
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
import { cn } from "@/lib/utils";

interface FloatingButtonToolbarProps {
  editor: Editor;
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

export function FloatingButtonToolbar({
  editor,
  onImageAdd,
}: FloatingButtonToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [mainContentWidth, setMainContentWidth] = useState(0);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get current text color for display in the UI
  const currentTextColor = editor.getAttributes("textStyle").color;

  // Track the width of the main content area for proper positioning
  useEffect(() => {
    const mainContent = document.querySelector(".max-w-5xl");

    if (mainContent) {
      const updateMainContentWidth = () => {
        const rect = mainContent.getBoundingClientRect();
        setMainContentWidth(rect.width);
      };

      // Set initial width
      updateMainContentWidth();

      // Update on resize
      window.addEventListener("resize", updateMainContentWidth);
      return () => window.removeEventListener("resize", updateMainContentWidth);
    }
  }, []);

  // Make sure editor stays focused when using the toolbar
  const handleToolbarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Re-focus editor after clicking toolbar items
    setTimeout(() => {
      editor.view.focus();
    }, 0);
  };

  return (
    <div
      className="fixed bottom-4 md:bottom-10 z-50"
      style={{
        right:
          mainContentWidth > 0
            ? `calc(40% - ${mainContentWidth / 2}px + 10px)`
            : "10px",
      }}
    >
      {/* Main floating button */}
      <Button
        ref={buttonRef}
        variant="default"
        size="icon"
        className={`h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg transition-all
             ${isOpen ? "rotate-90" : "rotate-0"}
             bg-primary text-primary-foreground hover:bg-primary/90
             dark:bg-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-700
             warm:bg-amber-500 warm:text-amber-950 warm:hover:bg-amber-400`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XCircle className="h-5 w-5 md:h-6 md:w-6" />
        ) : (
          <Keyboard className="h-5 w-5 md:h-6 md:w-6" />
        )}
      </Button>
      {/* Toolbar that extends upward when button is clicked */}
      <div
        ref={toolbarRef}
        className={`absolute bottom-16 right-0 bg-background border rounded-lg shadow-lg p-3 
                   ${
                     isOpen
                       ? "opacity-100 translate-y-0"
                       : "opacity-0 translate-y-8 pointer-events-none"
                   } 
                   transition-all duration-300 ease-out`}
        style={{
          width: "300px",
          maxWidth: "calc(100vw - 40px)",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
        onClick={handleToolbarClick}
      >
        <div className="flex flex-col space-y-3">
          <h3 className="text-md font-medium border-b pb-2 mb-1">
            Text Formatting
          </h3>

          {/* Headings */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Headings
            </label>
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
              <Button
                variant={
                  editor.isActive("heading", { level: 1 })
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                onMouseDown={(e) => e.preventDefault()}
              >
                <Heading1 className="h-4 w-4 mr-1" /> H1
              </Button>
              <Button
                variant={
                  editor.isActive("heading", { level: 2 })
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                onMouseDown={(e) => e.preventDefault()}
              >
                <Heading2 className="h-4 w-4 mr-1" /> H2
              </Button>
              <Button
                variant={
                  editor.isActive("heading", { level: 3 })
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                onMouseDown={(e) => e.preventDefault()}
              >
                <Heading3 className="h-4 w-4 mr-1" /> H3
              </Button>
              <Button
                variant={editor.isActive("paragraph") ? "default" : "outline"}
                size="sm"
                onClick={() => editor.chain().focus().setParagraph().run()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Type className="h-4 w-4 mr-1" /> Normal
              </Button>
            </div>
          </div>

          {/* Font Size */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Font Size
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                >
                  <span>
                    {editor
                      .getAttributes("textStyle")
                      .fontSize?.replace("px", "") || "14"}{" "}
                    px
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[12, 14, 16, 18, 20, 24, 30].map((size) => (
                  <DropdownMenuItem
                    key={size}
                    className={
                      editor.getAttributes("textStyle").fontSize === `${size}px`
                        ? "bg-accent"
                        : ""
                    }
                    onClick={() => {
                      editor.chain().focus().setFontSize(`${size}px`).run();
                      editor.view.focus();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {size}px
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Text Styling */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Text Style
            </label>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className={cn("flex-1", editor.isActive("bold") && "bg-accent")}
                onClick={() => editor.chain().focus().toggleBold().run()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1",
                  editor.isActive("italic") && "bg-accent"
                )}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1",
                  editor.isActive("underline") && "bg-accent"
                )}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1",
                  editor.isActive("strike") && "bg-accent"
                )}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Alignment */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Alignment
            </label>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1",
                  editor.isActive({ textAlign: "left" }) && "bg-accent"
                )}
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                onMouseDown={(e) => e.preventDefault()}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1",
                  editor.isActive({ textAlign: "center" }) && "bg-accent"
                )}
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                onMouseDown={(e) => e.preventDefault()}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1",
                  editor.isActive({ textAlign: "right" }) && "bg-accent"
                )}
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                onMouseDown={(e) => e.preventDefault()}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Color Picker */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Text Color
            </label>
            <Popover open={showColors} onOpenChange={setShowColors}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex justify-between"
                  onClick={() => setShowColors(true)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="flex items-center">
                    <Circle
                      className="h-4 w-4 mr-2"
                      fill={currentTextColor || "transparent"}
                      stroke={
                        currentTextColor ? currentTextColor : "currentColor"
                      }
                    />
                    <span>Color</span>
                  </div>
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-64"
                align="center"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-4 gap-1 p-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className="w-12 h-12 rounded-full cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                      style={{ backgroundColor: color.value }}
                      onClick={() => {
                        editor.chain().focus().setColor(color.value).run();
                        setShowColors(false);
                        editor.view.focus();
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      title={color.name}
                    >
                      {currentTextColor === color.value && (
                        <Circle className="h-2 w-2 text-white" fill="white" />
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <h3 className="text-md font-medium border-b pb-2 mb-1 mt-2">
            Lists & Blocks
          </h3>

          {/* Lists */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Lists
            </label>
            <div className="flex gap-2">
              <Button
                variant={editor.isActive("bulletList") ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <List className="h-4 w-4 mr-2" /> Bullet List
              </Button>
              <Button
                variant={editor.isActive("orderedList") ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ListOrdered className="h-4 w-4 mr-2" /> Numbered List
              </Button>
            </div>
          </div>

          {/* Special blocks */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Blocks
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={editor.isActive("blockquote") ? "default" : "outline"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Quote className="h-4 w-4 mr-2" /> Quote
              </Button>
              <Button
                variant={editor.isActive("codeBlock") ? "default" : "outline"}
                size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Code className="h-4 w-4 mr-2" /> Code Block
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
                }
                onMouseDown={(e) => e.preventDefault()}
              >
                <TableIcon className="h-4 w-4 mr-2" /> Table
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onImageAdd) {
                    onImageAdd();
                  } else {
                    // Create a file input element if no handler is provided
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (event) => {
                      const file = (event.target as HTMLInputElement)
                        .files?.[0];
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
                onMouseDown={(e) => e.preventDefault()}
              >
                <ImageIcon className="h-4 w-4 mr-2" /> Image
              </Button>
            </div>
          </div>

          {/* Utilities */}
          <div className="mt-3 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
              onMouseDown={(e) => e.preventDefault()}
            >
              Clear formatting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
