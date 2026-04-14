create table question_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  question_id uuid references questions on delete cascade not null,
  times_seen integer default 0,
  times_correct integer default 0,
  last_seen_at timestamptz,
  next_review_at timestamptz default now(),
  unique (user_id, question_id)
);

alter table question_progress enable row level security;
create policy "Users can view own question progress" on question_progress for select using (auth.uid() = user_id);
create policy "Users can insert own question progress" on question_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own question progress" on question_progress for update using (auth.uid() = user_id);
