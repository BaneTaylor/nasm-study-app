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
