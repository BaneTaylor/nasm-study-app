# Phase 1: Project Setup + Auth + Database — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a working Next.js app with Supabase auth (signup, login, logout), all database tables created, and a protected dashboard page — deployed to Vercel.

**Architecture:** Next.js App Router with server components. Supabase handles auth and database. Tailwind CSS for styling. All routes except landing/login/signup are protected via middleware.

**Tech Stack:** Next.js 14 (App Router), Supabase (Auth + PostgreSQL), Tailwind CSS, TypeScript

---

## File Structure

```
nasm-study-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with Supabase provider
│   │   ├── page.tsx                # Landing page
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   ├── signup/
│   │   │   └── page.tsx            # Signup page
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts        # Supabase auth callback handler
│   │   └── dashboard/
│   │       └── page.tsx            # Protected dashboard (placeholder)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   ├── server.ts           # Server Supabase client
│   │   │   └── middleware.ts        # Auth middleware helper
│   │   └── types/
│   │       └── database.ts         # TypeScript types for all tables
│   └── middleware.ts               # Next.js middleware for route protection
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # All table definitions + RLS policies
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local.example              # Template for required env vars
```

---

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Create Next.js project with TypeScript and Tailwind**

Run:
```bash
cd /Users/gavintaylor/nasm-study-app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

When prompted about overwriting files, select Yes (it will preserve our docs/ folder).

Expected: Project scaffolded with `src/app/` structure, Tailwind configured.

- [ ] **Step 2: Verify the dev server starts**

Run:
```bash
npm run dev
```

Expected: Server starts at http://localhost:3000, default Next.js page renders.

- [ ] **Step 3: Stop dev server and commit**

Run:
```bash
git add -A
git commit -m "feat: initialize Next.js project with TypeScript and Tailwind"
```

---

### Task 2: Install Supabase Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Supabase packages**

Run:
```bash
cd /Users/gavintaylor/nasm-study-app
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Create environment variable template**

Create `.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: Create .env.local with actual values**

The engineer needs to:
1. Go to https://supabase.com and create a new project called "nasm-study-app"
2. Go to Project Settings → API
3. Copy the Project URL and anon/public key

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<paste project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste anon key>
```

- [ ] **Step 4: Ensure .env.local is in .gitignore**

Verify `.gitignore` contains `.env.local` (it should from create-next-app). If not, add it.

- [ ] **Step 5: Commit**

Run:
```bash
git add package.json package-lock.json .env.local.example
git commit -m "feat: add Supabase dependencies and env template"
```

---

