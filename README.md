# 🎵 MelodAI — AI Music Generation Platform

A full-stack Suno.com-inspired music generation app built with Next.js 14, Supabase, and Producer.ai.

---

## 🗂 Project Structure

```
melodai/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── auth/
│   │   ├── login/page.tsx        # Login/Signup UI
│   │   └── callback/route.ts     # OAuth callback
│   ├── create/
│   │   ├── page.tsx              # Server component
│   │   └── CreatePageClient.tsx  # Main create UI
│   ├── explore/
│   │   ├── page.tsx              # Server component
│   │   └── ExploreClient.tsx     # Browse songs UI
│   ├── profile/
│   │   ├── page.tsx              # Server component
│   │   └── ProfileClient.tsx     # Profile UI
│   └── api/
│       ├── generate/route.ts     # POST - generate song
│       └── songs/
│           ├── [taskId]/route.ts # GET - poll status
│           └── like/[songId]/route.ts # POST - like song
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── AppShell.tsx          # Page shell with player
│   ├── player/
│   │   └── PlayerBar.tsx         # Bottom music player
│   └── songs/
│       └── SongCard.tsx          # Song list item
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Session middleware
│   ├── store.ts                  # Zustand state
│   ├── producer.ts               # Producer.ai API
│   └── utils.ts                  # Helpers
├── types/index.ts                # TypeScript types
├── middleware.ts                 # Next.js middleware
└── supabase/schema.sql           # Full DB schema
```

---

## 🚀 Setup Guide

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. Go to **Authentication → Providers** and enable:
   - Email/Password
   - Google OAuth (add Client ID & Secret)
   - GitHub OAuth (add Client ID & Secret)
4. Go to **Project Settings → API** and copy your keys

### 3. Set up Producer.ai API

1. Sign up at [ttapi.io](https://ttapi.io) or [producer.ai](https://producer.ai)
2. Get your API key from the dashboard

### 4. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

PRODUCER_AI_API_KEY=your_key_here
PRODUCER_AI_BASE_URL=https://api.ttapi.io

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Configure OAuth Redirect URLs

In Supabase → Authentication → URL Configuration, add:
```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
```

In Google/GitHub OAuth app settings, add the same callback URLs.

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎯 Features

| Feature | Status |
|---|---|
| Landing page | ✅ |
| Email/Password auth | ✅ |
| Google OAuth | ✅ |
| GitHub OAuth | ✅ |
| Create songs with AI | ✅ |
| Producer.ai integration | ✅ |
| Real-time generation polling | ✅ |
| Song workspace with search | ✅ |
| Music player with audio | ✅ |
| Explore public songs | ✅ |
| User profile + library | ✅ |
| Credits system | ✅ |
| Like/Unlike songs | ✅ |
| Go Pro upgrade flow | ✅ |

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Email + Google + GitHub)
- **Storage**: Supabase Storage (audio, covers, avatars)
- **AI Music**: Producer.ai / TTAPI
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Fonts**: Syne (display) + DM Sans (body)

---

## 📦 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add env variables in Vercel dashboard
# Update NEXT_PUBLIC_APP_URL to your production URL
# Add production URL to Supabase allowed origins
```
