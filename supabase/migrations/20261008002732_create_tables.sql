create type food_category as enum ('pizza', 'sandwiches', 'meals', 'snacks', 'desserts', 'drinks', 'other');

create type dietary_tag as enum ('vegetarian', 'vegan', 'halal', 'kosher', 'gluten_free', 'contains_nuts', 'contains_dairy');

create type quantity_level as enum ('a_little', 'some', 'lots');

create type post_status as enum ('available', 'running_low', 'gone');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (lower(email) like '%@gatech.edu'),
  display_name text,
  notifications_enabled boolean not null default false,
  notify_categories food_category[] default '{}' not null,
  notify_dietary_tags dietary_tag[] default '{}' not null,
  created_at timestamptz not null default now()
);

create table events(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  host_org text,
  building text not null,
  room text,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  created_by uuid not null default auth.uid() references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table food_posts(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category food_category not null,
  dietary_tags dietary_tag[] default '{}' not null,
  quantity quantity_level not null,
  building text not null,
  location_details text,
  latitude double precision,
  longitude double precision,
  photo_url text,
  event_id uuid references events(id) on delete cascade,
  status post_status not null default 'available',
  ai_suggested boolean not null default false,
  expires_at timestamptz not null default now() + interval '3 hours',
  created_by uuid not null default auth.uid() references profiles(id) on delete cascade,
  created_at timestamptz not null default now() check (created_at <= expires_at)
);

alter table profiles enable row level security;
alter table events enable row level security;
alter table food_posts enable row level security;

create policy "only self can read profile"
  on profiles for select to authenticated using (id = auth.uid());

create policy "only self can insert profile"
  on profiles for insert to authenticated with check (id = auth.uid());

create policy "only self can update profile"
  on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "no one can delete profile"
  on profiles for delete to authenticated using (false);

create policy "any logged in user can read events"
  on events for select to authenticated using (true);

create policy "only creator can insert event"
  on events for insert to authenticated with check (created_by = auth.uid());

create policy "only creator can update event"
  on events for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "only creator can delete event"
  on events for delete to authenticated using (created_by = auth.uid());

create policy "any logged in user can read food posts"
  on food_posts for select to authenticated using (true);

create policy "only creator can insert food post"
  on food_posts for insert to authenticated with check (created_by = auth.uid());

revoke update on food_posts from authenticated;
grant update (status, quantity) on food_posts to authenticated;
create policy "any logged in user can update food post status and quantity"
  on food_posts for update to authenticated using (true) with check (true);

create policy "only creator can delete food post"
  on food_posts for delete to authenticated using (created_by = auth.uid());
