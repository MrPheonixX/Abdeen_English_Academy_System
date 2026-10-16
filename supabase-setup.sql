-- Run this once in Supabase: SQL Editor > New query > paste > Run.
create table if not exists public.academy_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.academy_progress enable row level security;

create policy "read own progress" on public.academy_progress
  for select using (auth.uid() = user_id);
create policy "insert own progress" on public.academy_progress
  for insert with check (auth.uid() = user_id);
create policy "update own progress" on public.academy_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
