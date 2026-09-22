# Research Atlas

A private, personal scientific exploration environment that connects curiosity, learning, evidence,
invention and testing — six workspaces (Explore, Classroom, Research, Build, Test, Library) over five
fixed learning domains (Neuroscience & Cognition, Biological Sciences, Aging & Regenerative Science,
AI & Computational Science, Engineering & Technology).

Live: https://research-atlas-ten.vercel.app

## Status

This is the **P0** build: auth, the app shell, and core CRUD across all six workspaces, wired to a real
Supabase project with row-level security. One P1 feature is implemented early: **Explore with me** — a
real AI chat (Claude, via the Anthropic API) on each Question Explorer page that suggests concrete
topics to learn, one click from being added to Classroom or Library. The other AI modes (Teach me,
Research critic, etc.) are still placeholders. See `Research_Atlas_Detailed_Architecture_Revised` for
the full P0/P1/P2 phase breakdown this build follows.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** — design tokens live in `src/app/globals.css`
- **Supabase** — Postgres, Auth, Row Level Security, private Storage
- **Vercel** — hosting, auto-deploys from GitHub pushes to `main`

## Project structure

```
src/
  app/
    (auth)/login, (auth)/auth/callback   — sign in/up, email confirmation callback
    (app)/...                            — every workspace route, behind auth (see src/app/(app)/layout.tsx)
  components/
    shell/                               — sidebar, top bar, quick capture, account menu
    shared/                              — RecordCard, StatusBadge, TopicPicker, FileUploader, etc.
    explore/, classroom/, research/, build/, test/, library/  — per-workspace forms
  lib/
    supabase/                            — browser/server/middleware Supabase clients
    data/                                — typed read queries, one module per workspace
    actions/                             — server actions (mutations), one module per workspace
    validation/schemas.ts                — Zod schemas matching the SQL CHECK constraints
    types/domain.ts                      — hand types mirroring the schema; database.types.ts is generated
    constants/                           — the five fixed domains, workspace nav
supabase/migrations/                     — schema history; the initial schema is 00000000000001_schema.sql
```

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase project's URL and **anon public**
   key (Supabase dashboard → Project Settings → API). The anon key is safe to expose client-side — it's
   the whole point of that key, protected by RLS. Also add `ANTHROPIC_API_KEY` (from
   console.anthropic.com) to enable the Explore chat — this one is a real secret, keep it server-only.
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Database schema

The schema lives in `supabase/migrations/`. To apply it to a Supabase project via the CLI:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

After schema changes, regenerate types:

```bash
npx supabase gen types typescript --linked > src/lib/types/database.types.ts
```

Never rename a migration file to end in `_init` — the Supabase CLI treats that as reserved and silently
skips it.

## Deployment

Deploys to Vercel on every push to `main` (GitHub repo: `LAUNCHLAB007/research-atlas`). Required
environment variables on Vercel (Project Settings → Environment Variables):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — add with `--type config`, since it's meant to be public, not `--type secret`

To deploy manually:

```bash
npx vercel --prod
```

## What's next (not yet built)

Per the architecture doc's phase plan:

- **P1**: selectable AI modes (Explore/Teach/Read/Research critic/Design/Test with me), source-grounded
  paper assistance, richer question exploration, fuller revision/audit history.
- **P2**: interactive knowledge graph, optional repo/notebook integrations, sandboxed code execution,
  collaboration.
