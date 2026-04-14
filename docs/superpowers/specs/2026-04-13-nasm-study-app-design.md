# NASM CPT Study App — Design Spec

## Overview

A web-based study application for the NASM Certified Personal Trainer (CPT) exam. The app assesses each user's learning style, generates a personalized long-term study plan, and provides flashcards, quizzes, chapter summaries, progress tracking, and analytics — all tailored to help users pass efficiently.

Multi-user with accounts. Hosted free on Vercel.

## Tech Stack

- **Frontend:** Next.js (React)
- **Backend/Auth/DB:** Supabase (free tier) — PostgreSQL, Auth, Row-Level Security
- **Hosting:** Vercel (free tier) — auto-deploy from GitHub
- **Styling:** Tailwind CSS

## Database Schema

### `users`
Managed by Supabase Auth. Extended with a `profiles` table:
- `id` (UUID, FK to auth.users)
- `display_name` (text)
- `exam_date` (date)
- `hours_per_week` (integer)
- `prior_experience` (text — none / some / extensive)
- `learning_style` (JSONB — scores for visual, reading_writing, active_recall, practical)
- `created_at` (timestamptz)

### `flashcards`
- `id` (UUID)
- `chapter` (integer, 1-20)
- `term` (text)
- `definition` (text)
- `is_default` (boolean — true for pre-loaded cards)
- `created_by` (UUID, nullable — null for defaults, user ID for custom)
- `created_at` (timestamptz)

### `flashcard_progress`
- `id` (UUID)
- `user_id` (UUID)
- `flashcard_id` (UUID)
- `rating` (text — didnt_know / kinda_knew / nailed_it)
- `next_review_at` (timestamptz — spaced repetition scheduling)
- `review_count` (integer)
- `last_reviewed_at` (timestamptz)

### `questions`
- `id` (UUID)
- `chapter` (integer, 1-20)
- `question` (text)
- `options` (JSONB — array of 4 strings)
- `correct_answer` (integer — index 0-3)
- `explanation` (text)
- `difficulty` (text — easy / medium / hard)

### `quiz_results`
- `id` (UUID)
- `user_id` (UUID)
- `quiz_type` (text — chapter / mixed / weak_areas / exam_simulation)
- `chapter` (integer, nullable — null for mixed/exam)
- `score` (integer — percentage)
- `total_questions` (integer)
- `correct_count` (integer)
- `answers` (JSONB — array of { question_id, selected, correct, time_spent_seconds })
- `started_at` (timestamptz)
- `completed_at` (timestamptz)

### `chapter_summaries`
- `id` (UUID)
- `chapter_number` (integer, 1-20)
- `title` (text)
- `content` (text — markdown)
- `key_terms` (JSONB — array of { term, definition })
- `key_concepts` (JSONB — array of strings)

### `study_plans`
- `id` (UUID)
- `user_id` (UUID)
- `plan` (JSONB — week-by-week structure: array of { week, chapters, focus_type, hours })
- `generated_at` (timestamptz)
- `is_active` (boolean)

### `study_sessions`
- `id` (UUID)
- `user_id` (UUID)
- `scheduled_date` (date)
- `chapter` (integer)
- `activity_type` (text — flashcards / quiz / summary / practice_exam)
- `duration_minutes` (integer)
- `completed` (boolean)
- `completed_at` (timestamptz)

### `fun_facts`
- `id` (UUID)
- `chapter` (integer, 1-20)
- `emoji` (text)
- `fact` (text)
- `chapter_label` (text — e.g., "Ch 2 — Anatomy")

### `fun_fact_views`
- `id` (UUID)
- `user_id` (UUID)
- `fun_fact_id` (UUID)
- `viewed_at` (timestamptz)

## Features

### 1. Authentication

- Email/password signup and login via Supabase Auth
- Protected routes — all study features require login
- Row-Level Security on all tables so users only access their own data

### 2. New User Onboarding (~8 minutes)

Four-step flow after first login:

**Step 1 — Quick Profile (~30 seconds)**
- Exam date (date picker)
- Hours available per week (slider: 2-20)
- Prior fitness industry experience (none / some / extensive)

**Step 2 — Learning Style Assessment (~3-5 minutes)**
- 10-15 scenario-based multiple choice questions
- Scores the user on 4 dimensions:
  - **Visual** — learns from diagrams, charts, images
  - **Reading/Writing** — learns from text, notes, written explanations
  - **Active Recall** — learns by testing themselves repeatedly
  - **Practical** — learns by applying concepts to real scenarios
- Each dimension gets a 0-100 score. Users have a blend, not a single type.

**Step 3 — Knowledge Baseline (~3-5 minutes)**
- 10 questions sampled across all NASM chapters (1-2 per domain)
- Identifies which chapters the user already knows vs. weak areas
- Results stored as initial chapter mastery scores

**Step 4 — Personalized Study Plan (generated instantly)**
- Algorithm inputs: exam date, hours/week, learning style scores, baseline results, prior experience
- Outputs a week-by-week plan that:
  - Prioritizes weak chapters (lowest baseline scores first)
  - Allocates study methods matching top learning style dimensions
  - Distributes hours across the available weeks
  - Reserves final 1-2 weeks for full review and practice exams
  - Adapts over time as quiz scores and flashcard performance update mastery estimates

### 3. Flashcards

- Pre-loaded flashcard set covering all 20 NASM chapters
- Flip interaction — tap to reveal answer
- Self-rating: Didn't Know / Kinda Knew / Nailed It
- **Spaced repetition** — cards rated "Didn't Know" return sooner, "Nailed It" cards spaced out further. Uses a simplified SM-2 algorithm based on `next_review_at`.
- Filter by chapter or shuffle all
- Users can create custom flashcards

