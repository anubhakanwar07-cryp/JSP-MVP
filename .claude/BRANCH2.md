# JSP — Branch 2: Traction Layer
# Complete Build Instructions for Claude Code

You are building Branch 2 (Traction Layer) of JSP on top of a working Branch 1.
Stack: Next.js 14 (App Router), Supabase, Tailwind, TypeScript strict.

---

## Design system — match Branch 1 exactly

```
Background:      #0f0f0f
Surface:         #1a1a1a
Border:          #2a2a2a
Text primary:    #e5e5e5
Text muted:      #888
Accent green:    #4ade80 / green-400
Blue accent:     blue-400 / #60a5fa
Orange accent:   orange-400 (follow-up warnings)
Red accent:      red-400 (errors, cold leads)
Font:            Inter (already loaded)
Radius:          rounded-xl for cards, rounded-md for inputs/buttons
```

Common classes already used in Branch 1:
```
Card:    bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl
Input:   bg-[#0f0f0f] border border-[#2a2a2a] rounded-md px-3.5 py-2.5 text-sm text-[#e5e5e5] focus:border-green-400 focus:outline-none
Button:  px-3.5 py-2 rounded-md text-xs font-medium cursor-pointer font-[inherit] border border-[#2a2a2a] transition-all
```

Do not introduce any new color palette, font, or component style.

---

## Read these files before writing any code

- `src/types/index.ts` — all existing types
- `src/lib/supabase/client.ts` — how Supabase is imported
- `src/app/layout.tsx` — where Nav goes
- `src/app/globals.css` — existing global styles
- `src/app/api/save-lead/route.ts` — pattern for Supabase API routes
- `supabase/schema.sql` — full table structure

---

## Step 0 — Schema additions (run in Supabase SQL Editor)

Add this to `supabase/schema.sql` at the bottom, then tell the user to run these two statements manually in their Supabase SQL Editor before proceeding:

```sql
-- Branch 2 schema additions
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS notes          text;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS interview_date date;

CREATE INDEX IF NOT EXISTS outreach_leads_followup_due_idx
  ON outreach_leads (followup_due_at)
  WHERE followup_due_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS outreach_leads_status_created_idx
  ON outreach_leads (outreach_status, created_at DESC);
```

---

## Step 1 — Type additions

Add to `src/types/index.ts`:

```typescript
// Full lead record returned from DB
export interface Lead {
  id: string
  company_name: string
  role_targeted: string
  candidate_name: string | null
  recruiter_name: string | null
  recruiter_role: string | null
  recruiter_email: string | null
  recruiter_linkedin: string | null
  outreach_message: string | null
  outreach_status: OutreachStatus
  email_status: EmailStatus
  followup_date: string | null
  followup_due_at: string | null
  followup_stage: FollowupStage | null
  last_followup_at: string | null
  sent_at: string | null
  your_name: string | null
  lead_type: string
  source: string
  confidence_score: number | null
  notes: string | null
  interview_date: string | null
  created_at: string
}

// Payload for PATCH /api/leads/[id]
export interface UpdateLeadPayload {
  outreach_status?: OutreachStatus
  notes?: string
  interview_date?: string | null
  followup_due_at?: string | null
  followup_stage?: FollowupStage | null
  last_followup_at?: string | null
  sent_at?: string | null
}

// Followup state for engine
export type FollowupState = 'pending' | 'reminded' | 'escalated' | 'cold' | 'cleared'
```

---

## Step 2 — API Routes

### 2a. GET /api/leads — fetch all leads

Create `src/app/api/leads/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { Lead } from '@/types'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('outreach_leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data as Lead[])
  } catch (err) {
    console.error('Unexpected error fetching leads:', err)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}
```

### 2b. PATCH /api/leads/[id] — update a single lead

