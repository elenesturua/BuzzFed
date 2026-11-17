-- Uploads were failing for signed-in users. Ownership of the folder is
-- enough; requiring a visible profiles row inside the storage policy was
-- brittle under RLS. Keep deletes owner-only; reads stay public.
drop policy if exists "users with a profile can upload food photos to their own folder"
  on storage.objects;

create policy "users can upload food photos to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'food-photos'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

-- Storage upload also checks SELECT on the new object in some paths.
drop policy if exists "anyone can view food photos" on storage.objects;

create policy "anyone can view food photos"
  on storage.objects for select
  to public
  using (bucket_id = 'food-photos');
