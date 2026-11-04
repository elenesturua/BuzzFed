-- Registered this function under Authentication > Hooks > Before User Created
-- Blocks non @gatech emails
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

  -- Require an email ending in exactly @gatech.edu, ignoring letter case
  -- The part before @ must be nonempty and contain no spaces or extra @ signs
  if email is null or email !~* '^[^[:space:]@]+@gatech\.edu$' then
    return '{
      "error": {
        "http_code": 403,
        "message": "Only @gatech.edu email addresses can sign up."
      }
    }'::jsonb;
  end if;

  return '{}'::jsonb;
end;
$$;

grant usage on schema public to supabase_auth_admin;
revoke execute on function public.before_user_created(jsonb) from public, anon, authenticated;
grant execute on function public.before_user_created(jsonb) to supabase_auth_admin;
