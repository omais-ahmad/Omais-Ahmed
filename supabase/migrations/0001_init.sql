-- Portfolio backend: content, contact messages, admin authorization and media storage.
--
-- Run once in the Supabase SQL editor (or with `supabase db push`). The script is
-- idempotent: running it again does not duplicate or destroy anything.
--
-- Security model
--   * The browser only ever holds the anon key. Row level security is what protects data.
--   * "Admin" is not "any signed-in user": it is a user whose id is listed in public.admins.
--     That table has no policies, so it can only be changed from the SQL editor.
--   * Visitors can read published content and nothing else.
--   * Visitors cannot insert contact messages directly. They call submit_contact_message(),
--     which validates, rate-limits and stores the message.

-- ---------------------------------------------------------------------------
-- Admin authorization
-- ---------------------------------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- Intentionally no policies: not readable or writable through the API.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- One row per list entry (a project, a job, a skill category ...). The entry itself is JSON
-- whose shape is defined in src/content/types.ts.
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (
    collection in (
      'experience', 'projects', 'skillCategories', 'expertise', 'education',
      'certifications', 'achievements', 'socialLinks', 'languages'
    )
  ),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_collection_position_idx
  on public.content_items (collection, position);

-- One row per single-instance section (profile, hero, about, seo, settings).
create table if not exists public.content_singletons (
  key text primary key check (key in ('profile', 'hero', 'about', 'seo', 'settings')),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

drop trigger if exists content_items_touch on public.content_items;
create trigger content_items_touch
  before update on public.content_items
  for each row execute function public.touch_updated_at();

drop trigger if exists content_singletons_touch on public.content_singletons;
create trigger content_singletons_touch
  before update on public.content_singletons
  for each row execute function public.touch_updated_at();

alter table public.content_items enable row level security;
alter table public.content_singletons enable row level security;

drop policy if exists "Published items are public" on public.content_items;
create policy "Published items are public"
  on public.content_items for select
  to anon, authenticated
  using (published or (select public.is_admin()));

drop policy if exists "Admins insert items" on public.content_items;
create policy "Admins insert items"
  on public.content_items for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins update items" on public.content_items;
create policy "Admins update items"
  on public.content_items for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins delete items" on public.content_items;
create policy "Admins delete items"
  on public.content_items for delete
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Singletons are public" on public.content_singletons;
create policy "Singletons are public"
  on public.content_singletons for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins insert singletons" on public.content_singletons;
create policy "Admins insert singletons"
  on public.content_singletons for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins update singletons" on public.content_singletons;
create policy "Admins update singletons"
  on public.content_singletons for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins delete singletons" on public.content_singletons;
create policy "Admins delete singletons"
  on public.content_singletons for delete
  to authenticated
  using ((select public.is_admin()));

grant select on public.content_items, public.content_singletons to anon, authenticated;
grant insert, update, delete on public.content_items, public.content_singletons to authenticated;

-- ---------------------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------------------

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  -- Salted hash of the sender address, kept only so that rate limiting can work.
  sender_hash text,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_sender_idx on public.contact_messages (sender_hash, created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "Admins read messages" on public.contact_messages;
create policy "Admins read messages"
  on public.contact_messages for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins update messages" on public.contact_messages;
create policy "Admins update messages"
  on public.contact_messages for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins delete messages" on public.contact_messages;
create policy "Admins delete messages"
  on public.contact_messages for delete
  to authenticated
  using ((select public.is_admin()));

-- No insert policy and no insert grant: the only way in is the function below.
revoke all on public.contact_messages from anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

-- Validates, rate-limits and stores one contact message.
-- Returns {"ok": true} or {"ok": false, "error": "<code>"}; it never raises for bad input.
create or replace function public.submit_contact_message(
  p_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_website text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_subject text := btrim(coalesce(p_subject, ''));
  v_message text := btrim(coalesce(p_message, ''));
  v_headers jsonb;
  v_address text;
  v_sender text;
  -- At most 3 messages per sender per hour, and 40 per hour overall.
  c_sender_limit constant integer := 3;
  c_global_limit constant integer := 40;
begin
  -- Honeypot: a real visitor never fills this field. Report success so a bot learns nothing.
  if btrim(coalesce(p_website, '')) <> '' then
    return jsonb_build_object('ok', true);
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 100 then
    return jsonb_build_object('ok', false, 'error', 'invalid_name');
  end if;
  if char_length(v_email) > 254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_email');
  end if;
  if char_length(v_subject) < 2 or char_length(v_subject) > 150 then
    return jsonb_build_object('ok', false, 'error', 'invalid_subject');
  end if;
  if char_length(v_message) < 10 or char_length(v_message) > 4000 then
    return jsonb_build_object('ok', false, 'error', 'invalid_message');
  end if;

  -- The API gateway passes request headers to the database as a setting.
  begin
    v_headers := nullif(current_setting('request.headers', true), '')::jsonb;
  exception when others then
    v_headers := null;
  end;
  v_address := coalesce(
    nullif(v_headers ->> 'cf-connecting-ip', ''),
    nullif(v_headers ->> 'x-real-ip', ''),
    nullif(btrim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)), ''),
    'unknown'
  );
  v_sender := encode(sha256(convert_to('portfolio-contact:' || v_address, 'UTF8')), 'hex');

  -- Serialize submissions so that two simultaneous requests cannot both pass the limit check.
  perform pg_advisory_xact_lock(hashtext('portfolio-contact'));

  if (
    select count(*) from public.contact_messages m
    where m.created_at > now() - interval '1 hour'
      and (m.sender_hash = v_sender or m.email = v_email)
  ) >= c_sender_limit then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  if (
    select count(*) from public.contact_messages m
    where m.created_at > now() - interval '1 hour'
  ) >= c_global_limit then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  insert into public.contact_messages (name, email, subject, message, sender_hash)
  values (v_name, v_email, v_subject, v_message, v_sender);

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.submit_contact_message(text, text, text, text, text) from public;
grant execute on function public.submit_contact_message(text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Media storage (project images, profile photo, CV)
-- ---------------------------------------------------------------------------

-- The size limit and MIME allow-list are enforced by the storage service itself, so an
-- upload that bypasses the dashboard's own checks is still rejected. SVG is excluded on
-- purpose: it can carry script.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Files in a public bucket are served by URL without a select policy. Listing, uploading,
-- replacing and deleting are restricted to admins.
drop policy if exists "Admins list media" on storage.objects;
create policy "Admins list media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "Admins upload media" on storage.objects;
create policy "Admins upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "Admins update media" on storage.objects;
create policy "Admins update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "Admins delete media" on storage.objects;
create policy "Admins delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- After running this script
-- ---------------------------------------------------------------------------
-- 1. Authentication -> Users -> Add user: create your admin account (email + password).
-- 2. Authentication -> Sign In / Providers: turn off "Allow new users to sign up".
-- 3. Make that account an admin (replace the email):
--
--      insert into public.admins (user_id)
--      select id from auth.users where email = 'you@example.com';
--
-- 4. Sign in at /admin and choose "Import bundled content".
