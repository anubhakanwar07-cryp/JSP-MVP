'use client'

import { useState } from 'react'
import type { Recruiter } from '@/types'

function ConfidenceBadge({ score }: { score: number }) {
  const cfg =
    score >= 80
      ? { cls: 'bg-green-900 text-green-400 border border-green-800', label: 'High' }
      : score >= 65
      ? { cls: 'bg-[#422006] text-orange-400 border border-orange-900', label: 'Med' }
      : { cls: 'bg-[#450a0a] text-red-400 border border-[#7f1d1d]', label: 'Low' }

  return (
    <span className={`${cfg.cls} rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap`}>
      {score}% · {cfg.label}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy(e: React.MouseEvent) {
    e.stopPropagation()
    try { await navigator.clipboard.writeText(text) } catch { /* omit fallback */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={`bg-transparent border-none text-[11px] cursor-pointer px-1 py-0.5 font-[inherit] transition-colors ${copied ? 'text-green-400' : 'text-[#555] hover:text-[#888]'}`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-[11px] text-blue-400 no-underline px-2 py-0.5 rounded border border-[#1e3a5f] bg-[#0f1f35] whitespace-nowrap transition-colors hover:bg-[#162d4a]"
    >
      {label}
    </a>
  )
}

function RecruiterRow({
  recruiter,
  selected,
  onToggle,
}: {
  recruiter: Recruiter
  selected: boolean
  onToggle: (r: Recruiter) => void
}) {
  return (
    <div
      onClick={() => onToggle(recruiter)}
      className={`rounded-lg px-4 py-4 cursor-pointer transition-all select-none border ${
        selected
          ? 'bg-[#0f1f18] border-green-800'
          : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox */}
        <div className={`mt-0.5 w-[18px] h-[18px] rounded shrink-0 flex items-center justify-center transition-all border-2 ${
          selected ? 'bg-green-400 border-green-400' : 'bg-transparent border-[#3a3a3a]'
        }`}>
          {selected && <span className="text-[11px] text-[#0f0f0f] font-bold">✓</span>}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[15px] font-semibold text-[#e5e5e5]">{recruiter.name}</span>
            <ConfidenceBadge score={recruiter.confidence} />
          </div>

          <div className="text-[13px] text-[#888] mb-2">
            {recruiter.role}
            <span className="text-[#444] mx-1.5">·</span>
            <span className="text-blue-400">{recruiter.company}</span>
            {recruiter.location && (
              <span className="text-[#444] text-xs ml-2">📍 {recruiter.location}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs text-[#aaa] font-mono bg-[#0f0f0f] px-2 py-0.5 rounded border border-[#2a2a2a]">
              {recruiter.email}
            </span>
            {recruiter.emailVerified ? (
              <span className="text-[10px] text-green-400 bg-green-900 px-1.5 py-0.5 rounded border border-green-800 font-semibold">
                ✓ Verified
              </span>
            ) : recruiter.email !== 'Email not found' ? (
              <span className="text-[10px] text-[#888] bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#2a2a2a]">
                Guessed
              </span>
            ) : null}
            <CopyButton text={recruiter.email} />
          </div>

          <div className="flex gap-2 flex-wrap">
            {recruiter.linkedin && <ExternalLink href={recruiter.linkedin} label="↗ LinkedIn" />}
            {recruiter.website && <ExternalLink href={recruiter.website} label="↗ Website" />}
          </div>
        </div>
      </div>
    </div>
  )
}

interface RecruiterListProps {
  recruiters: Recruiter[]
  onGenerateForSelected: (selected: Recruiter[]) => void
  generating: boolean
}

export default function RecruiterList({ recruiters, onGenerateForSelected, generating }: RecruiterListProps) {
  const [selected, setSelected] = useState<Recruiter[]>([])

  function toggleRecruiter(recruiter: Recruiter) {
    setSelected((prev) => {
      const exists = prev.find((r) => r.email === recruiter.email)
      return exists ? prev.filter((r) => r.email !== recruiter.email) : [...prev, recruiter]
    })
  }

  function selectAll() {
    setSelected(selected.length === recruiters.length ? [] : [...recruiters])
  }

  const selectedCount = selected.length

  return (
    <div>
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#e5e5e5] mb-0.5">Recruiter Leads</h2>
          <p className="text-[13px] text-[#888]">
            {recruiters.length} leads found · select to generate outreach drafts
          </p>
        </div>
        <button
          onClick={selectAll}
          className="text-xs text-[#888] bg-transparent border-none cursor-pointer font-[inherit] p-0 hover:text-[#e5e5e5] transition-colors"
        >
          {selected.length === recruiters.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-5">
        {recruiters.map((r) => (
          <RecruiterRow
            key={r.email}
            recruiter={r}
            selected={!!selected.find((s) => s.email === r.email)}
            onToggle={toggleRecruiter}
          />
        ))}
      </div>

      <button
        onClick={() => onGenerateForSelected(selected)}
        disabled={selectedCount === 0 || generating}
        className="w-full py-3 px-5 rounded-md text-sm font-semibold border-0 transition-colors font-[inherit] cursor-pointer bg-green-400 text-[#0f0f0f] hover:bg-green-500 disabled:bg-[#1f2e22] disabled:text-[#555] disabled:cursor-not-allowed"
      >
        {generating
          ? 'Generating drafts...'
          : selectedCount === 0
          ? 'Select recruiters to generate outreach'
          : `Generate Outreach for ${selectedCount} Recruiter${selectedCount > 1 ? 's' : ''} →`}
      </button>

      <p className="text-[11px] text-[#444] mt-3">
        · Source: Hunter.io · Emails verified via SMTP
      </p>
    </div>
  )
}
