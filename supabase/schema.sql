-- JSP (Job Search Platform) — Supabase Schema
-- Run this in your Supabase project's SQL Editor

create table if not exists outreach_leads (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  role_targeted text not null,
  recruiter_name text,
  recruiter_role text,
  recruiter_email text,
  outreach_message text,
  outreach_status text default 'draft',
  followup_date date,
  source text default 'mock',
  confidence_score integer,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Optional: Add an index on company_name for faster lookups
create index if not exists outreach_leads_company_name_idx
  on outreach_leads (company_name);

-- Optional: Add an index on outreach_status for filtering by sent/draft
create index if not exists outreach_leads_status_idx
  on outreach_leads (outreach_status);
