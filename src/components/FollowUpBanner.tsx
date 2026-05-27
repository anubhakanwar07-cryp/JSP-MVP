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
