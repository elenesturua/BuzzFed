create type food_category as enum ('pizza', 'sandwiches', 'meals', 'snacks', 'desserts', 'drinks', 'other');

create type dietary_tag as enum ('vegetarian', 'vegan', 'halal', 'kosher', 'gluten_free', 'contains_nuts', 'contains_dairy');

create type quantity_level as enum ('a_little', 'some', 'lots');

create type post_status as enum ('available', 'running_low', 'gone');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email like '%@gatech.edu'),
  display_name text,
  notifications_enabled boolean not null default false,
  notify_categories food_category[] default '{}' not null,
  notify_dietary_tags dietary_tag[] default '{}' not null,
  created_at timestamptz not null default now()
);
