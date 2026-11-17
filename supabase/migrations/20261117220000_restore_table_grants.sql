-- Tables were missing SELECT/INSERT/UPDATE/DELETE for the API roles, so
-- PostgREST returned "permission denied for table …" even for signed-in users.
-- RLS policies still control what each user can see/change.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, delete on public.profiles to authenticated;
grant update (display_name, notifications_enabled, notify_categories, notify_dietary_tags)
  on public.profiles to authenticated;

grant select, insert, delete on public.food_posts to authenticated;
grant update (status, quantity) on public.food_posts to authenticated;

grant select, insert, update, delete on public.events to authenticated;

-- Enums / sequences used by inserts from the browser client.
grant usage on type public.food_category to authenticated;
grant usage on type public.dietary_tag to authenticated;
grant usage on type public.quantity_level to authenticated;
grant usage on type public.post_status to authenticated;
