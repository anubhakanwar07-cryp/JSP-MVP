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
  const [notes,         setNotes]         = useState('')
  const [interviewDate, setInterviewDate] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [savingNotes,   setSavingNotes]   = useState(false)
  const notesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes ?? '')
      setInterviewDate(lead.interview_date ?? '')
      setConfirmDelete(false)
    }
  }, [lead?.id])

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
    }, 800)
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
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#111] border-l border-[#2a2a2a] z-50 overflow-y-auto transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {lead && (
          <div className="p-6">
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

            {lead.outreach_message && (
              <div className="mb-4">
                <p className="text-[11px] text-[#555] uppercase tracking-[0.05em] mb-2">Message sent</p>
                <pre className="text-[11px] text-[#666] leading-relaxed bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-3 whitespace-pre-wrap font-[inherit] max-h-40 overflow-y-auto">
                  {lead.outreach_message}
                </pre>
              </div>
            )}

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
