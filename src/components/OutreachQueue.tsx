'use client'

import { useState } from 'react'
import type { QueueItem, OutreachStatus } from '@/types'

const btnBase = 'px-3.5 py-2 rounded-md text-xs font-medium cursor-pointer font-[inherit] border border-[#2a2a2a] transition-all'

function DraftCard({ item, onSave }: { item: QueueItem; onSave: (email: string, status: OutreachStatus) => void }) {
  const [copied, setCopied] = useState(false)
  const { recruiter, outreach, saving, saved } = item
  const fullText = `Subject: ${outreach.subject}\n\n${outreach.body}`

  async function handleCopy() {
    try { await navigator.clipboard.writeText(fullText) } catch { /* omit fallback */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-6 py-5 mb-3">
      {/* Recruiter header */}
      <div className="flex justify-between items-start mb-3.5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-[#e5e5e5]">{recruiter.name}</span>
            <span className="text-xs text-blue-400">{recruiter.company}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666]">{recruiter.role}</span>
            <span className="font-mono text-[11px] text-[#888] bg-[#0f0f0f] px-1.5 py-0.5 rounded border border-[#2a2a2a]">
              {recruiter.email}
            </span>
          </div>
        </div>
        {saved && (
          <span className="text-xs text-green-400 bg-green-900 px-2.5 py-1 rounded-full border border-green-800 whitespace-nowrap">
            ✓ Saved
          </span>
        )}
      </div>

      {/* Subject */}
      <div className="mb-2.5">
        <p className="text-[10px] font-semibold text-[#555] tracking-[0.08em] uppercase mb-1">Subject</p>
        <p className="text-[13px] text-[#d4d4d4] bg-[#0f0f0f] px-3 py-2 rounded border border-[#2a2a2a] font-medium">
          {outreach.subject}
        </p>
      </div>

      {/* Body */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold text-[#555] tracking-[0.08em] uppercase mb-1">Body</p>
        <pre className="text-xs leading-7 text-[#d4d4d4] bg-[#0f0f0f] px-3.5 py-3.5 rounded-md border border-[#2a2a2a] whitespace-pre-wrap break-words font-[inherit] m-0">
          {outreach.body}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleCopy}
          className={`${btnBase} ${copied ? 'bg-green-900 text-green-400 border-green-800' : 'bg-[#2a2a2a] text-[#e5e5e5] hover:bg-[#333] hover:border-[#3a3a3a]'}`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>

        <a
          href={`https://mail.google.com/mail/?authuser=${encodeURIComponent(process.env.NEXT_PUBLIC_SENDER_EMAIL ?? '')}&view=cm&to=${encodeURIComponent(recruiter.email)}&su=${encodeURIComponent(outreach.subject)}&body=${encodeURIComponent(outreach.body)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-[#2a2a2a] text-[#e5e5e5] hover:bg-[#333] hover:border-[#3a3a3a] no-underline inline-flex items-center`}
        >
          Open in Gmail
        </a>

        <button
          onClick={() => onSave(recruiter.email, 'sent')}
          disabled={saving || saved}
          className={`${btnBase} ${
            saved
              ? 'bg-green-900 text-green-400 border-green-800 cursor-not-allowed'
              : saving
              ? 'bg-[#1f2e22] text-[#555] border-[#1f2e22] cursor-not-allowed'
              : 'bg-green-400 text-[#0f0f0f] border-green-400 hover:bg-green-500'
          }`}
        >
          {saved ? 'Sent ✓' : saving ? 'Saving...' : 'Mark as Sent'}
        </button>

        <button
          onClick={() => onSave(recruiter.email, 'draft')}
          disabled={saving || saved}
          className={`${btnBase} bg-transparent ${saving || saved ? 'text-[#444] cursor-not-allowed' : 'text-[#888] hover:text-[#e5e5e5] hover:border-[#3a3a3a]'}`}
        >
          Save as Lead
        </button>

        {recruiter.linkedin && (
          <a
            href={recruiter.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBase} bg-[#0f1f35] text-blue-400 border-[#1e3a5f] no-underline inline-flex items-center hover:bg-[#162d4a]`}
          >
            ↗ LinkedIn
          </a>
        )}
      </div>
    </div>
  )
}

interface OutreachQueueProps {
  queue: QueueItem[]
  onSave: (recruiterEmail: string, status: OutreachStatus) => void
}

export default function OutreachQueue({ queue, onSave }: OutreachQueueProps) {
  const savedCount = queue.filter((i) => i.saved).length

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#e5e5e5] mb-1">Outreach Drafts</h2>
        <p className="text-[13px] text-[#888]">
          {queue.length} draft{queue.length > 1 ? 's' : ''} generated
          {savedCount > 0 && <span className="text-green-400 ml-2">· {savedCount} saved</span>}
        </p>
      </div>

      {queue.map((item) => (
        <DraftCard key={item.recruiter.email} item={item} onSave={onSave} />
      ))}
    </div>
  )
}
