# JSP — Job Search Platform

Candidate-side recruiter outreach tool. Enter your background and target role, discover recruiter contacts, generate personalized outreach emails, save leads, and schedule follow-ups.

---

## What this does

1. **Enter context** — your name, background, achievements, target role, tone, and optional job description
2. **Discover recruiters** — searches Hunter.io by domain; falls back to curated demo data
3. **Add manually** — add any recruiter by name/email if you already have their contact
4. **Generate outreach** — personalized email per recruiter (OpenAI if configured, template fallback otherwise)
5. **Copy / open in Gmail** — one click to send
6. **Save lead** — stores to Supabase with status `draft` or `sent`
7. **Follow-up reminder** — when marked as sent, calculates follow-up date (Day +3) automatically
8. **Generate follow-up draft** — one click to generate a follow-up email per recruiter

---

## Current workflow

```
InputForm → /api/find-recruiter → RecruiterList
         → select recruiters
         → /api/generate-outreach (per recruiter)
         → OutreachQueue
         → copy / open Gmail / mark sent
         → /api/save-lead → Supabase
         → follow-up date shown
         → /api/generate-followup (on demand)
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
HUNTER_API_KEY=your-hunter-api-key          # optional — enables real recruiter discovery
OPENAI_API_KEY=your-openai-api-key          # optional — enables AI email generation
NEXT_PUBLIC_SENDER_EMAIL=you@gmail.com      # optional — pre-fills Gmail authuser
```

### 3. Run Supabase schema

In your Supabase project → SQL Editor → New query, paste `supabase/schema.sql` and run it.

If you have an existing `outreach_leads` table, run only the `ALTER TABLE` migration lines at the bottom of the schema file.

### 4. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `HUNTER_API_KEY` | No | Real recruiter email discovery via Hunter.io |
| `OPENAI_API_KEY` | No | AI-powered email generation (gpt-4o-mini) |
| `NEXT_PUBLIC_SENDER_EMAIL` | No | Pre-fills Gmail authuser in "Open in Gmail" link |

Without `HUNTER_API_KEY`: returns curated demo recruiter data (clearly labelled "Demo").  
Without `OPENAI_API_KEY`: uses template-based email generation.

---

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/find-recruiter` | POST | Discover recruiters via Hunter.io or demo fallback |
| `/api/generate-outreach` | POST | Generate personalized outreach email |
| `/api/generate-followup` | POST | Generate follow-up email draft |
| `/api/save-lead` | POST | Save outreach to Supabase, compute follow-up date |

---

## Folder structure

```
src/
  app/
    api/
      find-recruiter/route.ts     — recruiter discovery (Hunter + fallback)
      generate-outreach/route.ts  — outreach email generation
      generate-followup/route.ts  — follow-up email generation
      save-lead/route.ts          — save lead to Supabase with follow-up logic
    globals.css
    layout.tsx
    page.tsx                      — 3-step workflow orchestration
  components/
    InputForm.tsx                 — Step 1: candidate context + job details + tone
    RecruiterList.tsx             — Step 2: recruiter cards + manual entry
    OutreachQueue.tsx             — Step 3: email drafts + follow-up generation
  lib/
    supabase/client.ts            — Supabase client
  types/
    index.ts                      — all TypeScript types

supabase/
  schema.sql                      — table definition + migration comments
```

---

## Supabase schema

Table: `outreach_leads`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `company_name` | text | Target company |
| `role_targeted` | text | Target role |
| `candidate_name` | text | Sender name |
| `recruiter_name` | text | |
| `recruiter_role` | text | |
| `recruiter_email` | text | |
| `recruiter_linkedin` | text | |
| `outreach_message` | text | Full subject + body |
| `outreach_status` | text | `draft`, `sent`, `followup_due`, `followed_up`, `replied`, `cold`, `closed` |
| `email_status` | text | `verified`, `probable`, `unknown`, `fallback` |
| `sent_at` | timestamptz | Set when status = sent |
| `followup_date` | timestamptz | sent_at + 3 days |
| `followup_stage` | text | `first_followup`, `second_followup`, `going_cold` |
| `last_followup_at` | timestamptz | Updated on follow-up |
| `source` | text | `hunter`, `linkedin_scraper`, `fallback`, `manual` |
| `confidence_score` | integer | 0–100 |
| `created_at` | timestamptz | Auto |

---

## How to test the full flow

1. Run `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Fill in your name, background, and target role → click **Discover Recruiter Leads**
4. Review recruiter list — check source badge (Hunter / Demo) and email status badges
5. Try **Add Recruiter Manually** — enter a name, email, company → appears in list
6. Select one or more recruiters → click **Generate Outreach**
7. Review subject line and email body per recruiter
8. Click **Copy** or **Open in Gmail**
9. Click **Mark as Sent** — card shows follow-up date (+3 days)
10. Click **+ Follow-up Draft** — generates a ready-to-send follow-up email

---

## Current limitations

- No auth — all data is public within the Supabase project
- No lead dashboard — no UI to view saved leads (query Supabase directly)
- Hunter discovery limited to top 5 companies per search
- LinkedIn scraper is a placeholder (returns empty, ready to plug in)
- Follow-up reminders are shown in UI only — no email/push notifications
- No duplicate detection when saving leads
