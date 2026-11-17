-- Food photos need to render on the feed/detail pages. Keep uploads
-- restricted to the owner's folder; allow anyone with the URL to view.
update storage.buckets
set public = true
where id = 'food-photos';

drop policy if exists "users with a profile can view food photos" on storage.objects;

create policy "anyone can view food photos"
  on storage.objects for select
  to public
  using (bucket_id = 'food-photos');
