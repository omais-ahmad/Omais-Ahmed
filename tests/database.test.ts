import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'

/**
 * Runs the real migration against an in-process Postgres (PGlite) and checks the security
 * rules: what a visitor, a signed-in non-admin and an admin can each read and write.
 *
 * Supabase provides the `auth` and `storage` schemas and the `anon` / `authenticated`
 * roles, so minimal stand-ins are created first. They deliberately copy Supabase's
 * permissive default (every role gets full table privileges), so the tests prove that row
 * level security is what protects the data, not a missing grant.
 */
const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;

  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;

  create schema storage;
  create table storage.buckets (
    id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]
  );
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated;
  grant all on storage.objects to anon, authenticated;
`

const ADMIN = '11111111-1111-1111-1111-111111111111'
const MEMBER = '22222222-2222-2222-2222-222222222222'

let db: PGlite

type Who = 'anon' | { user: string }

/** Runs SQL as a visitor or as a signed-in user, the way the Supabase API gateway does. */
async function as<T = Record<string, unknown>>(who: Who, sql: string, headers = '{}'): Promise<T[]> {
  const role = who === 'anon' ? 'anon' : 'authenticated'
  const sub = who === 'anon' ? '' : who.user
  await db.exec(`
    select set_config('request.jwt.claim.sub', '${sub}', false);
    select set_config('request.headers', '${headers}', false);
    set role ${role};
  `)
  try {
    return (await db.query<T>(sql)).rows
  } finally {
    await db.exec('reset role')
  }
}

const submit = (fields: Partial<Record<'name' | 'email' | 'subject' | 'message' | 'website', string>>, ip = '203.0.113.9') => {
  const value = { name: 'Ada Lovelace', email: 'ada@example.com', subject: 'Hello', message: 'A message that is long enough.', website: '', ...fields }
  const quote = (text: string) => `'${text.replace(/'/g, "''")}'`
  return as<{ result: { ok: boolean; error?: string } }>(
    'anon',
    `select public.submit_contact_message(${quote(value.name)}, ${quote(value.email)}, ${quote(value.subject)}, ${quote(value.message)}, ${quote(value.website)}) as result`,
    JSON.stringify({ 'x-forwarded-for': `${ip}, 10.0.0.1` }),
  ).then((rows) => rows[0]?.result)
}

beforeAll(async () => {
  const migration = await readFile(new URL('../supabase/migrations/0001_init.sql', import.meta.url), 'utf8')
  db = new PGlite()
  await db.exec(SUPABASE_STUBS)
  await db.exec(migration)
  // Running it twice must be harmless.
  await db.exec(migration)

  await db.exec(`
    insert into auth.users (id, email) values ('${ADMIN}', 'admin@example.com'), ('${MEMBER}', 'member@example.com');
    insert into public.admins (user_id) values ('${ADMIN}');
    insert into public.content_items (collection, data, position, published) values
      ('projects', '{"name": "Public project"}', 0, true),
      ('projects', '{"name": "Draft project"}', 1, false);
    insert into public.content_singletons (key, data) values ('profile', '{"name": "Omais Ahmed"}');
  `)
})

