create table campaign_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  lesson_id text not null,
  completed boolean default false,
  score integer default 0,
  xp_earned integer default 0,
  attempts integer default 1,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, lesson_id)
);

alter table campaign_progress enable row level security;
create policy "Users can view own campaign progress" on campaign_progress for select using (auth.uid() = user_id);
create policy "Users can insert own campaign progress" on campaign_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own campaign progress" on campaign_progress for update using (auth.uid() = user_id);

create table concept_mastery (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  concept_tag text not null,
  times_seen integer default 0,
  times_correct integer default 0,
  mastery integer default 0,
  last_seen_at timestamptz default now(),
  unique (user_id, concept_tag)
);

alter table concept_mastery enable row level security;
create policy "Users can view own concept mastery" on concept_mastery for select using (auth.uid() = user_id);
create policy "Users can insert own concept mastery" on concept_mastery for insert with check (auth.uid() = user_id);
create policy "Users can update own concept mastery" on concept_mastery for update using (auth.uid() = user_id);
