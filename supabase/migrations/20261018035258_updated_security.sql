drop policy "only self can insert profile" on profiles;
create policy "users can create their own profile with their login email"
  on profiles for insert to authenticated
  with check (id = auth.uid() and email = auth.jwt() ->> 'email');

revoke update on profiles from authenticated;
grant update (display_name, notifications_enabled, notify_categories, notify_dietary_tags)
  on profiles to authenticated;

drop policy "any logged in user can read events" on events;
create policy "users with a profile can read events"
  on events for select to authenticated
  using (exists (select 1 from profiles where profiles.id = auth.uid()));

drop policy "any logged in user can read food posts" on food_posts;
create policy "users with a profile can read food posts"
  on food_posts for select to authenticated
  using (exists (select 1 from profiles where profiles.id = auth.uid()));

drop policy "any logged in user can update food post status and quantity" on food_posts;
create policy "users with a profile can update food post status and quantity"
  on food_posts for update to authenticated
  using (exists (select 1 from profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from profiles where profiles.id = auth.uid()));

alter table food_posts drop constraint food_posts_event_id_fkey;
alter table food_posts add constraint food_posts_event_id_fkey
  foreign key (event_id) references events(id) on delete set null;
