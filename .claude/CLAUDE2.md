# JSP — Branch 1 Completion Instructions for Claude Code

You are completing Branch 1 of JSP (Job Search Platform), a Next.js 14 app with Supabase and Tailwind.
The repo is at the root. Read the existing code before touching anything.

---

## What's already built — do not rewrite these

- `src/components/InputForm.tsx` — candidate context form (7 fields, working)
- `src/components/RecruiterList.tsx` — recruiter cards with select/deselect
- `src/components/OutreachQueue.tsx` — draft email cards with Gmail link and save
- `src/app/api/find-recruiter/route.ts` — Hunter.io + mock fallback
- `src/app/api/generate-outreach/route.ts` — email generation (template-based today)
- `src/app/api/save-lead/route.ts` — saves to Supabase `outreach_leads`
- `src/app/page.tsx` — 3-step orchestrator
- `src/types/index.ts` — all shared types
- `supabase/schema.sql` — `outreach_leads` table

Read every one of these files fully before starting.

---

## 6 Tasks to complete. Do them in this exact order.

---

### TASK 1 — Add `yourName` field to the form

**File:** `src/components/InputForm.tsx`
**File:** `src/types/index.ts`

In `types/index.ts` — add `yourName: string` to `CandidateForm` interface.

In `InputForm.tsx`:
- Add `yourName` state variable alongside the existing ones
- Add the input field inside the "About You" section, above the background field
- Label: "Your Full Name" with a Required marker
- Placeholder: "e.g. Anubha Kanwar"
- Add `yourName.trim()` to the `isReady` check so form won't submit without it
- Pass `yourName` in the `onSubmit` call

---

### TASK 2 — Wire OpenAI GPT-4 for email generation

**File:** `src/app/api/generate-outreach/route.ts`

First run: `npm install openai`

Replace the entire `buildEmailBody()` function and its call with a real OpenAI API call.
Keep `buildSubjectLine()` as-is — only the body generation changes.

The request body already has: `background`, `targetRole`, `achievements`, `company`, `recruiterName`, `recruiterRole`.
It will now also receive `yourName` — add that to the `GenerateOutreachBody` interface.

Use this exact implementation:

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Inside the POST handler, replace buildEmailBody() call with:
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  max_tokens: 600,
  response_format: { type: 'json_object' },
  messages: [
    {
      role: 'system',
      content: 'You are a world-class career coach who writes cold outreach emails. Always respond with valid JSON only: { "subject": "...", "body": "..." }'
    },
    {
      role: 'user',
      content: `Write a cold outreach email from a job seeker to a recruiter.

Sender: ${yourName}
Background: ${background}
Key achievements: ${achievements || 'not provided'}
Target role: ${targetRole}

Recruiter: ${recruiterName}, ${recruiterRole} at ${company}

Rules:
- 3 short paragraphs max
- Conversational tone, not corporate
- Reference ${company} specifically — why this company
- End with a low-friction ask: 15-minute call
- No filler openers like "I hope this email finds you well"
- Sign off with ${yourName}
- Return JSON only: { "subject": "...", "body": "..." }`
    }
  ]
})

const raw = completion.choices[0].message.content!
const parsed = JSON.parse(raw)
return NextResponse.json({ subject: parsed.subject, body: parsed.body })
```

If `OPENAI_API_KEY` is not set, fall back to the existing `buildEmailBody()` template — do not delete it, just move it to a fallback path.

Also pass `yourName` from `page.tsx` into the generate-outreach API call (see Task 5).

---

### TASK 3 — Make email body editable

**File:** `src/components/OutreachQueue.tsx`

In `DraftCard`:
- The email body is currently shown in a `<pre>` block — make it a `<textarea>` instead
- The textarea should be initialized with `outreach.body`
- Add local state: `const [editedBody, setEditedBody] = useState(outreach.body)`
- The textarea should use the same dark styling as other inputs in the app (`bg-[#0f0f0f] border border-[#2a2a2a]` etc)
- `rows={12}`, `resize-y`, full width
- When user copies or clicks "Open in Gmail" or "Mark as Sent" — use `editedBody` not `outreach.body`
- Update the Gmail compose URL and copy text to use `editedBody`
- Pass `editedBody` to `onSave` so the saved message reflects edits

Update `OutreachQueue`'s `onSave` call signature if needed to pass the edited body through.

---

### TASK 4 — Write `sent_at` and `followup_due_at` on Mark as Sent

**File:** `supabase/schema.sql`
**File:** `src/app/api/save-lead/route.ts`
**File:** `src/app/page.tsx`

In `schema.sql` — add these columns to the alter block (or as new statements at the bottom):
```sql
alter table outreach_leads
  add column if not exists sent_at         timestamp with time zone,
  add column if not exists followup_due_at timestamp with time zone,
  add column if not exists your_name       text,
  add column if not exists lead_type       text default 'outreach';
```

In `save-lead/route.ts`:
- Add `sent_at`, `followup_due_at`, `your_name`, `lead_type` to `SaveLeadPayload` interface (all optional)
- When `outreach_status === 'sent'`, set `sent_at = new Date().toISOString()` and `followup_due_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()` if not provided
- Insert these fields into the Supabase insert call

In `page.tsx` — in `handleSaveLead()`:
- Pass `your_name: formData.yourName` in the save payload
- Pass `lead_type: 'outreach'` in the save payload

---

### TASK 5 — Pass `yourName` through the full flow

**File:** `src/app/page.tsx`

- Add `yourName` to the initial `formData` state: `yourName: ''`
- In `handleGenerateForSelected()` — add `yourName: formData.yourName` to the generate-outreach API request body
- The type `CandidateForm` already has it after Task 1 — just wire it through

---

### TASK 6 — Empty state for zero recruiter results + mock data label

**File:** `src/components/RecruiterList.tsx`

Two changes:

1. If `recruiters.length === 0`, show an empty state instead of the list:
```
No recruiter leads found for these filters.
Try broadening your industry, location, or company stage.
[← Adjust filters] button that calls onBack (add this prop)
```

2. Add a subtle label at the bottom of the list (it already has a footnote line):
Change the existing `· Source: Hunter.io · Emails verified via SMTP` line to:
`· Contacts sourced via Hunter.io · Unverified contacts are pattern-matched and should be confirmed before sending`

This is honest without alarming users.

---

### TASK 7 — Update `.env.local.example`

**File:** `.env.local.example`

Add these lines:
```
OPENAI_API_KEY=                    # platform.openai.com → API Keys
NEXT_PUBLIC_SENDER_EMAIL=          # Your Gmail address (used in compose link)
```

---

## After all tasks — verify this flow works end to end

1. Fill form including name → submit
2. Recruiter list appears with honest source label
3. Select recruiters → generate
4. Email drafts appear with editable body
5. Edit body → Mark as Sent
6. Check Supabase `outreach_leads` table — confirm `sent_at`, `followup_due_at`, `your_name`, `lead_type` are all populated

---

## Rules

- Do not change the dark theme or any existing styling
- Do not add new npm packages except `openai`
- Do not touch `find-recruiter/route.ts` — Hunter logic stays as-is
- Do not refactor working code — only add what's needed
- Keep all existing mock fallback logic intact
- TypeScript strict — no `any` types
