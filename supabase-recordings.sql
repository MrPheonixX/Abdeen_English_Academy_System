-- Run this once in Supabase: SQL Editor > New query > paste > Run.
-- It makes a private place for recordings. Each person can only see their own files.
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

create policy "recordings read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "recordings insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "recordings update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "recordings delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
