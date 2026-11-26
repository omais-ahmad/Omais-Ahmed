# Omais Ahmed · Portfolio

Portfolio of Omais Ahmed, Full-Stack Software Engineer. A React and TypeScript site that is
prerendered to static HTML, with an optional Supabase backend that powers a protected admin
dashboard at `/admin`.

The site works without any backend: it renders from the content in
[`src/content/seed.ts`](src/content/seed.ts). Connecting Supabase adds live editing, contact
message storage and file uploads.

## Stack

| Concern | Choice |
| --- | --- |
| UI | React 19, TypeScript, React Router 7 |
| Build | Vite 7, with a prerender step that writes one HTML file per public route |
| Styling | Plain CSS with design tokens (`src/styles`), dark and light themes |
| Backend (optional) | Supabase: Postgres with row level security, Auth, Storage |
| Contact email | EmailJS |
| Tests | Vitest, with the SQL migration run against an in-process Postgres (PGlite) |
| Hosting | Netlify, configured in `netlify.toml` |

## Getting started

Requires Node 20 or newer.

```bash
npm install
npm run dev          # http://localhost:5173/
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Client build, server build, then prerender into `dist/` |
| `npm run preview` | Serves `dist/` locally |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm test` | Unit tests and database security tests |
| `npm run content:pull` | Snapshots published database content for the next build |

## Project structure

```
src/
  content/      Content model (types.ts), bundled content (seed.ts), blank records (defaults.ts)
  lib/          Configuration, content loading, contact submission, SEO, hooks
  components/   Header, footer, architecture diagram, icons, shared pieces
  sections/     Home page sections (hero, about, experience, skills, projects, ...)
  pages/        Home, project case study, not found
  admin/        Dashboard: schema-driven forms, CRUD manager, messages, CV, overview
  styles/       tokens.css, base.css, components.css, sections.css
scripts/
  prerender.mjs       Writes static HTML, sitemap.xml and robots.txt
  pull-content.mjs    Database snapshot for the build
supabase/migrations/  Database schema, security policies and storage bucket
tests/                Vitest suites
public/               Images, CV, favicon, social image
```

### How content flows

1. **Build time.** `prerender.mjs` renders every public route to HTML from the bundled content,
   or from a database snapshot when `content:pull` produced one. This is what search engines read.
2. **Run time.** If Supabase is configured, the page fetches the published content on load and
   re-renders with it, so edits made in `/admin` appear without a deployment.
3. **Deployment.** Re-running the workflow refreshes the static HTML and creates pages for
   projects added in the dashboard.

Every admin form is generated from the field definitions in
[`src/admin/schemas.ts`](src/admin/schemas.ts). To add a field: add it to `types.ts`, give it a
blank value in `defaults.ts`, and describe it in `schemas.ts`.

## Admin dashboard setup

The dashboard needs a Supabase project. The free tier is enough.

1. **Create a project** at [supabase.com](https://supabase.com).
2. **Create the schema.** Open the SQL editor, paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and run it.
3. **Create your account.** Authentication → Users → Add user. Use a strong password.
4. **Disable sign-ups.** Authentication → Sign In / Providers → turn off “Allow new users to sign up”.
5. **Make the account an admin.** In the SQL editor, with your email:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```

6. **Connect the site.** Copy the project URL and the `anon` key from Project Settings → API.
   - Locally: copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and
     `VITE_SUPABASE_ANON_KEY`.
   - On Netlify: Site configuration → Environment variables, add the same two names, then
     trigger a deploy.
7. **Import the content.** Open `/admin`, sign in and choose **Import bundled content**.

Never put the `service_role` key in an environment file, a repository variable or the code. The
site only needs the `anon` key.

### What the dashboard manages

Profile, hero, about, experience, projects, skills and skill categories, expertise, education,
certifications, highlights, languages, social links, the CV file, contact messages, SEO and
section visibility. Collections support create, edit, delete, reorder and publish or unpublish.

## Contact form

- **With Supabase:** the form calls the `submit_contact_message` database function, which
  validates every field, drops honeypot submissions, limits a sender to three messages an hour
  (forty an hour overall) and stores the message for the dashboard inbox. An EmailJS notification
  is then attempted; if it fails the message is still stored.
- **Without Supabase:** the message is sent through EmailJS only. Validation and the honeypot
  run in the browser, and EmailJS applies its own limits. The form reports a failure when the
  send fails.

The EmailJS identifiers are not stored in the repository. Set `VITE_EMAILJS_PUBLIC_KEY`,
`VITE_EMAILJS_SERVICE_ID` and `VITE_EMAILJS_TEMPLATE_ID` in `.env.local` for local work and in
Netlify's environment variables for the deployed site. The template receives `name`, `email`,
`subject`, `message`, `title` (same as the subject) and `time`.

## Deployment

The site is hosted on Netlify. [`netlify.toml`](netlify.toml) holds the whole configuration:
the build command (type-check, lint, test, snapshot content, build, prerender), the publish
directory (`dist`), the Node version, security and caching headers, and two fallback rules.

- **Continuous deployment.** In Netlify choose Add new site → Import an existing project and
  pick this repository. Every push to the production branch then builds and deploys.
- **Manual deployment.** `npm run build`, then `npx netlify-cli deploy --prod --dir=dist`.
- **Refreshing the static HTML** after editing content in `/admin`: Deploys → Trigger deploy.

The site URL comes from Netlify during a build, so canonical links and the sitemap follow a
custom domain automatically. For a manual build, or another host, set `VITE_SITE_URL` (and
`VITE_BASE_PATH` if the site is served from a sub-path) before building.

Projects published in `/admin` after the last deploy are served through the application shell
until the next deploy creates their static page.

## Security notes

- The browser never holds a privileged key. Row level security in the migration decides what
  each request can read or write, and the tests in `tests/database.test.ts` check those rules.
- “Admin” means a user id listed in `public.admins`, not any signed-in user. That table cannot be
  read or changed through the API.
- The `/admin` screens are a convenience, not the boundary: forcing the interface open gives no
  access, because the database refuses the requests.
- Uploads are limited to PNG, JPEG, WebP, AVIF and PDF up to 5 MB by the storage bucket itself.
  SVG is excluded because it can carry script.
- Links from content are rendered only when they start with `https://`, `http://` or `mailto:`.
- Contact messages are rendered as text, never as HTML.

## Testing

```bash
npm test
```

- `tests/database.test.ts` runs the real migration in PGlite and verifies what a visitor, a
  signed-in non-admin and an admin can each do, plus contact validation, the honeypot and rate
  limiting.
- `tests/content.test.ts` checks the bundled content (employment history, unique slugs, valid
  diagrams, referenced files exist) and the admin validation rules.
