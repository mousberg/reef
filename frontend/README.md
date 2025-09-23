# Reef Frontend

The frontend for Reef - an AI agent workflow platform that enables users to build, deploy, and manage AI agents effortlessly. Think "Lovable for AI Agents" - a natural language platform for creating intelligent agents that users love.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautifully designed components built on Radix UI
- **Firebase** - Authentication and real-time database
- **AI SDK** - Vercel's AI SDK for LLM integration
- **OpenAI** - GPT models for AI agent conversations
- **React Flow** - Interactive workflow visualization
- **Framer Motion** - Animation library
- **React Hook Form** - Form state management
- **Sonner** - Toast notifications

## Environment Setup

1. Copy the environment example file:
   ```bash
   cp env_example .env.local
   ```

2. Configure your environment variables in `.env.local`:
   ```bash
   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # AI API Keys
   OPENAI_API_KEY=your_openai_api_key_here
   MISTRAL_API_KEY=your_mistral_api_key_here
   ```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

2. Set up your environment variables (see Environment Setup above)

3. Run the development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Development

### Adding Components

Add new shadcn/ui components:
```bash
npx shadcn@latest add [component-name]
```

### Key Development Notes

- **Authentication**: Uses Firebase Auth with Google sign-in
- **Real-time Data**: Firebase Firestore for real-time project updates
- **AI Integration**: OpenAI GPT models via Vercel AI SDK
- **Workflow Visualization**: React Flow for interactive node-based UI
- **Styling**: Tailwind CSS with custom design system

## Deployment

### Prerequisites

1. Set up Firebase project with Authentication and Firestore enabled
2. Obtain OpenAI API key
3. Configure environment variables for production

### Build for Production

```bash
npm run build
# or
bun run build
```

### Environment Variables for Production

Ensure all environment variables are properly set in your production environment:
- Firebase configuration
- OpenAI API key
- Mistral API key (optional)

### Vercel Deployment

This project is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Features

- **🏠 Landing Page** - Marketing website with hero section, features, and documentation
- **🔐 Authentication** - Firebase-powered user authentication
- **📁 Project Management** - Create, rename, delete, and organize AI agent projects
- **💬 AI Chat Interface** - Natural language conversation to build and modify workflows
- **🎨 Visual Workflow Canvas** - Interactive diagram showing agent relationships and data flow
- **🔍 Trace Viewer** - Monitor agent performance and conversation history
- **⚙️ Settings** - User preferences and configuration
- **📱 Responsive Design** - Works seamlessly across desktop and mobile devices

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/          # AI chat endpoint
│   │   ├── deploy/        # Workflow deployment
│   │   └── export/        # Project export
│   ├── auth/              # Authentication pages
│   ├── projects/          # Project management
│   │   └── [id]/          # Individual project pages
│   ├── settings/          # User settings
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── workflow/         # Workflow canvas components
│   ├── TraceViewer/      # Trace monitoring components
│   ├── ChatPane.tsx      # Chat interface
│   ├── Composer.tsx      # Message composer
│   └── ...               # Other feature components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── firebase.ts       # Firebase configuration
│   ├── utils.ts          # General utilities
│   └── workflow-parser.ts # Workflow parsing logic
└── types/                # TypeScript type definitions
    ├── chat.ts           # Chat-related types
    ├── workflow.ts       # Workflow types
    └── traces.ts         # Trace types
```