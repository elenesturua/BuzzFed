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
