# LearnDev - LearnIt Reimplementation

This is a reimplementation of the LearnIt application following best practices. It was created as a clean, well-structured version of the original LearnIt app.

## Project Structure

```
LearnDev/
├── app/                 # Next.js application structure
│   ├── globals.css      # Global CSS styles
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Main page component
├── components/          # React components
│   ├── ui/              # UI components (shadcn/ui based)
│   ├── app-layout.tsx   # Main application layout
│   ├── editor.tsx       # Rich text editor (TipTap)
│   ├── header.tsx       # Application header
│   ├── main-content.tsx # Main content area
│   ├── mode-toggle.tsx  # Light/dark mode toggle
│   ├── sidebar.tsx      # Application sidebar
│   └── theme-provider.tsx # Theme provider component
├── hooks/               # Custom React hooks
│   ├── use-media-query.ts # Media query hook
│   ├── use-mobile.tsx   # Mobile detection hook
│   └── use-toast.ts     # Toast notifications hook
├── lib/                 # Utility functions
│   ├── export.ts        # Export utilities
│   └── utils.ts         # General utilities
├── public/              # Static assets
├── store/               # State management
│   └── use-store.ts     # Zustand store
├── next.config.mjs      # Next.js configuration
├── package.json         # Project dependencies
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Features

- Hierarchical organization of learning materials (Subjects > Topics > Subtopics)
- Rich text editor with formatting options
- Light/dark mode support
- Responsive design that works on both desktop and mobile
- Local storage persistence
- Export functionality to PDF and Markdown

## Technical Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Zustand for state management
- TipTap for rich text editing
# Learn
