# LearnDev - Structured Learning Application

A Next.js application for organizing learning materials in a hierarchical structure of Subjects, Topics, and Subtopics, with support for local storage and optional Firebase integration.

## Project Structure

```
LearnDev/
├── app/                      # Next.js application structure
│   ├── globals.css           # Global CSS styles
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Main page component
├── components/               # React components
│   ├── ui/                   # UI components (shadcn/ui based)
│   ├── app-layout.tsx        # Main application layout
│   ├── client-firebase-init.tsx # Client-side Firebase initialization
│   ├── editor.tsx            # Rich text editor wrapper
│   ├── firebase-init.tsx     # Firebase initialization
│   ├── header.tsx            # Application header
│   ├── main-content.tsx      # Main content area
│   ├── settings-menu.tsx     # Settings dropdown menu
│   ├── sidebar.tsx           # Application sidebar
│   ├── sign-in-dialog.tsx    # Firebase authentication dialog
│   ├── store-initializer.tsx # Store initialization component
│   └── theme-provider.tsx    # Theme provider component
├── hooks/                    # Custom React hooks
│   ├── use-media-query.ts    # Media query hook
│   └── use-toast.ts          # Toast notifications hook
├── lib/                      # Utility functions
│   ├── auth-context.tsx      # Firebase authentication context
│   ├── export.ts             # Export utilities
│   ├── firebase-service.ts   # Firebase data operations
│   ├── firebase.ts           # Firebase configuration
│   └── utils.ts              # General utilities
├── public/                   # Static assets
├── store/                    # State management
│   ├── use-firebase-store.ts # Firebase-backed store
│   ├── use-settings.ts       # UI settings store
│   └── use-store.ts          # Local storage store
├── types/                    # TypeScript type definitions
│   └── store-types.ts        # Common type definitions
├── next.config.mjs           # Next.js configuration
├── package.json              # Project dependencies
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Features

- **Hierarchical Organization**: Structure your learning materials into Subjects, Topics, and Subtopics
- **Rich Text Editor**: Create and edit content with a powerful editor
- **Firebase Integration**: Optional cloud syncing with Google authentication
- **Local Storage**: Work offline with automatic local storage
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Customizable UI**: Light, dark, and warm theme options
- **Export Options**: Export content to PDF and Markdown

## Technical Stack

- **Framework**: Next.js 15
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore (optional)  
- **Editor**: TipTap for rich text editing
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Firebase project (optional, for cloud syncing)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with Firebase configuration (optional):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Click "Sign in with Google" to enable Firebase syncing (optional)
- Create subjects, topics, and subtopics using the sidebar
- Click on any item to edit its content
- Your data is automatically saved to local storage and Firebase (if signed in)