### Task 3: Create Supabase Client Utilities

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`

- [ ] **Step 1: Create browser client**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server client**

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create middleware helper**

Create `src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ["/dashboard", "/flashcards", "/quiz", "/chapters", "/schedule", "/stats", "/settings", "/onboarding"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login/signup
  const authPaths = ["/login", "/signup"];
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 4: Commit**

Run:
```bash
git add src/lib/supabase/
git commit -m "feat: add Supabase client utilities for browser, server, and middleware"
```

---

### Task 4: Add Auth Middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create Next.js middleware**

Create `src/middleware.ts`:
```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/middleware.ts
git commit -m "feat: add auth middleware for route protection"
```

---

### Task 5: Create Auth Callback Route

**Files:**
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Create the callback handler**

Create `src/app/auth/callback/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/app/auth/callback/
git commit -m "feat: add Supabase auth callback route"
```

---

### Task 6: Create Signup Page

**Files:**
- Create: `src/app/signup/page.tsx`

- [ ] **Step 1: Create signup page**

Create `src/app/signup/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Create Account
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Start your NASM CPT study journey
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/app/signup/
git commit -m "feat: add signup page with email/password auth"
```

---

### Task 7: Create Login Page

**Files:**
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Create login page**

Create `src/app/login/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Log in to continue studying
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/app/login/
git commit -m "feat: add login page with email/password auth"
```

---

### Task 8: Create Landing Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace default landing page**

Replace `src/app/page.tsx` with:
```tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold text-white">NASM Study</span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 max-w-3xl">
          Pass Your NASM CPT Exam
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl">
          Personalized study plans, smart flashcards, practice quizzes, and
          analytics — all tailored to how you learn best.
        </p>
        <Link
          href="/signup"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-colors"
        >
          Start Studying Free
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl">
          <div className="text-left">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Adaptive Study Plan
            </h3>
            <p className="text-gray-400 text-sm">
              Takes a quick assessment of how you learn, then builds a
              week-by-week plan that adapts as you improve.
            </p>
          </div>
          <div className="text-left">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Know Where You Stand
            </h3>
            <p className="text-gray-400 text-sm">
              Real-time stats show your mastery percentage, exam readiness
              projection, and exactly which chapters need work.
            </p>
          </div>
          <div className="text-left">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Smart Flashcards & Quizzes
            </h3>
            <p className="text-gray-400 text-sm">
              Spaced repetition flashcards and exam-style practice quizzes
              with detailed explanations for every answer.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/app/page.tsx
git commit -m "feat: add landing page with hero and feature highlights"
```

---

### Task 9: Create Database Migration

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create the migration file with all tables and RLS policies**

Create `supabase/migrations/001_initial_schema.sql`:
```sql
-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  exam_date date,
  hours_per_week integer,
  prior_experience text check (prior_experience in ('none', 'some', 'extensive')),
  learning_style jsonb default '{}',
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Flashcards
create table flashcards (
  id uuid default gen_random_uuid() primary key,
  chapter integer not null check (chapter between 1 and 20),
  term text not null,
  definition text not null,
  is_default boolean default true,
  created_by uuid references auth.users on delete cascade,
  created_at timestamptz default now()
);

alter table flashcards enable row level security;
create policy "Anyone can view default flashcards" on flashcards for select using (is_default = true);
create policy "Users can view own flashcards" on flashcards for select using (auth.uid() = created_by);
create policy "Users can create flashcards" on flashcards for insert with check (auth.uid() = created_by and is_default = false);
create policy "Users can delete own flashcards" on flashcards for delete using (auth.uid() = created_by and is_default = false);

-- Flashcard progress (spaced repetition tracking)
create table flashcard_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  flashcard_id uuid references flashcards on delete cascade not null,
  rating text check (rating in ('didnt_know', 'kinda_knew', 'nailed_it')),
  next_review_at timestamptz default now(),
  review_count integer default 0,
  last_reviewed_at timestamptz,
  unique (user_id, flashcard_id)
);

alter table flashcard_progress enable row level security;
create policy "Users can view own progress" on flashcard_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on flashcard_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on flashcard_progress for update using (auth.uid() = user_id);

-- Questions (quiz bank)
create table questions (
  id uuid default gen_random_uuid() primary key,
  chapter integer not null check (chapter between 1 and 20),
  question text not null,
  options jsonb not null,
  correct_answer integer not null check (correct_answer between 0 and 3),
  explanation text not null,
  difficulty text default 'medium' check (difficulty in ('easy', 'medium', 'hard'))
);

alter table questions enable row level security;
create policy "Anyone authenticated can view questions" on questions for select using (auth.uid() is not null);

-- Quiz results
create table quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  quiz_type text not null check (quiz_type in ('chapter', 'mixed', 'weak_areas', 'exam_simulation')),
  chapter integer check (chapter between 1 and 20),
  score integer not null,
  total_questions integer not null,
  correct_count integer not null,
  answers jsonb not null default '[]',
  started_at timestamptz default now(),
  completed_at timestamptz
);

alter table quiz_results enable row level security;
create policy "Users can view own results" on quiz_results for select using (auth.uid() = user_id);
create policy "Users can insert own results" on quiz_results for insert with check (auth.uid() = user_id);

-- Chapter summaries
create table chapter_summaries (
  id uuid default gen_random_uuid() primary key,
  chapter_number integer unique not null check (chapter_number between 1 and 20),
  title text not null,
  content text not null,
  key_terms jsonb not null default '[]',
  key_concepts jsonb not null default '[]'
);

alter table chapter_summaries enable row level security;
create policy "Anyone authenticated can view summaries" on chapter_summaries for select using (auth.uid() is not null);

-- Study plans
create table study_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  plan jsonb not null,
  generated_at timestamptz default now(),
  is_active boolean default true
);

alter table study_plans enable row level security;
create policy "Users can view own plans" on study_plans for select using (auth.uid() = user_id);
create policy "Users can insert own plans" on study_plans for insert with check (auth.uid() = user_id);
create policy "Users can update own plans" on study_plans for update using (auth.uid() = user_id);

-- Study sessions
create table study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  scheduled_date date not null,
  chapter integer not null check (chapter between 1 and 20),
  activity_type text not null check (activity_type in ('flashcards', 'quiz', 'summary', 'practice_exam')),
  duration_minutes integer not null,
  completed boolean default false,
  completed_at timestamptz
);

alter table study_sessions enable row level security;
create policy "Users can view own sessions" on study_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on study_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on study_sessions for update using (auth.uid() = user_id);

-- Fun facts
create table fun_facts (
  id uuid default gen_random_uuid() primary key,
  chapter integer not null check (chapter between 1 and 20),
  emoji text not null,
  fact text not null,
  chapter_label text not null
);

alter table fun_facts enable row level security;
create policy "Anyone authenticated can view fun facts" on fun_facts for select using (auth.uid() is not null);

-- Fun fact views (track which facts a user has seen)
create table fun_fact_views (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  fun_fact_id uuid references fun_facts on delete cascade not null,
  viewed_at timestamptz default now(),
  unique (user_id, fun_fact_id)
);

alter table fun_fact_views enable row level security;
create policy "Users can view own fact views" on fun_fact_views for select using (auth.uid() = user_id);
create policy "Users can insert own fact views" on fun_fact_views for insert with check (auth.uid() = user_id);
```

- [ ] **Step 2: Run the migration in Supabase**

The engineer needs to:
1. Go to their Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Paste the entire contents of `001_initial_schema.sql`
4. Click "Run"

Expected: All tables created with RLS policies. No errors.

- [ ] **Step 3: Verify tables exist**

In Supabase dashboard → Table Editor, verify these tables exist:
- profiles
- flashcards
- flashcard_progress
- questions
- quiz_results
- chapter_summaries
- study_plans
- study_sessions
- fun_facts
- fun_fact_views

- [ ] **Step 4: Commit**

Run:
```bash
git add supabase/
git commit -m "feat: add database migration with all tables and RLS policies"
```

---

### Task 10: Create TypeScript Types

**Files:**
- Create: `src/lib/types/database.ts`

- [ ] **Step 1: Create database types**

Create `src/lib/types/database.ts`:
```typescript
export type Profile = {
  id: string;
  display_name: string | null;
  exam_date: string | null;
  hours_per_week: number | null;
  prior_experience: "none" | "some" | "extensive" | null;
  learning_style: {
    visual: number;
    reading_writing: number;
    active_recall: number;
    practical: number;
  } | null;
  onboarding_completed: boolean;
  created_at: string;
};

export type Flashcard = {
  id: string;
  chapter: number;
  term: string;
  definition: string;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
};

export type FlashcardProgress = {
  id: string;
  user_id: string;
  flashcard_id: string;
  rating: "didnt_know" | "kinda_knew" | "nailed_it" | null;
  next_review_at: string;
  review_count: number;
  last_reviewed_at: string | null;
};

export type Question = {
  id: string;
  chapter: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

export type QuizResult = {
  id: string;
  user_id: string;
  quiz_type: "chapter" | "mixed" | "weak_areas" | "exam_simulation";
  chapter: number | null;
  score: number;
  total_questions: number;
  correct_count: number;
  answers: {
    question_id: string;
    selected: number;
    correct: number;
    time_spent_seconds: number;
  }[];
  started_at: string;
  completed_at: string | null;
};

export type ChapterSummary = {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  key_terms: { term: string; definition: string }[];
  key_concepts: string[];
};

export type StudyPlan = {
  id: string;
  user_id: string;
  plan: {
    week: number;
    chapters: number[];
    focus_type: string;
    hours: number;
  }[];
  generated_at: string;
  is_active: boolean;
};

export type StudySession = {
  id: string;
  user_id: string;
  scheduled_date: string;
  chapter: number;
  activity_type: "flashcards" | "quiz" | "summary" | "practice_exam";
  duration_minutes: number;
  completed: boolean;
  completed_at: string | null;
};

export type FunFact = {
  id: string;
  chapter: number;
  emoji: string;
  fact: string;
  chapter_label: string;
};

export type FunFactView = {
  id: string;
  user_id: string;
  fun_fact_id: string;
  viewed_at: string;
};
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/lib/types/
git commit -m "feat: add TypeScript types for all database tables"
```

---

### Task 11: Create Protected Dashboard Page

**Files:**
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard page that shows user info**

Create `src/app/dashboard/page.tsx`:
```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if onboarding is completed
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, display_name")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
            </h1>
            <p className="text-gray-400">Your NASM study dashboard</p>
          </div>
          <LogoutButton />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-lg">
            Dashboard coming soon — this is the foundation. Study features will be added in upcoming phases.
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create logout button component**

Create `src/app/dashboard/logout-button.tsx`:
```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors text-sm"
    >
      Log Out
    </button>
  );
}
```

- [ ] **Step 3: Commit**

Run:
```bash
git add src/app/dashboard/
git commit -m "feat: add protected dashboard page with logout and onboarding redirect"
```

---

### Task 12: Update Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update the root layout with app metadata and dark background**

Replace `src/app/layout.tsx` with:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NASM Study — Pass Your CPT Exam",
  description:
    "Personalized study plans, smart flashcards, and practice quizzes for the NASM Certified Personal Trainer exam.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add src/app/layout.tsx
git commit -m "feat: update root layout with app metadata and dark theme"
```

