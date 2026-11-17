-- Soft "looks gone" reports so one person cannot yank a listing.
-- Unique reporters only. After 2 reports, mark the post gone automatically.
-- The original poster can still mark gone immediately from the app.

create table public.food_gone_reports (
  post_id uuid not null references public.food_posts(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, reporter_id)
);

alter table public.food_gone_reports enable row level security;

grant select, insert on public.food_gone_reports to authenticated;

create policy "users with a profile can read gone reports"
  on public.food_gone_reports for select to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()));

create policy "users with a profile can report once"
  on public.food_gone_reports for insert to authenticated
  with check (
    reporter_id = auth.uid()
    and exists (select 1 from public.profiles where profiles.id = auth.uid())
    and exists (
      select 1 from public.food_posts
      where food_posts.id = post_id
        and food_posts.status <> 'gone'
        and food_posts.expires_at > now()
    )
  );

-- Only the poster can hard-set status/quantity from the client.
drop policy if exists "users with a profile can update food post status and quantity"
  on public.food_posts;

create policy "creator can update own post status and quantity"
  on public.food_posts for update to authenticated
  using (
    created_by = auth.uid()
    and exists (select 1 from public.profiles where profiles.id = auth.uid())
  )
  with check (
    created_by = auth.uid()
    and exists (select 1 from public.profiles where profiles.id = auth.uid())
  );

-- After enough independent reports, take the listing down.
create or replace function public.apply_gone_report_threshold()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  report_count integer;
begin
  select count(*)::integer into report_count
  from public.food_gone_reports
  where post_id = new.post_id;

  if report_count >= 2 then
    update public.food_posts
    set status = 'gone'
    where id = new.post_id
      and status <> 'gone';
  end if;

  return new;
end;
$$;

create trigger food_gone_reports_threshold
  after insert on public.food_gone_reports
  for each row execute function public.apply_gone_report_threshold();