describe('content access', () => {
  it('shows visitors published items only', async () => {
    const rows = await as<{ name: string }>('anon', `select data->>'name' as name from public.content_items`)
    expect(rows.map((row) => row.name)).toEqual(['Public project'])
  })

  it('shows visitors the singletons', async () => {
    const rows = await as('anon', 'select key from public.content_singletons')
    expect(rows).toHaveLength(1)
  })

  it('hides drafts from signed-in users who are not admins', async () => {
    const rows = await as({ user: MEMBER }, 'select id from public.content_items')
    expect(rows).toHaveLength(1)
  })

  it('shows admins drafts as well', async () => {
    const rows = await as({ user: ADMIN }, 'select id from public.content_items')
    expect(rows).toHaveLength(2)
  })

  it('rejects writes from visitors', async () => {
    await expect(as('anon', `insert into public.content_items (collection, data) values ('projects', '{}')`)).rejects.toThrow(/row-level security|permission denied/)
    await expect(as('anon', `insert into public.content_singletons (key, data) values ('hero', '{}')`)).rejects.toThrow(/row-level security|permission denied/)
    // Updates and deletes match no rows instead of failing, so check that nothing changed.
    await as('anon', `update public.content_items set published = true`)
    await as('anon', `delete from public.content_items`)
    await as('anon', `update public.content_singletons set data = '{"name": "Hacked"}'`)
    const items = await as<{ published: boolean }>({ user: ADMIN }, 'select published from public.content_items order by position')
    expect(items.map((row) => row.published)).toEqual([true, false])
    const profile = await as<{ name: string }>('anon', `select data->>'name' as name from public.content_singletons where key = 'profile'`)
    expect(profile[0]?.name).toBe('Omais Ahmed')
  })

  it('rejects writes from signed-in users who are not admins', async () => {
    await expect(as({ user: MEMBER }, `insert into public.content_items (collection, data) values ('projects', '{}')`)).rejects.toThrow(/row-level security/)
    await as({ user: MEMBER }, `update public.content_items set published = true`)
    await as({ user: MEMBER }, `delete from public.content_items`)
    const items = await as<{ published: boolean }>({ user: ADMIN }, 'select published from public.content_items order by position')
    expect(items.map((row) => row.published)).toEqual([true, false])
  })

  it('lets admins create, update, reorder, publish and delete', async () => {
    const created = await as<{ id: string }>(
      { user: ADMIN },
      `insert into public.content_items (collection, data, position) values ('skillCategories', '{"name": "Temp"}', 5) returning id`,
    )
    const id = created[0]?.id
    expect(id).toBeTruthy()
    const updated = await as<{ published: boolean; position: number }>(
      { user: ADMIN },
      `update public.content_items set published = true, position = 2, data = '{"name": "Renamed"}' where id = '${id}' returning published, position`,
    )
    expect(updated[0]).toEqual({ published: true, position: 2 })
    await as({ user: ADMIN }, `insert into public.content_singletons (key, data) values ('seo', '{"title": "T"}') on conflict (key) do update set data = excluded.data`)
    await as({ user: ADMIN }, `delete from public.content_items where id = '${id}'`)
    await as({ user: ADMIN }, `delete from public.content_singletons where key = 'seo'`)
    expect(await as({ user: ADMIN }, `select id from public.content_items where id = '${id}'`)).toHaveLength(0)
  })

  it('refuses collections and keys that are not part of the model', async () => {
    await expect(as({ user: ADMIN }, `insert into public.content_items (collection, data) values ('users', '{}')`)).rejects.toThrow(/check constraint/)
    await expect(as({ user: ADMIN }, `insert into public.content_singletons (key, data) values ('secrets', '{}')`)).rejects.toThrow(/check constraint/)
  })
})

describe('admin authorization', () => {
  it('reports admin status correctly', async () => {
    expect((await as<{ ok: boolean }>('anon', 'select public.is_admin() as ok'))[0]?.ok).toBe(false)
    expect((await as<{ ok: boolean }>({ user: MEMBER }, 'select public.is_admin() as ok'))[0]?.ok).toBe(false)
    expect((await as<{ ok: boolean }>({ user: ADMIN }, 'select public.is_admin() as ok'))[0]?.ok).toBe(true)
  })

  it('does not let anyone read or edit the admins table through the API', async () => {
    expect(await as('anon', 'select * from public.admins')).toHaveLength(0)
    expect(await as({ user: MEMBER }, 'select * from public.admins')).toHaveLength(0)
    await expect(as({ user: MEMBER }, `insert into public.admins (user_id) values ('${MEMBER}')`)).rejects.toThrow(/row-level security/)
    expect((await as<{ ok: boolean }>({ user: MEMBER }, 'select public.is_admin() as ok'))[0]?.ok).toBe(false)
  })
})