### 4. Practice Quizzes

- Pre-loaded question bank covering all 20 chapters
- Multiple choice (4 options) matching the real NASM exam format
- Every question includes a detailed explanation shown after answering
- **Quiz modes:**
  - By chapter — 10-20 questions from one chapter
  - Mixed review — random questions across studied chapters
  - Weak areas only — targets chapters below 60% mastery
  - Timed exam simulation — 120 questions in 2 hours, full exam experience
- Tracks time per question
- Results saved with per-question detail for analytics

### 5. Chapter Summaries

- Condensed notes for each of the 20 NASM CPT chapters
- Markdown content with key concepts and key terms
- Highlights terms the user has missed on quizzes (cross-referenced from quiz_results)
- Quick-launch buttons to start flashcards or quiz for that chapter

### 6. Study Schedule

- Weekly calendar view generated from the active study plan
- Each day shows: chapter, activity type, estimated duration
- Tracks completion (done / not done)
- Shows weekly hours target vs. completed
- Auto-adjusts: when the plan recalibrates (e.g., user masters a chapter early), upcoming sessions update

### 7. Stats & Analytics Dashboard

**Top-level metrics:**
- Overall Mastery % — weighted average of chapter mastery scores, derived from quiz performance
- Exam Readiness — on track / at risk / behind, with projected mastery by exam date based on current study pace and score trends
- Days Until Exam — countdown
- Study Streak — consecutive days with at least one completed session

**Exam Readiness Projection:**
- Chart showing mastery % over time with projected trajectory to exam date
- Compared against 70% NASM passing threshold
- Plain-language verdict: "At your current pace (X hrs/week, Y% quiz avg), you're projected to score ~Z% by exam day."

**Chapter Mastery Breakdown:**
- Horizontal bar chart per chapter, color-coded:
  - Green (80%+): mastered
  - Blue (60-79%): solid
  - Yellow (40-59%): needs work
  - Red (<40%): weak
- Mastery calculated from: quiz scores on that chapter (weighted 70%) + flashcard recall rate (weighted 30%)

**Learning Style Effectiveness:**
- Per learning dimension: retention rate over time with trend arrow (improving / steady / declining)
- Measures which study methods actually produce the best quiz score improvements for this user
- Used to refine study plan recommendations over time

**Study Habits & Performance:**
- Total study time + weekly average
- Quizzes taken + average score
- Flashcards reviewed + recall rate
- Best time of day (based on session timestamps vs. quiz scores)
- Weakest topic (lowest mastery chapter)
- Most improved topic (largest mastery gain in last 2 weeks)
- Plan adherence (sessions completed / sessions planned)
- Practice exams taken + scores

**Smart Alerts:**
- Chapter below 40% → alert + plan auto-adjusts to add sessions
- Chapter above 90% → moved to maintenance mode (1 review/week)
- Study pattern insight (e.g., "scores 18% higher in evening sessions")
- Weekly progress summary

### 8. Fun Facts — Chapter Teasers

- Pop-up overlay that appears between study activities (after a quiz, between flashcard sets, on app open)
- Never during active studying — only in transition moments
- Shows a fun/interesting fact from a chapter the user **hasn't studied yet**
- Each fact displays:
  - Emoji icon
  - The fact itself (1-2 sentences)
  - Which chapter it's from ("Coming up in Ch 14 — Nutrition")
  - Dismiss button ("Cool, got it!" / "Interesting!")
- One click dismisses — no further action required
- Frequency: ~1 per study session, never back-to-back
- Decreases as fewer unstudied chapters remain
- Once a chapter is completed, its facts stop appearing
- Tracks which facts a user has seen to avoid repeats

## Pages

1. `/` — Landing page (marketing, sign up CTA)
2. `/login` — Login
3. `/signup` — Sign up
4. `/onboarding` — 4-step onboarding flow (profile → assessment → baseline → plan)
5. `/dashboard` — Main hub: today's sessions, quick stats, fun fact trigger
6. `/flashcards` — Flashcard study interface with chapter filter
7. `/flashcards/create` — Create custom flashcards
8. `/quiz` — Quiz setup (choose mode, chapter)
9. `/quiz/[id]` — Active quiz
10. `/quiz/[id]/results` — Quiz results with explanations
11. `/chapters` — Chapter list with mastery indicators
12. `/chapters/[number]` — Chapter summary with key terms
13. `/schedule` — Weekly study schedule calendar
14. `/stats` — Full analytics dashboard
15. `/settings` — Profile, exam date, notification preferences

## Content Requirements

The app needs pre-loaded content for all 20 NASM CPT chapters:
- ~200-400 flashcards total
- ~500-800 quiz questions total with explanations
- 20 chapter summaries with key terms and concepts
- ~40-60 fun facts (2-3 per chapter)
- 10-15 learning style assessment questions
- 10 knowledge baseline questions (sampling all domains)

This content will be seeded into the database. Quiz questions and flashcards should match the 7th edition NASM CPT textbook topics.

## Adaptive Plan Algorithm

The study plan recalibrates after each quiz or study session:

1. Recalculate chapter mastery scores from all quiz results + flashcard performance
2. Compare current mastery trajectory against target (70%+ by exam date)
3. If a chapter crosses 90% mastery → reduce sessions, move to maintenance
4. If a chapter drops or stays below 50% after 2+ attempts → add extra sessions
5. Rebalance remaining hours across weeks, always preserving final review period
6. Update study_sessions for upcoming dates

## Non-Goals

- Mobile native app — web only (responsive design works on mobile browsers)
- Social features — no leaderboards, no sharing, no chat
- Payment/monetization — free app
- AI-generated questions — all content is pre-loaded, not generated on the fly
- Offline mode — requires internet connection