Create `src/app/api/leads/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { UpdateLeadPayload } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 })

  try {
    const body = await request.json() as UpdateLeadPayload

    // If status set to 'sent' and no sent_at yet, write it now
    if (body.outreach_status === 'sent' && !body.sent_at) {
      const now = new Date()
      body.sent_at = now.toISOString()
      // Also set followup_due_at if not provided
      if (!body.followup_due_at) {
        const followupDate = new Date(now)
        followupDate.setDate(followupDate.getDate() + 3)
        body.followup_due_at = followupDate.toISOString()
        body.followup_stage = 'first_followup'
      }
    }

    // If status set to 'replied', clear followup state
    if (body.outreach_status === 'replied') {
      body.followup_stage = null
      body.followup_due_at = null
    }

    const { data, error } = await supabase
      .from('outreach_leads')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error updating lead:', err)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 })

  try {
    const { error } = await supabase
      .from('outreach_leads')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error deleting lead:', err)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
```

### 2c. GET /api/leads/followups-due — follow-up engine

Create `src/app/api/leads/followups-due/route.ts`:

This route does three things when called:
1. Finds all leads where `followup_due_at <= now()` and status is `sent` or `followup_due`
2. Updates `followup_stage` based on days elapsed since `sent_at`
3. Sends reminder emails via Resend for leads newly hitting `reminded` or `escalated`
4. Returns the updated overdue leads

```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { sendFollowupReminder } from '@/lib/email/resend'
import type { Lead, FollowupStage } from '@/types'

function getDaysElapsed(sentAt: string): number {
  const diff = Date.now() - new Date(sentAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function computeFollowupStage(daysElapsed: number): FollowupStage {
  if (daysElapsed >= 7) return 'going_cold'
  if (daysElapsed >= 5) return 'second_followup'
  return 'first_followup'
}

export async function GET() {
  try {
    const now = new Date().toISOString()

    // Fetch leads where followup is due and not yet closed/replied/cold
    const { data: leads, error } = await supabase
      .from('outreach_leads')
      .select('*')
      .lte('followup_due_at', now)
      .in('outreach_status', ['sent', 'followup_due'])
      .order('followup_due_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!leads || leads.length === 0) return NextResponse.json([])

    const updatedLeads: Lead[] = []

    for (const lead of leads as Lead[]) {
      if (!lead.sent_at) continue

      const daysElapsed = getDaysElapsed(lead.sent_at)
      const newStage    = computeFollowupStage(daysElapsed)
      const stageChanged = lead.followup_stage !== newStage

      // Compute new followup_due_at based on stage
      let newFollowupDate: string | null = lead.followup_due_at
      let newStatus: string = lead.outreach_status

      if (newStage === 'going_cold') {
        newStatus = 'cold'
        newFollowupDate = null
      } else if (newStage === 'second_followup' && lead.followup_stage === 'first_followup') {
        const d = new Date(lead.sent_at)
        d.setDate(d.getDate() + 7)
        newFollowupDate = d.toISOString()
        newStatus = 'followup_due'
      } else if (newStage === 'first_followup' && lead.outreach_status === 'sent') {
        newStatus = 'followup_due'
      }

      // Update in DB
      const { data: updated } = await supabase
        .from('outreach_leads')
        .update({
          followup_stage:  newStage,
          outreach_status: newStatus,
          followup_due_at: newFollowupDate,
        })
        .eq('id', lead.id)
        .select()
        .single()

      if (updated) updatedLeads.push(updated as Lead)

      // Send email reminder only when stage first changes (avoid repeat sends)
      if (stageChanged && process.env.RESEND_API_KEY && process.env.USER_NOTIFICATION_EMAIL) {
        await sendFollowupReminder({
          to:            process.env.USER_NOTIFICATION_EMAIL,
          companyName:   lead.company_name,
          recruiterName: lead.recruiter_name ?? 'the recruiter',
          role:          lead.role_targeted,
          daysElapsed,
          stage:         newStage,
          leadId:        lead.id,
        })
      }
    }

    return NextResponse.json(updatedLeads)
  } catch (err) {
    console.error('Followup engine error:', err)
    return NextResponse.json({ error: 'Follow-up check failed' }, { status: 500 })
  }
}
```

