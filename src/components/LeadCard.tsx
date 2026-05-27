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
  if (diff < 1000 * 60 * 60 * 24) return 'soon'
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
