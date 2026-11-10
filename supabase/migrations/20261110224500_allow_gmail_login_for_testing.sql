-- Temporary: allow @gmail.com signups so we can test while GT drops campus mail.
-- Remove gmail from this function (and the profiles check) before a real public launch.
create or replace function public.before_user_created(event jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  email text;
begin
  email := event -> 'user' ->> 'email';

  if email is null or email !~* '^[^[:space:]@]+@(gatech\.edu|gmail\.com)$' then
    return '{
      "error": {
        "http_code": 403,
        "message": "Only @gatech.edu or @gmail.com email addresses can sign up."
      }
    }'::jsonb;
  end if;

  return '{}'::jsonb;
end;
$$;

alter table public.profiles drop constraint if exists profiles_email_check;
alter table public.profiles add constraint profiles_email_check
  check (lower(email) like '%@gatech.edu' or lower(email) like '%@gmail.com');
