'use client'

import { useEffect, useState, useCallback } from 'react'
import KanbanBoard from '@/components/KanbanBoard'
import FollowUpBanner from '@/components/FollowUpBanner'
import LeadDrawer from '@/components/LeadDrawer'
import type { Lead, OutreachStatus, UpdateLeadPayload } from '@/types'

const MOCK_LEADS: Lead[] = [
  {
    id: 'mock-1', company_name: 'Razorpay', role_targeted: 'Senior Software Engineer',
    candidate_name: 'Anubha Kanwar', recruiter_name: 'Priya Sharma',
    recruiter_role: 'Technical Recruiter', recruiter_email: 'p.sharma@razorpay.com',
    recruiter_linkedin: null, outreach_message: 'Subject: Ex-fintech engineer — SDE2 at Razorpay?\n\nHi Priya,\n\nI have 4 years in backend engineering (Go, Postgres) and led infra at a Series B startup...',
    outreach_status: 'sent', email_status: 'verified', followup_date: null,
    followup_due_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    followup_stage: 'first_followup', last_followup_at: null,
    sent_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    your_name: 'Anubha', lead_type: 'outreach', source: 'hunter',
    confidence_score: 85, notes: null, interview_date: null,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'mock-2', company_name: 'Stripe', role_targeted: 'Staff Engineer',
    candidate_name: 'Anubha Kanwar', recruiter_name: 'Alex Chen',
    recruiter_role: 'Engineering Recruiter', recruiter_email: 'alex.chen@stripe.com',
    recruiter_linkedin: null, outreach_message: null,
    outreach_status: 'replied', email_status: 'verified', followup_date: null,
    followup_due_at: null, followup_stage: null, last_followup_at: null,
    sent_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    your_name: 'Anubha', lead_type: 'outreach', source: 'hunter',
    confidence_score: 90, notes: 'Replied — scheduling a call for next week. Very positive tone.',
    interview_date: null,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'mock-3', company_name: 'Linear', role_targeted: 'Senior Backend Engineer',
    candidate_name: 'Anubha Kanwar', recruiter_name: 'Sarah Kim',
    recruiter_role: 'Talent Lead', recruiter_email: 's.kim@linear.app',
    recruiter_linkedin: null, outreach_message: null,
    outreach_status: 'followup_due', email_status: 'probable', followup_date: null,
    followup_due_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    followup_stage: 'first_followup', last_followup_at: null,
    sent_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    your_name: 'Anubha', lead_type: 'outreach', source: 'hunter',
    confidence_score: 72, notes: null, interview_date: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'mock-4', company_name: 'Vercel', role_targeted: 'Platform Engineer',
    candidate_name: 'Anubha Kanwar', recruiter_name: 'Raj Patel',
    recruiter_role: 'Senior Recruiter', recruiter_email: 'r.patel@vercel.com',
    recruiter_linkedin: null, outreach_message: null,
    outreach_status: 'draft', email_status: 'unknown', followup_date: null,
    followup_due_at: null, followup_stage: null, last_followup_at: null,
    sent_at: null, your_name: 'Anubha', lead_type: 'outreach', source: 'manual',
    confidence_score: 60, notes: null, interview_date: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'mock-5', company_name: 'Notion', role_targeted: 'Backend Engineer',
    candidate_name: 'Anubha Kanwar', recruiter_name: 'Lisa Wang',
    recruiter_role: 'Technical Recruiter', recruiter_email: 'l.wang@notion.so',
    recruiter_linkedin: null, outreach_message: null,
    outreach_status: 'followed_up', email_status: 'verified', followup_date: null,
    followup_due_at: new Date(Date.now() + 2 * 86400000).toISOString(),
    followup_stage: 'second_followup', last_followup_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    sent_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    your_name: 'Anubha', lead_type: 'outreach', source: 'hunter',
    confidence_score: 78, notes: 'Sent follow-up. No reply yet.',
    interview_date: null,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'mock-6', company_name: 'Zepto', role_targeted: 'SDE2 — Backend',
    candidate_name: 'Anubha Kanwar', recruiter_name: 'Neha Gupta',
    recruiter_role: 'HR Manager', recruiter_email: 'n.gupta@zepto.com',
    recruiter_linkedin: null, outreach_message: null,
    outreach_status: 'cold', email_status: 'fallback', followup_date: null,
    followup_due_at: null, followup_stage: 'going_cold', last_followup_at: null,
    sent_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    your_name: 'Anubha', lead_type: 'outreach', source: 'fallback',
    confidence_score: 55, notes: null, interview_date: null,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
]

export default function PipelinePage() {
  const [leads,        setLeads]        = useState<Lead[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [overdue,      setOverdue]      = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [isMock,       setIsMock]       = useState(false)

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads')
      if (!res.ok) throw new Error('Failed to fetch leads')
      const data = await res.json() as Lead[]
      if (data.length > 0) { setLeads(data) } else { setLeads(MOCK_LEADS); setIsMock(true) }
    } catch {
      setLeads(MOCK_LEADS); setIsMock(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkFollowups = useCallback(async () => {
    try {
      const res = await fetch('/api/leads/followups-due')
      if (!res.ok) return
      const updated = await res.json() as Lead[]
      if (Array.isArray(updated) && updated.length > 0) {
        setOverdue(updated)
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
      fetchLeads()
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

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-[#e5e5e5]">Pipeline</h1>
            {isMock && (
              <span className="text-[10px] font-semibold text-yellow-600 bg-[#2a1f00] border border-[#3d2d00] px-2 py-0.5 rounded">
                Demo data
              </span>
            )}
          </div>
          <p className="text-xs text-[#555] mt-0.5">
            {leads.length} lead{leads.length !== 1 ? 's' : ''} tracked
            {isMock && ' · connect Supabase to see real leads'}
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
            <a href="/" className="text-green-400 text-sm hover:underline">
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
