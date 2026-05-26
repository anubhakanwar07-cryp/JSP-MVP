-- JSP (Job Search Platform) — Supabase Schema
-- Run this in your Supabase project's SQL Editor

-- ─── Main table ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS outreach_leads (
  id                  uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name        text    NOT NULL,
  role_targeted       text    NOT NULL,
  candidate_name      text,
  recruiter_name      text,
  recruiter_role      text,
  recruiter_email     text,
  recruiter_linkedin  text,
  outreach_message    text,
  outreach_status     text    DEFAULT 'draft',
  email_status        text    DEFAULT 'unknown',
  followup_date       timestamp with time zone,
  followup_due_at     timestamp with time zone,
  followup_stage      text,
  last_followup_at    timestamp with time zone,
  sent_at             timestamp with time zone,
  your_name           text,
  lead_type           text    DEFAULT 'outreach',
  source              text    DEFAULT 'fallback',
  confidence_score    integer,
  created_at          timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- ─── Indexes ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS outreach_leads_company_name_idx   ON outreach_leads (company_name);
CREATE INDEX IF NOT EXISTS outreach_leads_status_idx         ON outreach_leads (outreach_status);
CREATE INDEX IF NOT EXISTS outreach_leads_followup_date_idx  ON outreach_leads (followup_date);

-- ─── Migration: if table already exists, add new columns ────────────────────────
-- Run these ALTER statements separately if you already have the table:
--
-- ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS candidate_name     text;
-- ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS recruiter_linkedin text;
-- ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS email_status       text DEFAULT 'unknown';
-- ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS followup_stage     text;
-- ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS last_followup_at   timestamp with time zone;
-- ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS sent_at            timestamp with time zone;
-- ALTER TABLE outreach_leads ALTER COLUMN followup_date TYPE timestamp with time zone USING followup_date::timestamp with time zone;
-- CREATE INDEX IF NOT EXISTS outreach_leads_followup_date_idx ON outreach_leads (followup_date);
--
-- Branch 1 additions:
-- ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS followup_due_at timestamp with time zone;
-- ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS your_name       text;
-- ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS lead_type       text DEFAULT 'outreach';