---

## Step 3 — Email helper

Install: `npm install resend`

Create `src/lib/email/resend.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface FollowupReminderParams {
  to: string
  companyName: string
  recruiterName: string
  role: string
  daysElapsed: number
  stage: string
  leadId: string
}

export async function sendFollowupReminder(params: FollowupReminderParams): Promise<void> {
  const { to, companyName, recruiterName, role, daysElapsed, stage, leadId } = params

  const isEscalation = stage === 'second_followup'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const subject = isEscalation
    ? `Still waiting on ${companyName} — going cold soon`
    : `Time to follow up with ${companyName}`

  const body = isEscalation
    ? `You reached out to ${recruiterName} at ${companyName} for a ${role} role ${daysElapsed} days ago. No reply yet — this one's going cold. Send a final follow-up now.`
    : `You reached out to ${recruiterName} at ${companyName} for a ${role} role ${daysElapsed} days ago. Now's a good time to follow up.`

  try {
    await resend.emails.send({
      from:    'JSP <reminders@yourdomain.com>',
      to,
      subject,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0f0f0f; color: #e5e5e5;">
          <h2 style="color: #4ade80; font-size: 16px; margin: 0 0 16px;">JSP Follow-up Reminder</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #888; margin: 0 0 24px;">${body}</p>
          <a href="${appUrl}/pipeline?lead=${leadId}"
             style="display: inline-block; background: #4ade80; color: #0f0f0f; text-decoration: none;
                    padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600;">
            View in Pipeline →
          </a>
        </div>
      `,
    })
  } catch (err) {
    // Email failures should never break the main flow
    console.error('Resend email error:', err)
  }
}
```

Add to `.env.local.example`:
```
RESEND_API_KEY=                    # resend.com → free up to 3000/month
USER_NOTIFICATION_EMAIL=           # email address to receive follow-up reminders
NEXT_PUBLIC_APP_URL=               # e.g. http://localhost:3000 or your deployed URL
```

---

## Step 4 — Navigation

Update `src/app/layout.tsx` to add Nav:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'JSP - Job Search Platform',
  description: 'Recruiter outreach workflow for candidates',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0f0f0f] text-[#e5e5e5] min-h-screen antialiased">
        <Nav />
        {children}
      </body>
    </html>
  )
}
```

Create `src/components/Nav.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()

  const links = [
    { href: '/',         label: 'Outreach' },
    { href: '/pipeline', label: 'Pipeline' },
  ]

  return (
    <nav className="border-b border-[#2a2a2a] bg-[#0f0f0f] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-green-400 font-bold text-sm tracking-tight">JSP</span>
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#1a1a1a] text-[#e5e5e5] border border-[#2a2a2a]'
                      : 'text-[#666] hover:text-[#aaa]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

---

## Step 5 — Pipeline page + Kanban board

Install: `npm install @hello-pangea/dnd`
Install types: `npm install --save-dev @types/hello-pangea__dnd` (only if needed — the package includes its own types)

### 5a. Pipeline page

Create `src/app/pipeline/page.tsx`:

This page:
1. Fetches all leads from `GET /api/leads` on mount
2. Calls `GET /api/leads/followups-due` on mount to update follow-up states
3. Shows `FollowUpBanner` if any overdue leads exist
4. Renders `KanbanBoard` with leads grouped by status
5. Handles optimistic status updates when cards are dragged

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import KanbanBoard from '@/components/KanbanBoard'
import FollowUpBanner from '@/components/FollowUpBanner'
import LeadDrawer from '@/components/LeadDrawer'
import type { Lead, OutreachStatus, UpdateLeadPayload } from '@/types'

export default function PipelinePage() {
  const [leads,          setLeads]          = useState<Lead[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [overdue,        setOverdue]        = useState<Lead[]>([])
  const [selectedLead,   setSelectedLead]   = useState<Lead | null>(null)
  const [drawerOpen,     setDrawerOpen]     = useState(false)

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads')
      if (!res.ok) throw new Error('Failed to fetch leads')
      const data = await res.json() as Lead[]
      setLeads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pipeline')
    } finally {
      setLoading(false)
    }
  }, [])

  const checkFollowups = useCallback(async () => {
    try {
      const res = await fetch('/api/leads/followups-due')
      if (!res.ok) return
      const updated = await res.json() as Lead[]
      if (updated.length > 0) {
        setOverdue(updated)
        // Merge updated leads into state
        setLeads((prev) =>
          prev.map((l) => updated.find((u) => u.id === l.id) ?? l)
        )
      }
    } catch {
      // Silent — follow-up check should never break the page
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    checkFollowups()
  }, [fetchLeads, checkFollowups])

  async function handleStatusChange(leadId: string, newStatus: OutreachStatus) {
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => l.id === leadId ? { ...l, outreach_status: newStatus } : l)
    )
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => prev ? { ...prev, outreach_status: newStatus } : prev)
    }

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outreach_status: newStatus } as UpdateLeadPayload),
      })
      if (!res.ok) throw new Error('Update failed')
      const updated = await res.json() as Lead
      setLeads((prev) => prev.map((l) => l.id === leadId ? updated : l))
      if (selectedLead?.id === leadId) setSelectedLead(updated)
    } catch {
      // Revert optimistic update
      fetchLeads()
    }
  }

  async function handleLeadUpdate(leadId: string, payload: UpdateLeadPayload) {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Update failed')
      const updated = await res.json() as Lead
      setLeads((prev) => prev.map((l) => l.id === leadId ? updated : l))
      if (selectedLead?.id === leadId) setSelectedLead(updated)
    } catch (err) {
      console.error('Lead update failed:', err)
    }
  }

  async function handleDeleteLead(leadId: string) {
    setLeads((prev) => prev.filter((l) => l.id !== leadId))
    setDrawerOpen(false)
    setSelectedLead(null)
    try {
      await fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
    } catch {
      fetchLeads() // revert if delete failed
    }
  }

  function handleCardClick(lead: Lead) {
    setSelectedLead(lead)
    setDrawerOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-[#555] text-sm">Loading pipeline...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="px-4 py-6 max-w-[1400px] mx-auto">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-[#e5e5e5]">Pipeline</h1>
          <p className="text-xs text-[#555] mt-0.5">
            {leads.length} lead{leads.length !== 1 ? 's' : ''} tracked
          </p>
        </div>

        {error && (
          <div className="bg-[#1a1a1a] border border-red-400 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {overdue.length > 0 && (
          <FollowUpBanner
            leads={overdue}
            onDismiss={() => setOverdue([])}
            onOpenLead={(lead) => handleCardClick(lead)}
          />
        )}

        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[#555] text-sm mb-3">No leads tracked yet.</p>
            <a
              href="/"
              className="text-green-400 text-sm hover:underline"
            >
              Start your first outreach →
            </a>
          </div>
        ) : (
          <KanbanBoard
            leads={leads}
            onStatusChange={handleStatusChange}
            onCardClick={handleCardClick}
          />
        )}
      </div>

      <LeadDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedLead(null) }}
        onUpdate={handleLeadUpdate}
        onDelete={handleDeleteLead}
      />
    </div>
  )
}
```

### 5b. KanbanBoard component

Create `src/components/KanbanBoard.tsx`:

Uses `@hello-pangea/dnd` for drag-and-drop. On drag end, calls `onStatusChange` with the new column's status.

```tsx
'use client'