describe('contact messages', () => {
  it('stores a valid message, trimmed and normalized', async () => {
    expect(await submit({ name: '  Ada Lovelace ', email: ' ADA@Example.com ' })).toEqual({ ok: true })
    const rows = await as<{ name: string; email: string; status: string }>({ user: ADMIN }, 'select name, email, status from public.contact_messages')
    expect(rows).toEqual([{ name: 'Ada Lovelace', email: 'ada@example.com', status: 'new' }])
  })

  it('validates every field on the server', async () => {
    expect(await submit({ name: 'A' }, '198.51.100.1')).toEqual({ ok: false, error: 'invalid_name' })
    expect(await submit({ email: 'not-an-email' }, '198.51.100.1')).toEqual({ ok: false, error: 'invalid_email' })
    expect(await submit({ subject: '' }, '198.51.100.1')).toEqual({ ok: false, error: 'invalid_subject' })
    expect(await submit({ message: 'short' }, '198.51.100.1')).toEqual({ ok: false, error: 'invalid_message' })
    expect(await submit({ message: 'x'.repeat(4001) }, '198.51.100.1')).toEqual({ ok: false, error: 'invalid_message' })
  })

  it('silently drops submissions that fill the honeypot', async () => {
    const before = await as({ user: ADMIN }, 'select id from public.contact_messages')
    expect(await submit({ website: 'https://spam.example', email: 'bot@example.com' }, '198.51.100.2')).toEqual({ ok: true })
    expect(await as({ user: ADMIN }, 'select id from public.contact_messages')).toHaveLength(before.length)
  })

  it('rate-limits a sender after three messages in an hour', async () => {
    const ip = '198.51.100.77'
    expect(await submit({ email: 'one@example.com' }, ip)).toEqual({ ok: true })
    expect(await submit({ email: 'two@example.com' }, ip)).toEqual({ ok: true })
    expect(await submit({ email: 'three@example.com' }, ip)).toEqual({ ok: true })
    expect(await submit({ email: 'four@example.com' }, ip)).toEqual({ ok: false, error: 'rate_limited' })
    // A different address is unaffected.
    expect(await submit({ email: 'other@example.com' }, '198.51.100.78')).toEqual({ ok: true })
  })

  it('also limits by email address when the network address changes', async () => {
    expect(await submit({ email: 'repeat@example.com' }, '192.0.2.1')).toEqual({ ok: true })
    expect(await submit({ email: 'repeat@example.com' }, '192.0.2.2')).toEqual({ ok: true })
    expect(await submit({ email: 'repeat@example.com' }, '192.0.2.3')).toEqual({ ok: true })
    expect(await submit({ email: 'repeat@example.com' }, '192.0.2.4')).toEqual({ ok: false, error: 'rate_limited' })
  })

  it('does not let visitors read, insert, change or delete messages directly', async () => {
    await expect(as('anon', 'select * from public.contact_messages')).rejects.toThrow(/permission denied/)
    await expect(
      as('anon', `insert into public.contact_messages (name, email, subject, message) values ('a', 'b', 'c', 'd')`),
    ).rejects.toThrow(/permission denied/)
    await expect(as('anon', 'delete from public.contact_messages')).rejects.toThrow(/permission denied/)
    expect(await as({ user: MEMBER }, 'select * from public.contact_messages')).toHaveLength(0)
    await expect(
      as({ user: MEMBER }, `insert into public.contact_messages (name, email, subject, message) values ('a', 'b', 'c', 'd')`),
    ).rejects.toThrow(/permission denied/)
  })

  it('lets admins triage and delete messages', async () => {
    const rows = await as<{ id: string }>({ user: ADMIN }, 'select id from public.contact_messages limit 1')
    const id = rows[0]?.id
    await as({ user: ADMIN }, `update public.contact_messages set status = 'archived' where id = '${id}'`)
    expect((await as<{ status: string }>({ user: ADMIN }, `select status from public.contact_messages where id = '${id}'`))[0]?.status).toBe('archived')
    await as({ user: ADMIN }, `delete from public.contact_messages where id = '${id}'`)
    expect(await as({ user: ADMIN }, `select id from public.contact_messages where id = '${id}'`)).toHaveLength(0)
  })
})

describe('media storage', () => {
  it('creates a bucket with a size limit and a MIME allow-list that excludes SVG', async () => {
    const { rows } = await db.query<{ public: boolean; file_size_limit: number; allowed_mime_types: string[] }>(
      `select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'media'`,
    )
    expect(rows[0]?.public).toBe(true)
    expect(Number(rows[0]?.file_size_limit)).toBe(5 * 1024 * 1024)
    expect(rows[0]?.allowed_mime_types).not.toContain('image/svg+xml')
  })

  it('only lets admins upload and delete', async () => {
    await expect(as('anon', `insert into storage.objects (bucket_id, name) values ('media', 'x.png')`)).rejects.toThrow(/row-level security/)
    await expect(as({ user: MEMBER }, `insert into storage.objects (bucket_id, name) values ('media', 'x.png')`)).rejects.toThrow(/row-level security/)
    await as({ user: ADMIN }, `insert into storage.objects (bucket_id, name) values ('media', 'cv/file.pdf')`)
    await expect(as({ user: ADMIN }, `insert into storage.objects (bucket_id, name) values ('other', 'x.png')`)).rejects.toThrow(/row-level security/)
    await as({ user: MEMBER }, `delete from storage.objects`)
    expect(await as({ user: ADMIN }, `select id from storage.objects`)).toHaveLength(1)
  })
})
