-- Live updates
alter publication supabase_realtime add table food_posts;

-- Food photos storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'food-photos', 'food-photos', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
);

create policy "users with a profile can upload food photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'food-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.profiles where profiles.id = auth.uid())
  );

create policy "users with a profile can view food photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'food-photos'
    and exists (select 1 from public.profiles where profiles.id = auth.uid())
  );

create policy "users can delete their own food photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'food-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- Create trigger to automatically create a profile for new users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Gmail accounts can also be used for now
insert into public.profiles (id, email)
select id, email from auth.users
where lower(email) like '%@gatech.edu' or lower(email) like '%@gmail.com'
on conflict (id) do nothing;

-- Max post duration
update food_posts
set expires_at = created_at + interval '12 hours'
where expires_at > created_at + interval '12 hours';

alter table food_posts add constraint food_posts_max_duration
  check (expires_at <= created_at + interval '12 hours');