import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import KanbanColumn from './KanbanColumn'
import type { Lead, OutreachStatus } from '@/types'

const COLUMNS: { status: OutreachStatus; label: string; color: string }[] = [
  { status: 'draft',        label: 'Draft',          color: 'text-[#555]' },
  { status: 'sent',         label: 'Sent',           color: 'text-blue-400' },
  { status: 'followup_due', label: 'Follow-up Due',  color: 'text-orange-400' },
  { status: 'followed_up',  label: 'Followed Up',    color: 'text-yellow-400' },
  { status: 'replied',      label: 'Replied',        color: 'text-green-400' },
  { status: 'cold',         label: 'Cold / Closed',  color: 'text-[#444]' },
]

interface KanbanBoardProps {
  leads: Lead[]
  onStatusChange: (leadId: string, newStatus: OutreachStatus) => void
  onCardClick: (lead: Lead) => void
}

export default function KanbanBoard({ leads, onStatusChange, onCardClick }: KanbanBoardProps) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newStatus = destination.droppableId as OutreachStatus
    const lead = leads.find((l) => l.id === draggableId)
    if (!lead || lead.outreach_status === newStatus) return
    onStatusChange(draggableId, newStatus)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            labelColor={col.color}
            leads={leads.filter((l) => l.outreach_status === col.status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
```

### 5c. KanbanColumn component

Create `src/components/KanbanColumn.tsx`:

```tsx
'use client'

import { Droppable } from '@hello-pangea/dnd'
import LeadCard from './LeadCard'
import type { Lead, OutreachStatus } from '@/types'

interface KanbanColumnProps {
  status: OutreachStatus
  label: string
  labelColor: string
  leads: Lead[]
  onCardClick: (lead: Lead) => void
}

export default function KanbanColumn({
  status, label, labelColor, leads, onCardClick
}: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-[220px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${labelColor}`}>
          {label}
        </span>
        <span className="text-[11px] text-[#444] bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>

      {/* Drop zone */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[80px] rounded-xl p-2 transition-colors ${
              snapshot.isDraggingOver
                ? 'bg-[#1f1f1f] border border-[#3a3a3a]'
                : 'bg-[#141414] border border-[#1f1f1f]'
            }`}
          >
            {leads.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-16">
                <p className="text-[11px] text-[#333]">Drop here</p>
              </div>
            )}
            {leads.map((lead, index) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
```

### 5d. LeadCard component

Create `src/components/LeadCard.tsx`:

```tsx
'use client'

import { Draggable } from '@hello-pangea/dnd'
import type { Lead } from '@/types'

interface LeadCardProps {
  lead: Lead
  index: number
  onClick: (lead: Lead) => void
}

function getDaysAgo(iso: string | null): string {
  if (!iso) return ''
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return '1d ago'
  return `${days}d ago`
}

function getFollowupUrgency(lead: Lead): 'overdue' | 'soon' | null {
  if (!lead.followup_due_at) return null
  const diff = new Date(lead.followup_due_at).getTime() - Date.now()
  if (diff < 0) return 'overdue'
  if (diff < 1000 * 60 * 60 * 24) return 'soon' // within 24h
  return null
}

export default function LeadCard({ lead, index, onClick }: LeadCardProps) {
  const urgency = getFollowupUrgency(lead)
  const isCold  = lead.outreach_status === 'cold' || lead.outreach_status === 'closed'

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(lead)}
          className={`mb-2 p-3 rounded-lg border cursor-pointer transition-all select-none ${
            snapshot.isDragging
              ? 'bg-[#252525] border-green-800 shadow-lg shadow-black/40 rotate-1'
              : isCold
              ? 'bg-[#141414] border-[#1f1f1f] opacity-50 hover:opacity-70'
              : urgency === 'overdue'
              ? 'bg-[#1a1a1a] border-orange-900 hover:border-orange-700'
              : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'
          }`}
        >
          <p className="text-[13px] font-semibold text-[#e5e5e5] leading-tight truncate">
            {lead.company_name}
          </p>
          <p className="text-[11px] text-[#666] truncate mt-0.5">
            {lead.role_targeted}
          </p>
          {lead.recruiter_name && (
            <p className="text-[10px] text-[#444] truncate mt-1">
              {lead.recruiter_name}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            {lead.sent_at && (
              <span className="text-[10px] text-[#444]">
                {getDaysAgo(lead.sent_at)}
              </span>
            )}
            {urgency === 'overdue' && (
              <span className="text-[10px] text-orange-400 font-medium">
                follow up
              </span>
            )}
            {lead.notes && (
              <span className="text-[10px] text-[#555]">📝</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
```

---

## Step 6 — Lead Drawer

Create `src/components/LeadDrawer.tsx`:

Slide-in panel from the right. Contains full lead detail, editable notes, status dropdown, interview date, follow-up actions, and delete.

```tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import type { Lead, OutreachStatus, UpdateLeadPayload, FollowupStage } from '@/types'

const STATUS_OPTIONS: { value: OutreachStatus; label: string }[] = [
  { value: 'draft',        label: 'Draft' },
  { value: 'sent',         label: 'Sent' },
  { value: 'followup_due', label: 'Follow-up Due' },
  { value: 'followed_up',  label: 'Followed Up' },
  { value: 'replied',      label: 'Replied' },
  { value: 'cold',         label: 'Cold' },
  { value: 'closed',       label: 'Closed' },
]

interface LeadDrawerProps {
  lead: Lead | null
  open: boolean
  onClose: () => void
  onUpdate: (leadId: string, payload: UpdateLeadPayload) => Promise<void>
  onDelete: (leadId: string) => Promise<void>
}

export default function LeadDrawer({ lead, open, onClose, onUpdate, onDelete }: LeadDrawerProps) {
  const [notes,          setNotes]          = useState('')
  const [interviewDate,  setInterviewDate]  = useState('')
  const [confirmDelete,  setConfirmDelete]  = useState(false)
  const [savingNotes,    setSavingNotes]    = useState(false)
  const notesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state when lead changes
  useEffect(() => {
    if (lead) {
      setNotes(lead.notes ?? '')
      setInterviewDate(lead.interview_date ?? '')
      setConfirmDelete(false)
    }
  }, [lead?.id])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleNotesChange(value: string) {
    setNotes(value)
    setSavingNotes(true)
    if (notesTimeout.current) clearTimeout(notesTimeout.current)
    notesTimeout.current = setTimeout(async () => {
      if (!lead) return
      await onUpdate(lead.id, { notes: value })
      setSavingNotes(false)
    }, 800) // auto-save after 800ms of inactivity
  }

  async function handleStatusChange(newStatus: OutreachStatus) {
    if (!lead) return
    await onUpdate(lead.id, { outreach_status: newStatus })
  }

  async function handleInterviewDateChange(value: string) {
    if (!lead) return
    setInterviewDate(value)
    await onUpdate(lead.id, { interview_date: value || null })
  }

  async function handleSnooze() {
    if (!lead) return
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + 2)
    await onUpdate(lead.id, { followup_due_at: newDate.toISOString() })
  }

  async function handleMarkFollowedUp() {
    if (!lead) return
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + 5)
    await onUpdate(lead.id, {
      outreach_status:  'followed_up',
      followup_due_at:  newDate.toISOString(),
      followup_stage:   'second_followup' as FollowupStage,
      last_followup_at: new Date().toISOString(),
    })
  }

  async function handleDelete() {
    if (!lead) return
    await onDelete(lead.id)
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const inputCls = 'w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-[#e5e5e5] placeholder:text-[#444] focus:border-green-400 focus:outline-none transition-colors font-[inherit]'
  const labelCls = 'block text-[11px] font-medium text-[#555] mb-1.5 tracking-[0.05em] uppercase'

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#111] border-l border-[#2a2a2a] z-50 overflow-y-auto transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {lead && (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-[#e5e5e5]">{lead.company_name}</h2>
                <p className="text-xs text-[#666] mt-0.5">{lead.role_targeted}</p>
              </div>
              <button
                onClick={onClose}
                className="text-[#555] hover:text-[#e5e5e5] bg-transparent border-none cursor-pointer text-lg p-1 font-[inherit]"
              >
                ✕
              </button>
            </div>

            {/* Recruiter info */}
            {lead.recruiter_name && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-4">
                <p className="text-[11px] text-[#555] uppercase tracking-[0.05em] mb-2">Recruiter</p>
                <p className="text-sm text-[#e5e5e5] font-medium">{lead.recruiter_name}</p>
                {lead.recruiter_role && <p className="text-xs text-[#666] mt-0.5">{lead.recruiter_role}</p>}
                {lead.recruiter_email && (
                  <p className="font-mono text-[11px] text-[#888] mt-2 bg-[#0f0f0f] px-2 py-1 rounded border border-[#2a2a2a] inline-block">
                    {lead.recruiter_email}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  {lead.recruiter_linkedin && (
                    <a
                      href={lead.recruiter_linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      ↗ LinkedIn
                    </a>
                  )}
                  {lead.recruiter_email && (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(lead.recruiter_email)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-green-400 hover:underline"
                    >
                      Open Gmail →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="mb-4">
              <label className={labelCls}>Status</label>
              <select
                value={lead.outreach_status}
                onChange={(e) => handleStatusChange(e.target.value as OutreachStatus)}
                className={`${inputCls} appearance-none cursor-pointer`}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#1a1a1a]">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Follow-up state */}
            {(lead.followup_stage || lead.followup_due_at) && (
              <div className="bg-[#1a1a00] border border-orange-900 rounded-xl p-4 mb-4">
                <p className="text-[11px] text-orange-400 uppercase tracking-[0.05em] font-semibold mb-2">
                  Follow-up
                </p>
                {lead.followup_due_at && (
                  <p className="text-xs text-[#888]">
                    Due: <span className="text-orange-400">{formatDate(lead.followup_due_at)}</span>
                  </p>
                )}
                {lead.followup_stage && (
                  <p className="text-xs text-[#555] mt-1 capitalize">
                    Stage: {lead.followup_stage.replace('_', ' ')}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleMarkFollowedUp}
                    className="text-[11px] px-2.5 py-1.5 rounded-md bg-orange-900 text-orange-300 border border-orange-800 cursor-pointer font-[inherit] hover:bg-orange-800 transition-colors"
                  >
                    Mark Followed Up
                  </button>
                  <button
                    onClick={handleSnooze}
                    className="text-[11px] px-2.5 py-1.5 rounded-md bg-[#1a1a1a] text-[#888] border border-[#2a2a2a] cursor-pointer font-[inherit] hover:text-[#e5e5e5] transition-colors"
                  >
                    Snooze 2 days
                  </button>
                </div>
              </div>
            )}

            {/* Interview date (show when replied or followed_up) */}
            {(lead.outreach_status === 'replied' || lead.outreach_status === 'followed_up' || lead.interview_date) && (
              <div className="mb-4">
                <label className={labelCls}>Interview Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => handleInterviewDateChange(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
                <p className="text-[10px] text-[#555] uppercase tracking-[0.05em] mb-1">Reached out</p>
                <p className="text-xs text-[#888]">{formatDate(lead.sent_at ?? lead.created_at)}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
                <p className="text-[10px] text-[#555] uppercase tracking-[0.05em] mb-1">Source</p>
                <p className="text-xs text-[#888] capitalize">{lead.source}</p>
              </div>
            </div>

            {/* Outreach message */}
            {lead.outreach_message && (
              <div className="mb-4">
                <p className="text-[11px] text-[#555] uppercase tracking-[0.05em] mb-2">Message sent</p>
                <pre className="text-[11px] text-[#666] leading-relaxed bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-3 whitespace-pre-wrap font-[inherit] max-h-40 overflow-y-auto">
                  {lead.outreach_message}
                </pre>
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls}>Notes</label>
                {savingNotes && <span className="text-[10px] text-[#444]">saving...</span>}
              </div>
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add notes — replies, feedback, next steps..."
                rows={4}
                className={`${inputCls} resize-y min-h-[96px] leading-relaxed text-[13px]`}
              />
            </div>

            {/* Delete */}
            <div className="border-t border-[#2a2a2a] pt-4">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-[#444] hover:text-red-400 bg-transparent border-none cursor-pointer font-[inherit] transition-colors"
                >
                  Delete lead
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#888]">Are you sure?</span>
                  <button
                    onClick={handleDelete}
                    className="text-xs text-red-400 bg-transparent border-none cursor-pointer font-[inherit] hover:underline"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-[#555] bg-transparent border-none cursor-pointer font-[inherit] hover:text-[#888]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
```

---

## Step 7 — Follow-up Banner

Create `src/components/FollowUpBanner.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { Lead } from '@/types'

interface FollowUpBannerProps {
  leads: Lead[]
  onDismiss: () => void
  onOpenLead: (lead: Lead) => void
}

export default function FollowUpBanner({ leads, onDismiss, onOpenLead }: FollowUpBannerProps) {
  const [expanded, setExpanded] = useState(false)
  const count = leads.length

  return (
    <div className="bg-[#1a0f00] border border-orange-900 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 text-sm">⏰</span>
          <p className="text-sm font-medium text-orange-300">
            {count} follow-up{count !== 1 ? 's' : ''} overdue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-orange-400 bg-transparent border-none cursor-pointer font-[inherit] hover:underline"
          >
            {expanded ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={onDismiss}
            className="text-[#555] hover:text-[#888] bg-transparent border-none cursor-pointer text-sm font-[inherit]"
          >
            ✕
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-1.5">
          {leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => onOpenLead(lead)}
              className="flex items-center justify-between text-left bg-[#1f1200] border border-orange-900/50 rounded-lg px-3 py-2 cursor-pointer font-[inherit] hover:border-orange-700 transition-colors w-full"
            >
              <div>
                <span className="text-xs text-[#e5e5e5] font-medium">{lead.company_name}</span>
                <span className="text-[11px] text-[#555] ml-2">{lead.role_targeted}</span>
              </div>
              <span className="text-[11px] text-orange-400 ml-3 flex-shrink-0">
                {lead.followup_stage === 'second_followup' ? 'Final follow-up' : 'Follow up now'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Step 8 — Final checks

1. Run `npm install` to ensure `@hello-pangea/dnd` and `resend` are installed
2. Add to `.env.local.example`:
   ```
   RESEND_API_KEY=
   USER_NOTIFICATION_EMAIL=
   NEXT_PUBLIC_APP_URL=
   ```
3. The `from` field in `resend.ts` (`reminders@yourdomain.com`) requires a verified domain in Resend. For local dev, Resend allows sending to your own email without a custom domain — just swap this to a verified sender or the user can update it when they set up their domain.
4. Tell the user to run the schema SQL in Supabase before testing the pipeline page.

---

## What NOT to do

- Do not touch anything in `src/app/page.tsx` (Branch 1 — fully working)
- Do not touch `src/components/InputForm.tsx`, `RecruiterList.tsx`, `OutreachQueue.tsx`
- Do not touch any existing API routes: `find-recruiter`, `generate-outreach`, `save-lead`, `generate-followup`
- Do not add analytics, charts, or stats — not in scope
- Do not add auth — single-user MVP
- Do not change the Tailwind config or globals.css
- No new fonts, icon libraries, or UI component libraries
- TypeScript strict — no `any` types