---

### Task 13: End-to-End Smoke Test

- [ ] **Step 1: Start the dev server**

Run:
```bash
cd /Users/gavintaylor/nasm-study-app
npm run dev
```

- [ ] **Step 2: Test the full auth flow**

1. Open http://localhost:3000 — landing page should render with "Pass Your NASM CPT Exam" hero
2. Click "Get Started" — should go to signup page
3. Enter an email and password, click "Sign Up"
4. Should redirect to `/onboarding` (which will 404 for now — that's expected, it's Phase 2)
5. Manually navigate to http://localhost:3000/dashboard — should show dashboard with your email
6. Click "Log Out" — should return to landing page
7. Navigate to http://localhost:3000/dashboard while logged out — should redirect to login
8. Log in with your credentials — should go to dashboard

- [ ] **Step 3: Verify database**

In Supabase dashboard → Table Editor → profiles:
- A row should exist for your user with `onboarding_completed = false`

- [ ] **Step 4: Commit any fixes if needed**

If any issues were found and fixed during testing:
```bash
git add -A
git commit -m "fix: address issues found during smoke test"
```

---

### Task 14: Deploy to Vercel

- [ ] **Step 1: Install Vercel CLI**

Run:
```bash
npm install -g vercel
```

- [ ] **Step 2: Create GitHub repository**

The engineer needs to:
1. Go to https://github.com/new
2. Create a new repo called `nasm-study-app`
3. Don't initialize with README (we already have files)

Run:
```bash
cd /Users/gavintaylor/nasm-study-app
git remote add origin https://github.com/<your-username>/nasm-study-app.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Deploy via Vercel**

Run:
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **nasm-study-app**
- Directory? **./**
- Override settings? **N**

- [ ] **Step 4: Set environment variables in Vercel**

Run:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Paste the same values from your `.env.local` when prompted. Select all environments (Production, Preview, Development).

- [ ] **Step 5: Redeploy with env vars**

Run:
```bash
vercel --prod
```

- [ ] **Step 6: Update Supabase redirect URL**

In Supabase dashboard → Authentication → URL Configuration:
- Add your Vercel URL to "Redirect URLs": `https://nasm-study-app.vercel.app/auth/callback`

- [ ] **Step 7: Test the deployed app**

Open your Vercel URL and run through the same auth flow from Task 13.

- [ ] **Step 8: Commit Vercel config if generated**

Run:
```bash
git add -A
git commit -m "chore: add Vercel project config"
git push
```
