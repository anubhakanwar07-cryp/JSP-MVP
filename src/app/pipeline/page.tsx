'use client'

import { useEffect, useState, useCallback } from 'react'
import KanbanBoard from '@/components/KanbanBoard'
import FollowUpBanner from '@/components/FollowUpBanner'
import LeadDrawer from '@/components/LeadDrawer'
import type { Lead, OutreachStatus, UpdateLeadPayload } from '@/types'

export default function PipelinePage() {
  const [leads,        setLeads]        = useState<Lead[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [overdue,      setOverdue]      = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [drawerOpen,   setDrawerOpen]   = useState(false)

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
